import { PrismaService } from '../prisma/prisma.service';
export interface SeatLockResult {
    success: boolean;
    failedSeatId?: string;
    reason?: 'NOT_FOUND' | 'NOT_AVAILABLE' | 'VERSION_MISMATCH';
}
export declare class SeatHoldsRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createHoldTransaction(showId: string, userId: string, seatIds: string[], holdId: string, expiresAt: Date): Promise<void>;
    conditionalExpire(holdId: string): Promise<number>;
    conditionalComplete(holdId: string): Promise<number>;
    conditionalRelease(holdId: string): Promise<number>;
    findActiveHold(holdId: string): Promise<({
        items: ({
            showSeat: {
                id: string;
                categoryId: string;
                status: import(".prisma/client").$Enums.ShowSeatStatus;
                showId: string;
                venueSeatId: string;
                holdId: string | null;
                bookingId: string | null;
                version: number;
            };
        } & {
            id: string;
            holdId: string;
            showSeatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.HoldStatus;
        showId: string;
        userId: string;
        expiresAt: Date;
        releasedAt: Date | null;
        bookedAt: Date | null;
    }) | null>;
    findExpiredActiveHolds(): Promise<({
        items: {
            showSeatId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.HoldStatus;
        showId: string;
        userId: string;
        expiresAt: Date;
        releasedAt: Date | null;
        bookedAt: Date | null;
    })[]>;
    releaseSeatsToAvailable(seatIds: string[], holdId: string): Promise<void>;
}
