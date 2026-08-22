import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from './seat-holds.repository';
import { CreateHoldDto } from './dto/seat-hold.dto';
import { User } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { v4 as uuidv4 } from 'uuid';

export const SEAT_HOLD_QUEUE = 'seat-hold-expiry';

@Injectable()
export class SeatHoldsService {
  private readonly logger = new Logger(SeatHoldsService.name);
  private readonly holdTtlMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: SeatHoldsRepository,
    private readonly configService: ConfigService,
    @InjectQueue(SEAT_HOLD_QUEUE) private readonly holdQueue: Queue,
    private readonly realtimeGateway: RealtimeGateway,
  ) {
    this.holdTtlMinutes = this.configService.get<number>('SEAT_HOLD_TTL_MINUTES', 10);
  }

  async createHold(showId: string, dto: CreateHoldDto, user: User) {
    // Validate the show exists and is bookable
    const show = await this.prisma.show.findUnique({ where: { id: showId } });
    if (!show) throw new NotFoundException('Show not found');
    if (show.status !== 'SCHEDULED') {
      throw new BadRequestException('Show is not available for booking');
    }
    if (show.startTime < new Date()) {
      throw new BadRequestException('Show has already started');
    }

    // Validate all seatIds belong to this show
    const showSeats = await this.prisma.showSeat.findMany({
      where: { id: { in: dto.seatIds }, showId },
    });

    if (showSeats.length !== dto.seatIds.length) {
      throw new BadRequestException('One or more seats do not belong to this show');
    }

    const holdId = uuidv4();
    const expiresAt = new Date(Date.now() + this.holdTtlMinutes * 60 * 1000);

    // ── The actual concurrency-safe hold creation ──────────────────────────
    // All locking logic is in the repository. Any failure here (seat taken,
    // version mismatch, unique constraint on SeatHoldItem) throws automatically.
    await this.repository.createHoldTransaction(
      showId,
      user.id,
      dto.seatIds,
      holdId,
      expiresAt,
    );

    // ── Schedule per-hold delayed expiry job ──────────────────────────────
    // Deterministic job ID — if the hold is completed early, this job is removed.
    // If it fires anyway (scheduling edge case), the idempotent conditionalExpire
    // will match 0 rows and be a no-op.
    const delay = expiresAt.getTime() - Date.now();
    await this.holdQueue.add(
      'expire-hold',
      { holdId, showId, seatIds: dto.seatIds },
      {
        delay,
        jobId: `hold-expiry:${holdId}`,
        removeOnComplete: true,
        removeOnFail: 10,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    // Broadcast seat status changes
    for (const seatId of dto.seatIds) {
      this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'HELD', holdId);
    }

    // Return hold with items
    return this.repository.findActiveHold(holdId);
  }

  async releaseHold(holdId: string, showId: string, user: User) {
    const hold = await this.repository.findActiveHold(holdId);

    if (!hold) throw new NotFoundException('Hold not found');
    if (hold.showId !== showId) throw new BadRequestException('Hold does not belong to this show');
    if (hold.userId !== user.id) throw new ForbiddenException('Not your hold');

    const released = await this.repository.conditionalRelease(holdId);

    if (released === 0) {
      throw new BadRequestException('Hold is not active (may have expired or been confirmed)');
    }

    const seatIds = hold.items.map((item) => item.showSeatId);

    // Release seats back to AVAILABLE
    await this.repository.releaseSeatsToAvailable(seatIds, holdId);

    // Remove the scheduled expiry job (no longer needed)
    const job = await this.holdQueue.getJob(`hold-expiry:${holdId}`);
    if (job) await job.remove();

    // Broadcast seat releases
    for (const seatId of seatIds) {
      this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'AVAILABLE', null);
    }

    return { released: true, holdId };
  }

  async getHold(holdId: string, user: User) {
    const hold = await this.repository.findActiveHold(holdId);
    if (!hold) throw new NotFoundException('Hold not found');
    if (hold.userId !== user.id) throw new ForbiddenException('Not your hold');
    return hold;
  }
}
