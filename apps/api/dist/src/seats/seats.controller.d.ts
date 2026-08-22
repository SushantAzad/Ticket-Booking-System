import { SeatsService } from './seats.service';
export declare class SeatsController {
    private readonly seatsService;
    constructor(seatsService: SeatsService);
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
    recommend(showId: string, count?: number, category?: string, maxBudget?: number): Promise<import("./seats.service").SeatScore[]>;
}
