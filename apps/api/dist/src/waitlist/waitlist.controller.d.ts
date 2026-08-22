import { WaitlistService } from './waitlist.service';
export declare class JoinWaitlistDto {
    categoryId: string;
}
export declare class WaitlistController {
    private readonly waitlistService;
    constructor(waitlistService: WaitlistService);
    joinWaitlist(showId: string, dto: JoinWaitlistDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        categoryId: string;
        status: import(".prisma/client").$Enums.WaitlistStatus;
        showId: string;
        userId: string;
        position: number;
    }>;
    leaveWaitlist(id: string, user: any): Promise<{
        success: boolean;
    }>;
    getMyWaitlist(user: any): Promise<({
        category: {
            id: string;
            name: import(".prisma/client").$Enums.SeatCategoryName;
            venueId: string;
            colorCode: string;
        };
        show: {
            event: {
                id: string;
                createdAt: Date;
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.EventType;
                genre: string;
                posterUrl: string | null;
                organiserId: string;
            };
        } & {
            id: string;
            venueId: string;
            eventId: string;
            startTime: Date;
            endTime: Date;
            status: import(".prisma/client").$Enums.ShowStatus;
        };
        offers: ({
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
            createdAt: Date;
            status: import(".prisma/client").$Enums.WaitlistOfferStatus;
            expiresAt: Date;
            showSeatId: string;
            waitlistEntryId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        categoryId: string;
        status: import(".prisma/client").$Enums.WaitlistStatus;
        showId: string;
        userId: string;
        position: number;
    })[]>;
}
