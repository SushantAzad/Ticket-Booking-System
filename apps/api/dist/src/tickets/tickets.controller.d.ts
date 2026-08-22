import { PrismaService } from '../prisma/prisma.service';
export declare class TicketsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    verify(id: string): Promise<{
        valid: boolean;
        ticketId: string;
        bookingReference: string;
        seat: string;
        category: import(".prisma/client").$Enums.SeatCategoryName;
        issuedAt: Date;
    }>;
}
