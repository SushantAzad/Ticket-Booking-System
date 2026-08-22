import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '@prisma/client';
export declare class WaitlistService {
    private readonly prisma;
    private readonly realtimeGateway;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway, notificationsService: NotificationsService);
    joinWaitlist(showId: string, categoryId: string, user: User): Promise<{
        id: string;
        createdAt: Date;
        categoryId: string;
        status: import(".prisma/client").$Enums.WaitlistStatus;
        showId: string;
        userId: string;
        position: number;
    }>;
    private getNextPosition;
    leaveWaitlist(entryId: string, user: User): Promise<{
        success: boolean;
    }>;
    expireOfferAndReassign(offerId: string): Promise<void>;
    getMyWaitlist(user: User): Promise<({
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
