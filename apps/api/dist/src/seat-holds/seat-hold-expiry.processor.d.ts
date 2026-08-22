import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SeatHoldsRepository } from './seat-holds.repository';
import { RealtimeGateway } from '../realtime/realtime.gateway';
interface ExpireHoldJob {
    holdId: string;
    showId: string;
    seatIds: string[];
}
export declare class SeatHoldExpiryProcessor extends WorkerHost {
    private readonly repository;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(repository: SeatHoldsRepository, realtimeGateway: RealtimeGateway);
    process(job: Job<ExpireHoldJob>): Promise<{
        skipped: boolean;
        holdId: string;
        expired?: undefined;
        seatsReleased?: undefined;
    } | {
        expired: boolean;
        holdId: string;
        seatsReleased: number;
        skipped?: undefined;
    }>;
    onFailed(job: Job, error: Error): void;
}
export {};
