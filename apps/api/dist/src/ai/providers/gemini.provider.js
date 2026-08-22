"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiProvider = GeminiProvider_1 = class GeminiProvider {
    configService;
    logger = new common_1.Logger(GeminiProvider_1.name);
    ai = null;
    modelName = 'gemini-1.5-pro';
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (apiKey && apiKey !== 'mock-key') {
            this.ai = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        else {
            this.logger.warn('GEMINI_API_KEY is missing or mock. AI features will degrade gracefully.');
        }
    }
    async interpretEventQuery(rawText) {
        if (!this.ai)
            return this.mockInterpret(rawText);
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
            const cleanText = text.replace(/^```json/i, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(cleanText);
            const cleaned = {};
            for (const [key, value] of Object.entries(parsed)) {
                if (value !== null && value !== undefined) {
                    cleaned[key] = value;
                }
            }
            return cleaned;
        }
        catch (error) {
            this.logger.error(`Gemini interpretEventQuery failed: ${error.message}`);
            return this.mockInterpret(rawText);
        }
    }
    async explainRecommendation(context) {
        if (!this.ai)
            return this.mockExplain(context);
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
        }
        catch (error) {
            this.logger.error(`Gemini explainRecommendation failed: ${error.message}`);
            return this.mockExplain(context);
        }
    }
    mockInterpret(text) {
        const filters = {};
        const lower = text.toLowerCase();
        if (lower.includes('movie'))
            filters.type = 'MOVIE';
        if (lower.includes('concert'))
            filters.type = 'CONCERT';
        if (lower.includes('comedy') || lower.includes('stand up'))
            filters.type = 'LIVE_EVENT';
        if (lower.includes('mumbai'))
            filters.city = 'Mumbai';
        if (lower.includes('bangalore'))
            filters.city = 'Bangalore';
        const countMatch = text.match(/(\d+)\s*tickets?/i);
        if (countMatch)
            filters.ticketCount = parseInt(countMatch[1], 10);
        return filters;
    }
    mockExplain(context) {
        const count = context.recommendedSeats.length;
        return `I found ${count} great seat${count > 1 ? 's' : ''} for you at ${context.showTitle}. They offer the best balance of view and price based on your request.`;
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = GeminiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiProvider);
//# sourceMappingURL=gemini.provider.js.map