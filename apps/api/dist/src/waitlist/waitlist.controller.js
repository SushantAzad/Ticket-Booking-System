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
exports.WaitlistController = exports.JoinWaitlistDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const waitlist_service_1 = require("./waitlist.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class JoinWaitlistDto {
    categoryId;
}
exports.JoinWaitlistDto = JoinWaitlistDto;
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], JoinWaitlistDto.prototype, "categoryId", void 0);
let WaitlistController = class WaitlistController {
    waitlistService;
    constructor(waitlistService) {
        this.waitlistService = waitlistService;
    }
    joinWaitlist(showId, dto, user) {
        return this.waitlistService.joinWaitlist(showId, dto.categoryId, user);
    }
    leaveWaitlist(id, user) {
        return this.waitlistService.leaveWaitlist(id, user);
    }
    getMyWaitlist(user) {
        return this.waitlistService.getMyWaitlist(user);
    }
};
exports.WaitlistController = WaitlistController;
__decorate([
    (0, common_1.Post)('shows/:showId/waitlist'),
    (0, swagger_1.ApiOperation)({ summary: 'Join waitlist for a specific show and category' }),
    __param(0, (0, common_1.Param)('showId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, JoinWaitlistDto, Object]),
    __metadata("design:returntype", void 0)
], WaitlistController.prototype, "joinWaitlist", null);
__decorate([
    (0, common_1.Delete)('waitlist/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave waitlist / Reject offer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WaitlistController.prototype, "leaveWaitlist", null);
__decorate([
    (0, common_1.Get)('waitlist/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my waitlist entries and active offers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WaitlistController.prototype, "getMyWaitlist", null);
exports.WaitlistController = WaitlistController = __decorate([
    (0, swagger_1.ApiTags)('waitlist'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [waitlist_service_1.WaitlistService])
], WaitlistController);
//# sourceMappingURL=waitlist.controller.js.map