import { EventsService } from '../events/events.service';
import { SeatsService } from '../seats/seats.service';
import { AiProviderFactory } from './providers/ai-provider.factory';
export declare class AiService {
    private readonly providerFactory;
    private readonly eventsService;
    private readonly seatsService;
    constructor(providerFactory: AiProviderFactory, eventsService: EventsService, seatsService: SeatsService);
    processEventQuery(query: string): Promise<{
        filters: import("./providers/ai-provider.interface").StructuredFilters;
        events: never[];
        message: string;
        recommendedSeats?: undefined;
        explanation?: undefined;
    } | {
        filters: import("./providers/ai-provider.interface").StructuredFilters;
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
        recommendedSeats: any[];
        explanation: string;
        message?: undefined;
    }>;
}
