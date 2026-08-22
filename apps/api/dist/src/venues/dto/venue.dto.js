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
exports.AddSeatsDto = exports.SeatRangeDto = exports.CreateSeatCategoryDto = exports.CreateVenueDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateVenueDto {
    name;
    address;
    city;
}
exports.CreateVenueDto = CreateVenueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cineplex Grand' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12 Film Street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mumbai' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVenueDto.prototype, "city", void 0);
class CreateSeatCategoryDto {
    name;
    colorCode;
}
exports.CreateSeatCategoryDto = CreateSeatCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeatCategoryName }),
    (0, class_validator_1.IsEnum)(client_1.SeatCategoryName),
    __metadata("design:type", String)
], CreateSeatCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#4ade80' }),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], CreateSeatCategoryDto.prototype, "colorCode", void 0);
class SeatRangeDto {
    row;
    fromNumber;
    toNumber;
    category;
}
exports.SeatRangeDto = SeatRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatRangeDto.prototype, "row", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SeatRangeDto.prototype, "fromNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SeatRangeDto.prototype, "toNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeatCategoryName }),
    (0, class_validator_1.IsEnum)(client_1.SeatCategoryName),
    __metadata("design:type", String)
], SeatRangeDto.prototype, "category", void 0);
class AddSeatsDto {
    ranges;
}
exports.AddSeatsDto = AddSeatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SeatRangeDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SeatRangeDto),
    __metadata("design:type", Array)
], AddSeatsDto.prototype, "ranges", void 0);
//# sourceMappingURL=venue.dto.js.map