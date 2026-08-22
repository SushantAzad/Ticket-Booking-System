import { Injectable, BadRequestException } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { SeatsService } from '../seats/seats.service';
import { AiProviderFactory } from './providers/ai-provider.factory';

@Injectable()
export class AiService {
  constructor(
    private readonly providerFactory: AiProviderFactory,
    private readonly eventsService: EventsService,
    private readonly seatsService: SeatsService,
  ) {}

  /**
   * AI-powered event discovery and seat recommendation pipeline.
   *
   * Flow:
   * 1. LLM parses natural language query into structured filters.
   * 2. Backend queries database using strict filters (grounding).
   * 3. Deterministic engine scores and picks best seats.
   * 4. LLM explains why those seats were picked.
   */
  async processEventQuery(query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Query cannot be empty');
    }

    const provider = this.providerFactory.getProvider();

    // 1. Parse
    const filters = await provider.interpretEventQuery(query);

    // 2. Search Events
    const { events } = await this.eventsService.findAll({
      type: filters.type,
      genre: filters.genre,
      city: filters.city,
      limit: 3,
    });

    if (events.length === 0) {
      return {
        filters,
        events: [],
        message: 'I could not find any events matching your request.',
      };
    }

    // 3. Recommend seats for the top event (if it has upcoming shows)
    const topEvent = events[0];
    let recommendedSeats: any[] = [];
    let explanation = '';

    if (topEvent.shows && topEvent.shows.length > 0) {
      const targetShow = topEvent.shows[0]; // pick first upcoming show

      // Deterministic recommendation (no LLM)
      recommendedSeats = await this.seatsService.recommendSeats(targetShow.id, {
        count: filters.ticketCount || 1,
        categoryPreference: filters.categoryPreference,
        maxBudgetPerSeat: filters.budgetPerTicket,
      });

      if (recommendedSeats.length > 0) {
        // 4. Explain
        explanation = await provider.explainRecommendation({
          originalQuery: query,
          showTitle: topEvent.title,
          recommendedSeats: recommendedSeats.map((s) => ({
            row: s.row,
            number: s.number,
            category: s.category,
            price: s.price,
            score: s.score,
          })),
        });
      }
    }

    return {
      filters,
      events,
      recommendedSeats,
      explanation,
    };
  }
}
