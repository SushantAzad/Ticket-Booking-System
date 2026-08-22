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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("../events/events.service");
const seats_service_1 = require("../seats/seats.service");
const ai_provider_factory_1 = require("./providers/ai-provider.factory");
let AiService = class AiService {
    providerFactory;
    eventsService;
    seatsService;
    constructor(providerFactory, eventsService, seatsService) {
        this.providerFactory = providerFactory;
        this.eventsService = eventsService;
        this.seatsService = seatsService;
    }
    async processEventQuery(query) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException('Query cannot be empty');
        }
        const provider = this.providerFactory.getProvider();
        const filters = await provider.interpretEventQuery(query);
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
        const topEvent = events[0];
        let recommendedSeats = [];
        let explanation = '';
        if (topEvent.shows && topEvent.shows.length > 0) {
            const targetShow = topEvent.shows[0];
            recommendedSeats = await this.seatsService.recommendSeats(targetShow.id, {
                count: filters.ticketCount || 1,
                categoryPreference: filters.categoryPreference,
                maxBudgetPerSeat: filters.budgetPerTicket,
            });
            if (recommendedSeats.length > 0) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_provider_factory_1.AiProviderFactory,
        events_service_1.EventsService,
        seats_service_1.SeatsService])
], AiService);
//# sourceMappingURL=ai.service.js.map