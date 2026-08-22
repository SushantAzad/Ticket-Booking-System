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
exports.CreateShowDto = exports.ShowCategoryPriceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class ShowCategoryPriceDto {
    category;
    price;
}
exports.ShowCategoryPriceDto = ShowCategoryPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeatCategoryName }),
    (0, class_validator_1.IsEnum)(client_1.SeatCategoryName),
    __metadata("design:type", String)
], ShowCategoryPriceDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ShowCategoryPriceDto.prototype, "price", void 0);
class CreateShowDto {
    eventId;
    venueId;
    startTime;
    endTime;
    prices;
}
exports.CreateShowDto = CreateShowDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShowDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShowDto.prototype, "venueId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-01T14:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShowDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-01T16:30:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShowDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ShowCategoryPriceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ShowCategoryPriceDto),
    __metadata("design:type", Array)
], CreateShowDto.prototype, "prices", void 0);
//# sourceMappingURL=show.dto.js.map