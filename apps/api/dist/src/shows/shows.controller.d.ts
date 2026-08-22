import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/show.dto';
export declare class ShowsController {
    private readonly showsService;
    constructor(showsService: ShowsService);
    create(dto: CreateShowDto, user: any): Promise<{
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
        showSeatCategoryPrices: ({
            category: {
                id: string;
                name: import(".prisma/client").$Enums.SeatCategoryName;
                venueId: string;
                colorCode: string;
            };
        } & {
            id: string;
            categoryId: string;
            showId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        })[];
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
        _count: {
            showSeats: number;
        };
    } & {
        id: string;
        venueId: string;
        eventId: string;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.ShowStatus;
    }>;
    findOne(id: string): Promise<{
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
        showSeatCategoryPrices: ({
            category: {
                id: string;
                name: import(".prisma/client").$Enums.SeatCategoryName;
                venueId: string;
                colorCode: string;
            };
        } & {
            id: string;
            categoryId: string;
            showId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        })[];
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
        _count: {
            showSeats: number;
        };
    } & {
        id: string;
        venueId: string;
        eventId: string;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.ShowStatus;
    }>;
    getAvailability(id: string): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ShowSeatGroupByOutputType, ("categoryId" | "status")[]> & {
        _count: {
            status: number;
        };
    })[]>;
    cancel(id: string, user: any): Promise<{
        id: string;
        venueId: string;
        eventId: string;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.ShowStatus;
    }>;
}
