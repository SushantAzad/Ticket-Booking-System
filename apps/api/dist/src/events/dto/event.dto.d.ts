import { EventType } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    description: string;
    type: EventType;
    genre: string;
    posterUrl?: string;
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    posterUrl?: string;
}
