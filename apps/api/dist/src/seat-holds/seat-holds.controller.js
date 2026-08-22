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
exports.SeatHoldsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seat_holds_service_1 = require("./seat-holds.service");
const seat_hold_dto_1 = require("./dto/seat-hold.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let SeatHoldsController = class SeatHoldsController {
    seatHoldsService;
    constructor(seatHoldsService) {
        this.seatHoldsService = seatHoldsService;
    }
    createHold(showId, dto, user) {
        return this.seatHoldsService.createHold(showId, dto, user);
    }
    getHold(showId, holdId, user) {
        return this.seatHoldsService.getHold(holdId, user);
    }
    releaseHold(showId, holdId, user) {
        return this.seatHoldsService.releaseHold(holdId, showId, user);
    }
};
exports.SeatHoldsController = SeatHoldsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a seat hold (10-min TTL)',
        description: 'Atomically holds seats using SELECT...FOR UPDATE. Returns SEAT_ALREADY_HELD if any seat is unavailable.',
    }),
    __param(0, (0, common_1.Param)('showId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seat_hold_dto_1.CreateHoldDto, Object]),
    __metadata("design:returntype", void 0)
], SeatHoldsController.prototype, "createHold", null);
__decorate([
    (0, common_1.Get)(':holdId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hold status and details' }),
    __param(0, (0, common_1.Param)('showId')),
    __param(1, (0, common_1.Param)('holdId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SeatHoldsController.prototype, "getHold", null);
__decorate([
    (0, common_1.Delete)(':holdId'),
    (0, swagger_1.ApiOperation)({ summary: 'Release a hold (user cancels selection)' }),
    __param(0, (0, common_1.Param)('showId')),
    __param(1, (0, common_1.Param)('holdId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SeatHoldsController.prototype, "releaseHold", null);
exports.SeatHoldsController = SeatHoldsController = __decorate([
    (0, swagger_1.ApiTags)('seat-holds'),
    (0, common_1.Controller)('shows/:showId/holds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [seat_holds_service_1.SeatHoldsService])
], SeatHoldsController);
//# sourceMappingURL=seat-holds.controller.js.map