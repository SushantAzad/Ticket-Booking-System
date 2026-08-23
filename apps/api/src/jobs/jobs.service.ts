import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from '../seat-holds/seat-holds.repository';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { WaitlistService } from '../waitlist/waitlist.service';

/**
 * JobsService
 *
 * Handles background sweeps (cron jobs) that act as a fallback and guarantee
 * for edge cases where individual delayed BullMQ jobs might fail or get dropped.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly holdsRepo: SeatHoldsRepository,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly waitlistService: WaitlistService,
  ) {}

  /**
   * Sweep: Expire abandoned holds every 30 seconds.
   * Redundant to the per-hold BullMQ job. If the BullMQ job fires on time,
   * this will find 0 rows. If BullMQ goes down, this guarantees seats are released.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async sweepExpiredHolds() {
    const expiredHolds = await this.holdsRepo.findExpiredActiveHolds();

    if (expiredHolds.length === 0) return;

    this.logger.log(`Found ${expiredHolds.length} expired holds to sweep`);

    for (const hold of expiredHolds) {
      const expired = await this.holdsRepo.conditionalExpire(hold.id);

      if (expired > 0) {
        const seatIds = hold.items.map((i) => i.showSeatId);
        await this.holdsRepo.releaseSeatsToAvailable(seatIds, hold.id);

        for (const seatId of seatIds) {
          this.realtimeGateway.broadcastSeatStatus(
            hold.showId,
            seatId,
            'AVAILABLE',
            null,
          );
        }
        this.realtimeGateway.broadcastHoldExpired(
          hold.showId,
          hold.id,
          seatIds,
        );
        this.logger.log(`Swept hold ${hold.id}`);
      }
    }
  }

  /**
   * Sweep: Expire waitlist offers that were not accepted in time (every 1 min).
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async sweepExpiredOffers() {
    const expiredOffers = await this.prisma.waitlistOffer.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: new Date() },
      },
      select: { id: true },
    });

    if (expiredOffers.length === 0) return;

    this.logger.log(
      `Found ${expiredOffers.length} expired waitlist offers to sweep`,
    );

    for (const offer of expiredOffers) {
      await this.waitlistService.expireOfferAndReassign(offer.id);
      this.logger.log(`Swept and reassigned offer ${offer.id}`);
    }
  }
}
