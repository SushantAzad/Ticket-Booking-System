import { PrismaService } from '../prisma/prisma.service';
import { CreateShowDto } from './dto/show.dto';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ShowsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateShowDto, user: User): Promise<{
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
            price: Decimal;
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
            price: Decimal;
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
    findByEvent(eventId: string): Promise<({
        venue: {
            id: string;
            name: string;
            city: string;
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
            price: Decimal;
        })[];
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
    })[]>;
    cancel(showId: string, user: User): Promise<{
        id: string;
        venueId: string;
        eventId: string;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.ShowStatus;
    }>;
    getAvailabilityStats(showId: string): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ShowSeatGroupByOutputType, ("categoryId" | "status")[]> & {
        _count: {
            status: number;
        };
    })[]>;
}
