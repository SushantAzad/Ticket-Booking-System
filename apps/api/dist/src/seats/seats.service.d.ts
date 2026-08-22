import { PrismaService } from '../prisma/prisma.service';
export interface SeatScore {
    id: string;
    row: string;
    number: number;
    label: string;
    category: string;
    status: string;
    price: number;
    score: number;
    explanation: string;
}
export declare class SeatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSeatMap(showId: string): Promise<{
        showId: string;
        venue: {
            seatCategories: {
                id: string;
                name: import(".prisma/client").$Enums.SeatCategoryName;
                venueId: string;
                colorCode: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            address: string;
            city: string;
            createdById: string;
        };
        categories: {
            id: string;
            name: import(".prisma/client").$Enums.SeatCategoryName;
            colorCode: string;
            price: number;
        }[];
        rows: {
            row: string;
            seats: {
                id: string;
                venueSeatId: string;
                row: string;
                number: number;
                label: string;
                category: import(".prisma/client").$Enums.SeatCategoryName;
                categoryId: string;
                colorCode: string;
                status: import(".prisma/client").$Enums.ShowSeatStatus;
                price: number;
            }[];
        }[];
        stats: {
            total: number;
            available: number;
            held: number;
            booked: number;
        };
    }>;
    recommendSeats(showId: string, preferences: {
        count: number;
        categoryPreference?: string;
        maxBudgetPerSeat?: number;
    }): Promise<SeatScore[]>;
    private findBestContiguousGroup;
}
