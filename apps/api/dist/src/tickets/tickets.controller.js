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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let TicketsController = class TicketsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verify(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                bookingSeat: {
                    include: {
                        showSeat: {
                            include: { venueSeat: true, category: true },
                        },
                        booking: { select: { status: true, bookingReference: true } },
                    },
                },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        const isValid = ticket.bookingSeat.booking.status === 'CONFIRMED';
        return {
            valid: isValid,
            ticketId: ticket.id,
            bookingReference: ticket.bookingSeat.booking.bookingReference,
            seat: ticket.bookingSeat.showSeat.venueSeat.label,
            category: ticket.bookingSeat.showSeat.category.name,
            issuedAt: ticket.issuedAt,
        };
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)(':id/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a ticket QR code' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "verify", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('tickets'),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map