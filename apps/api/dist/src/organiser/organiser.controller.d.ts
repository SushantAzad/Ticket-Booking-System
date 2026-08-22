import { PrismaService } from '../prisma/prisma.service';
export declare class OrganiserController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(user: any): Promise<{
        totalEvents: number;
        totalShows: number;
        totalBookings: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        upcomingShows: ({
            event: {
                title: string;
            };
            _count: {
                bookings: number;
            };
        } & {
            id: string;
            venueId: string;
            eventId: string;
            startTime: Date;
            endTime: Date;
            status: import(".prisma/client").$Enums.ShowStatus;
        })[];
    }>;
}
