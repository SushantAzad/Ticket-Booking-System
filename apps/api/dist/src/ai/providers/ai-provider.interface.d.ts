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
export interface AIProvider {
    interpretEventQuery(rawText: string): Promise<StructuredFilters>;
    explainRecommendation(context: RecommendationContext): Promise<string>;
}
