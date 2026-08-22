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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seats_service_1 = require("./seats.service");
let SeatsController = class SeatsController {
    seatsService;
    constructor(seatsService) {
        this.seatsService = seatsService;
    }
    getSeatMap(showId) {
        return this.seatsService.getSeatMap(showId);
    }
    recommend(showId, count, category, maxBudget) {
        return this.seatsService.recommendSeats(showId, {
            count: count ?? 1,
            categoryPreference: category,
            maxBudgetPerSeat: maxBudget,
        });
    }
};
exports.SeatsController = SeatsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get full seat map for a show with live status' }),
    __param(0, (0, common_1.Param)('showId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeatsController.prototype, "getSeatMap", null);
__decorate([
    (0, common_1.Get)('recommend'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deterministic seat recommendations' }),
    (0, swagger_1.ApiQuery)({ name: 'count', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxBudget', required: false, type: Number }),
    __param(0, (0, common_1.Param)('showId')),
    __param(1, (0, common_1.Query)('count')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('maxBudget')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number]),
    __metadata("design:returntype", void 0)
], SeatsController.prototype, "recommend", null);
exports.SeatsController = SeatsController = __decorate([
    (0, swagger_1.ApiTags)('seats'),
    (0, common_1.Controller)('shows/:showId/seats'),
    __metadata("design:paramtypes", [seats_service_1.SeatsService])
], SeatsController);
//# sourceMappingURL=seats.controller.js.map