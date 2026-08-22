import { SeatCategoryName } from '@prisma/client';
export declare class CreateVenueDto {
    name: string;
    address: string;
    city: string;
}
export declare class CreateSeatCategoryDto {
    name: SeatCategoryName;
    colorCode: string;
}
export declare class SeatRangeDto {
    row: string;
    fromNumber: number;
    toNumber: number;
    category: SeatCategoryName;
}
export declare class AddSeatsDto {
    ranges: SeatRangeDto[];
}
