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
var ShowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let ShowsService = ShowsService_1 = class ShowsService {
    prisma;
    logger = new common_1.Logger(ShowsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (user.role !== client_1.Role.ADMIN && event.organiserId !== user.id) {
            throw new common_1.ForbiddenException('Only the event organiser can create shows');
        }
        const venue = await this.prisma.venue.findUnique({
            where: { id: dto.venueId },
            include: { seatCategories: true, venueSeats: true },
        });
        if (!venue)
            throw new common_1.NotFoundException('Venue not found');
        if (new Date(dto.startTime) >= new Date(dto.endTime)) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        const show = await this.prisma.$transaction(async (tx) => {
            const newShow = await tx.show.create({
                data: {
                    eventId: dto.eventId,
                    venueId: dto.venueId,
                    startTime: new Date(dto.startTime),
                    endTime: new Date(dto.endTime),
                    status: client_1.ShowStatus.SCHEDULED,
                },
            });
            for (const priceDto of dto.prices) {
                const category = venue.seatCategories.find((c) => c.name === priceDto.category);
                if (!category)
                    continue;
                await tx.showSeatCategoryPrice.create({
                    data: {
                        showId: newShow.id,
                        categoryId: category.id,
                        price: new library_1.Decimal(priceDto.price),
                    },
                });
            }
            await tx.showSeat.createMany({
                data: venue.venueSeats.map((vs) => ({
                    showId: newShow.id,
                    venueSeatId: vs.id,
                    categoryId: vs.categoryId,
                    status: 'AVAILABLE',
                    version: 0,
                })),
            });
            return newShow;
        });
        this.logger.log(`Show ${show.id} created with ${venue.venueSeats.length} seats for event ${dto.eventId}`);
        return this.findOne(show.id);
    }
    async findOne(id) {
        const show = await this.prisma.show.findUnique({
            where: { id },
            include: {
                event: true,
                venue: { include: { seatCategories: true } },
                showSeatCategoryPrices: { include: { category: true } },
                _count: {
                    select: {
                        showSeats: true,
                    },
                },
            },
        });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        return show;
    }
    async findByEvent(eventId) {
        return this.prisma.show.findMany({
            where: { eventId },
            include: {
                venue: { select: { id: true, name: true, city: true } },
                showSeatCategoryPrices: { include: { category: true } },
                _count: {
                    select: { showSeats: true },
                },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async cancel(showId, user) {
        const show = await this.prisma.show.findUnique({
            where: { id: showId },
            include: { event: true },
        });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        if (user.role !== client_1.Role.ADMIN && show.event.organiserId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.show.update({
            where: { id: showId },
            data: { status: client_1.ShowStatus.CANCELLED },
        });
    }
    async getAvailabilityStats(showId) {
        const counts = await this.prisma.showSeat.groupBy({
            by: ['status', 'categoryId'],
            where: { showId },
            _count: { status: true },
        });
        return counts;
    }
};
exports.ShowsService = ShowsService;
exports.ShowsService = ShowsService = ShowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShowsService);
//# sourceMappingURL=shows.service.js.map