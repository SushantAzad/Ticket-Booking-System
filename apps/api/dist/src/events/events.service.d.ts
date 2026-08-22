import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventType, User } from '@prisma/client';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEventDto, user: User): Promise<{
        organiser: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        type: import(".prisma/client").$Enums.EventType;
        genre: string;
        posterUrl: string | null;
        organiserId: string;
    }>;
    findAll(filters: {
        type?: EventType;
        genre?: string;
        city?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        events: ({
            shows: ({
                venue: {
                    id: string;
                    name: string;
                    city: string;
                };
                showSeatCategoryPrices: {
                    id: string;
                    categoryId: string;
                    showId: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                id: string;
                venueId: string;
                eventId: string;
                startTime: Date;
                endTime: Date;
                status: import(".prisma/client").$Enums.ShowStatus;
            })[];
            organiser: {
                id: string;
                name: string;
            };
            _count: {
                shows: number;
            };
        } & {
            id: string;
            createdAt: Date;
            title: string;
            description: string;
            type: import(".prisma/client").$Enums.EventType;
            genre: string;
            posterUrl: string | null;
            organiserId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        shows: ({
            venue: {
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
        })[];
        organiser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        type: import(".prisma/client").$Enums.EventType;
        genre: string;
        posterUrl: string | null;
        organiserId: string;
    }>;
    update(id: string, dto: UpdateEventDto, user: User): Promise<{
        organiser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        type: import(".prisma/client").$Enums.EventType;
        genre: string;
        posterUrl: string | null;
        organiserId: string;
    }>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
}
