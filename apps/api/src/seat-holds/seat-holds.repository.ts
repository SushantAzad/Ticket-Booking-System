import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface SeatLockResult {
  success: boolean;
  failedSeatId?: string;
  reason?: 'NOT_FOUND' | 'NOT_AVAILABLE' | 'VERSION_MISMATCH';
}

/**
 * SeatHoldsRepository
 *
 * This is the only file in the system that contains the SELECT ... FOR UPDATE locking sequence.
 * All concurrency guarantees for seat holds are enforced here and nowhere else.
 *
 * The strategy is pessimistic locking:
 *   1. SELECT ... FOR UPDATE acquires a row-level lock on the specific show_seats row.
 *   2. A second concurrent transaction attempting to lock the same row blocks until the
 *      first commits or rolls back.
 *   3. The version column acts as a belt-and-suspenders guard: even if application code
 *      somehow reads a seat's status outside a FOR UPDATE lock (e.g., a cached read),
 *      the conditional UPDATE WHERE ... AND version = $3 will match zero rows on a
 *      stale write, preventing silent overwrites.
 */
@Injectable()
export class SeatHoldsRepository {
  private readonly logger = new Logger(SeatHoldsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically creates a hold for the given seats.
   *
   * Uses a single Prisma interactive transaction. For each seat:
   *   1. SELECT ... FOR UPDATE — acquires row lock, reads current status + version
   *   2. Checks status = AVAILABLE
   *   3. UPDATE ... WHERE status = 'AVAILABLE' AND version = $readVersion
   *      - If rowCount = 0, another transaction beat us; abort with ConflictException
   *   4. Inserts SeatHoldItem (unique constraint on showSeatId provides DB-level guard)
   *
   * All seats are locked within a single transaction, so partial holds are impossible.
   * Either all seats are held, or none are (transaction rolls back on any failure).
   */
  async createHoldTransaction(
    showId: string,
    userId: string,
    seatIds: string[],
    holdId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        // Step 1: Create the SeatHold record first (inside transaction)
        await tx.seatHold.create({
          data: {
            id: holdId,
            showId,
            userId,
            expiresAt,
            status: 'ACTIVE',
          },
        });

        // Step 2: For each seat, acquire lock and update atomically
        for (const seatId of seatIds) {
          // SELECT ... FOR UPDATE — row-level lock
          const locked = await tx.$queryRaw<
            Array<{ id: string; status: string; version: number }>
          >`
            SELECT id, status, version
            FROM show_seats
            WHERE id = ${seatId}
            FOR UPDATE
          `;

          if (!locked || locked.length === 0) {
            throw new NotFoundException(`Seat ${seatId} not found`);
          }

          const seat = locked[0];

          if (seat.status !== 'AVAILABLE') {
            throw new ConflictException(
              `Seat ${seatId} is not available (current status: ${seat.status})`,
            );
          }

          // Conditional UPDATE — the WHERE version = $readVersion check is the second guard.
          // If two concurrent transactions both read the same seat as AVAILABLE and both
          // pass the status check, the one that updates second will find rowCount = 0
          // because the first already incremented the version.
          const updateResult = await tx.$executeRaw`
            UPDATE show_seats
            SET status = 'HELD',
                hold_id = ${holdId},
                version = version + 1
            WHERE id = ${seatId}
              AND status = 'AVAILABLE'
              AND version = ${seat.version}
          `;

          if (updateResult === 0) {
            // Another transaction committed between our SELECT FOR UPDATE and UPDATE.
            // This path is reached only in edge cases (e.g., a non-locking read race),
            // because the FOR UPDATE above should have serialized the writes.
            throw new ConflictException(
              `Seat ${seatId} was taken by a concurrent request (version mismatch)`,
            );
          }

          // Step 3: Insert hold item — unique constraint on showSeatId provides final DB guard
          await tx.seatHoldItem.create({
            data: { holdId, showSeatId: seatId },
          });
        }
      },
      {
        // Use SERIALIZABLE isolation for the strongest guarantee on the hold transaction
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000, // 10 second timeout
      },
    );
  }

  /**
   * Conditionally expires a hold.
   *
   * Uses a single conditional UPDATE — no SELECT then UPDATE.
   * This is what closes the race between the expiry worker and a last-second
   * booking confirmation: whichever UPDATE commits first wins. The second one
   * will find WHERE status = 'ACTIVE' matches zero rows and is a no-op.
   *
   * Returns the number of rows updated (0 = already processed, 1 = expired).
   */
  async conditionalExpire(holdId: string): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE seat_holds
      SET status = 'EXPIRED', released_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
    `;
  }

  /**
   * Conditionally completes a hold (booking confirmation path).
   *
   * Companion to conditionalExpire — same shape, same guarantee.
   * Returns 0 if the hold was already expired/completed, 1 if completed.
   */
  async conditionalComplete(holdId: string): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE seat_holds
      SET status = 'COMPLETED', booked_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
        AND expires_at > now()
    `;
  }

  /**
   * Conditionally releases a hold (user cancels).
   * Returns 0 if already terminal, 1 if released.
   */
  async conditionalRelease(holdId: string): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE seat_holds
      SET status = 'RELEASED', released_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
    `;
  }

  async findActiveHold(holdId: string) {
    return this.prisma.seatHold.findUnique({
      where: { id: holdId },
      include: { items: { include: { showSeat: true } } },
    });
  }

  async findExpiredActiveHolds() {
    return this.prisma.seatHold.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: new Date() },
      },
      include: { items: { select: { showSeatId: true } } },
    });
  }

  /**
   * Releases the seats back to AVAILABLE after hold expiry.
   * Must be called AFTER conditionalExpire to avoid releasing seats
   * that are being concurrently confirmed.
   */
  async releaseSeatsToAvailable(seatIds: string[], holdId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE show_seats
      SET status = 'AVAILABLE',
          hold_id = NULL,
          version = version + 1
      WHERE id = ANY(${seatIds}::text[])
        AND status = 'HELD'
        AND hold_id = ${holdId}
    `;
  }
}
