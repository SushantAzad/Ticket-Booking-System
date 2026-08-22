import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from '../seat-holds/seat-holds.repository';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { WaitlistService } from '../waitlist/waitlist.service';
export declare class JobsService {
    private readonly prisma;
    private readonly holdsRepo;
    private readonly realtimeGateway;
    private readonly waitlistService;
    private readonly logger;
    constructor(prisma: PrismaService, holdsRepo: SeatHoldsRepository, realtimeGateway: RealtimeGateway, waitlistService: WaitlistService);
    sweepExpiredHolds(): Promise<void>;
    sweepExpiredOffers(): Promise<void>;
}
