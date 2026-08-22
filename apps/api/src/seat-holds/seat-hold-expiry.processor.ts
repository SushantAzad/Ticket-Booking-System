import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SeatHoldsRepository } from './seat-holds.repository';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SEAT_HOLD_QUEUE } from './seat-holds.service';

interface ExpireHoldJob {
  holdId: string;
  showId: string;
  seatIds: string[];
}

/**
 * SeatHoldExpiryProcessor
 *
 * Handles both:
 *  1. Per-hold delayed jobs (fires exactly at expiresAt)
 *  2. The sweep job (every 30s, handled by JobsModule)
 *
 * Idempotency is structural: conditionalExpire uses
 *   UPDATE ... WHERE status = 'ACTIVE'
 * so running this handler twice (or after booking confirmation) is a no-op.
 */
@Processor(SEAT_HOLD_QUEUE, { concurrency: 5 })
export class SeatHoldExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(SeatHoldExpiryProcessor.name);

  constructor(
    private readonly repository: SeatHoldsRepository,
    private readonly realtimeGateway: RealtimeGateway,
  ) {
    super();
  }

  async process(job: Job<ExpireHoldJob>) {
    const { holdId, showId, seatIds } = job.data;

    this.logger.debug(`Processing expiry for hold ${holdId}`);

    // Conditional expire — race-safe against booking confirmation
    const expired = await this.repository.conditionalExpire(holdId);

    if (expired === 0) {
      // Hold was already completed (booked) or released — no-op
      this.logger.debug(`Hold ${holdId} already processed (booking won the race)`);
      return { skipped: true, holdId };
    }

    // Release seats back to AVAILABLE — only reached if we actually expired
    await this.repository.releaseSeatsToAvailable(seatIds, holdId);

    // Broadcast to all clients in the show room
    for (const seatId of seatIds) {
      this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'AVAILABLE', null);
    }

    this.realtimeGateway.broadcastHoldExpired(showId, holdId, seatIds);

    this.logger.log(`Hold ${holdId} expired — ${seatIds.length} seat(s) released`);
    return { expired: true, holdId, seatsReleased: seatIds.length };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Hold expiry job failed for holdId=${job.data?.holdId}: ${error.message}`,
      error.stack,
    );
  }
}
