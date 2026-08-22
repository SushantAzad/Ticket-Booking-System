import { VenuesService } from './venues.service';
import { CreateVenueDto, CreateSeatCategoryDto, AddSeatsDto } from './dto/venue.dto';
export declare class VenuesController {
    private readonly venuesService;
    constructor(venuesService: VenuesService);
    create(dto: CreateVenueDto, user: any): Promise<{
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
    addCategory(id: string, dto: CreateSeatCategoryDto, user: any): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.SeatCategoryName;
        venueId: string;
        colorCode: string;
    }>;
    addSeats(id: string, dto: AddSeatsDto, user: any): Promise<{
        created: number;
        seats: unknown[];
    }>;
}
