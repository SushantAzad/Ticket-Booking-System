import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class AdminController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUsers(role?: Role): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        _count: {
            organisedEvents: number;
            bookings: number;
        };
    }[]>;
    getDashboard(): Promise<{
        totalUsers: number;
        totalEvents: number;
        totalBookings: number;
        totalPlatformRevenue: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
