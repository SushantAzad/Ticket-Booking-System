import { SeatCategoryName } from '@prisma/client';
export declare class ShowCategoryPriceDto {
    category: SeatCategoryName;
    price: number;
}
export declare class CreateShowDto {
    eventId: string;
    venueId: string;
    startTime: string;
    endTime: string;
    prices: ShowCategoryPriceDto[];
}
