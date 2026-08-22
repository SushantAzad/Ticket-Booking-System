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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        return this.prisma.event.create({
            data: { ...dto, organiserId: user.id },
            include: { organiser: { select: { id: true, name: true, email: true } } },
        });
    }
    async findAll(filters) {
        const { type, genre, city, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (genre)
            where.genre = { contains: genre, mode: 'insensitive' };
        if (search)
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        if (city)
            where.shows = {
                some: { venue: { city: { contains: city, mode: 'insensitive' } } },
            };
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                skip,
                take: limit,
                include: {
                    organiser: { select: { id: true, name: true } },
                    shows: {
                        where: { status: 'SCHEDULED', startTime: { gte: new Date() } },
                        orderBy: { startTime: 'asc' },
                        take: 1,
                        include: {
                            venue: { select: { id: true, name: true, city: true } },
                            showSeatCategoryPrices: {
                                orderBy: { price: 'asc' },
                                take: 1,
                            },
                        },
                    },
                    _count: { select: { shows: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.event.count({ where }),
        ]);
        return {
            events,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organiser: { select: { id: true, name: true } },
                shows: {
                    where: { status: { in: ['SCHEDULED', 'COMPLETED'] } },
                    orderBy: { startTime: 'asc' },
                    include: {
                        venue: true,
                        showSeatCategoryPrices: { include: { category: true } },
                        _count: {
                            select: {
                                showSeats: true,
                            },
                        },
                    },
                },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async update(id, dto, user) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (user.role !== client_1.Role.ADMIN && event.organiserId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.event.update({
            where: { id },
            data: dto,
            include: { organiser: { select: { id: true, name: true } } },
        });
    }
    async remove(id, user) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (user.role !== client_1.Role.ADMIN && event.organiserId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.event.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map