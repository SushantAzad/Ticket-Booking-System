import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, StructuredFilters, RecommendationContext } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private ai: GoogleGenerativeAI | null = null;
  private readonly modelName = 'gemini-1.5-pro';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'mock-key') {
      this.ai = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY is missing or mock. AI features will degrade gracefully.');
    }
  }

  async interpretEventQuery(rawText: string): Promise<StructuredFilters> {
    if (!this.ai) return this.mockInterpret(rawText);

    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });
      
      const prompt = `
        Extract search filters from the following query about booking event tickets.
        Return ONLY a JSON object matching this schema, with no markdown formatting or markdown code blocks:
        {
          "type": "MOVIE" | "CONCERT" | "LIVE_EVENT" | null,
          "genre": string | null,
          "city": string | null,
          "budgetPerTicket": number | null,
          "ticketCount": number | null,
          "categoryPreference": string | null
        }
        
        Query: "${rawText}"
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean up in case the model ignored instructions and wrapped in ```json
      const cleanText = text.replace(/^```json/i, '').replace(/```$/, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Strip nulls
      const cleaned: any = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      }
      
      return cleaned as StructuredFilters;
    } catch (error) {
      this.logger.error(`Gemini interpretEventQuery failed: ${error.message}`);
      return this.mockInterpret(rawText);
    }
  }

  async explainRecommendation(context: RecommendationContext): Promise<string> {
    if (!this.ai) return this.mockExplain(context);

    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });
      
      const prompt = `
        You are a helpful ticketing assistant. Explain why these specific seats were chosen 
        for the user's query. Keep it to 2-3 short, friendly sentences.
        
        Original User Query: "${context.originalQuery}"
        Show: "${context.showTitle}"
        Recommended Seats (ranked by score):
        ${JSON.stringify(context.recommendedSeats, null, 2)}
        
        Explanation:
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error(`Gemini explainRecommendation failed: ${error.message}`);
      return this.mockExplain(context);
    }
  }

  private mockInterpret(text: string): StructuredFilters {
    const filters: StructuredFilters = {};
    const lower = text.toLowerCase();
    
    if (lower.includes('movie')) filters.type = 'MOVIE';
    if (lower.includes('concert')) filters.type = 'CONCERT';
    if (lower.includes('comedy') || lower.includes('stand up')) filters.type = 'LIVE_EVENT';
    
    if (lower.includes('mumbai')) filters.city = 'Mumbai';
    if (lower.includes('bangalore')) filters.city = 'Bangalore';
    
    const countMatch = text.match(/(\d+)\s*tickets?/i);
    if (countMatch) filters.ticketCount = parseInt(countMatch[1], 10);
    
    return filters;
  }

  private mockExplain(context: RecommendationContext): string {
    const count = context.recommendedSeats.length;
    return `I found ${count} great seat${count > 1 ? 's' : ''} for you at ${context.showTitle}. They offer the best balance of view and price based on your request.`;
  }
}
