export interface StructuredFilters {
  type?: 'MOVIE' | 'CONCERT' | 'LIVE_EVENT';
  genre?: string;
  city?: string;
  budgetPerTicket?: number;
  ticketCount?: number;
  categoryPreference?: string;
}

export interface RecommendationContext {
  originalQuery: string;
  recommendedSeats: Array<{
    row: string;
    number: number;
    category: string;
    price: number;
    score: number;
  }>;
  showTitle: string;
}

/**
 * AIProvider
 *
 * Interface defining the exact boundaries of what the LLM is allowed to do.
 * It is structurally prevented from interacting with raw SQL or inventory state.
 */
export interface AIProvider {
  /**
   * Translates natural language into deterministic filters.
   * "I need 2 VIP tickets for a rock concert in Mumbai under 2000 rupees each"
   * -> { type: 'CONCERT', genre: 'Rock', city: 'Mumbai', ticketCount: 2, budget: 2000, category: 'VIP' }
   */
  interpretEventQuery(rawText: string): Promise<StructuredFilters>;

  /**
   * Generates a natural language explanation for *why* the deterministic scoring
   * engine recommended specific seats, using only the provided context.
   */
  explainRecommendation(context: RecommendationContext): Promise<string>;
}
