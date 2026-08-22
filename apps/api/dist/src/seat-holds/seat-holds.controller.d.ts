import { SeatHoldsService } from './seat-holds.service';
import { CreateHoldDto } from './dto/seat-hold.dto';
export declare class SeatHoldsController {
    private readonly seatHoldsService;
    constructor(seatHoldsService: SeatHoldsService);
    createHold(showId: string, dto: CreateHoldDto, user: any): Promise<({
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
    getHold(showId: string, holdId: string, user: any): Promise<{
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
    }>;
    releaseHold(showId: string, holdId: string, user: any): Promise<{
        released: boolean;
        holdId: string;
    }>;
}
