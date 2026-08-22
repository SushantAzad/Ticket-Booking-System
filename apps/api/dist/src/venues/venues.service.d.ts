import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto, CreateSeatCategoryDto, AddSeatsDto } from './dto/venue.dto';
import { User } from '@prisma/client';
export declare class VenuesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVenueDto, user: User): Promise<{
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
    }>;
    findAll(city?: string): Promise<({
        seatCategories: {
            id: string;
            name: import(".prisma/client").$Enums.SeatCategoryName;
            venueId: string;
            colorCode: string;
        }[];
        _count: {
            venueSeats: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        address: string;
        city: string;
        createdById: string;
    })[]>;
    findOne(id: string): Promise<{
        seatCategories: {
            id: string;
            name: import(".prisma/client").$Enums.SeatCategoryName;
            venueId: string;
            colorCode: string;
        }[];
        venueSeats: ({
            category: {
                id: string;
                name: import(".prisma/client").$Enums.SeatCategoryName;
                venueId: string;
                colorCode: string;
            };
        } & {
            number: number;
            id: string;
            venueId: string;
            categoryId: string;
            row: string;
            label: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        address: string;
        city: string;
        createdById: string;
    }>;
    addCategory(venueId: string, dto: CreateSeatCategoryDto, user: User): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.SeatCategoryName;
        venueId: string;
        colorCode: string;
    }>;
    addSeats(venueId: string, dto: AddSeatsDto, user: User): Promise<{
        created: number;
        seats: unknown[];
    }>;
    private assertVenueAccess;
}
