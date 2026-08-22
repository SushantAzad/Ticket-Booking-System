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
exports.VenuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let VenuesService = class VenuesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        return this.prisma.venue.create({
            data: {
                name: dto.name,
                address: dto.address,
                city: dto.city,
                createdById: user.id,
            },
            include: { seatCategories: true },
        });
    }
    async findAll(city) {
        return this.prisma.venue.findMany({
            where: city ? { city } : undefined,
            include: {
                seatCategories: true,
                _count: { select: { venueSeats: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const venue = await this.prisma.venue.findUnique({
            where: { id },
            include: {
                seatCategories: true,
                venueSeats: {
                    include: { category: true },
                    orderBy: [{ row: 'asc' }, { number: 'asc' }],
                },
            },
        });
        if (!venue)
            throw new common_1.NotFoundException('Venue not found');
        return venue;
    }
    async addCategory(venueId, dto, user) {
        await this.assertVenueAccess(venueId, user);
        const existing = await this.prisma.seatCategory.findUnique({
            where: { venueId_name: { venueId, name: dto.name } },
        });
        if (existing)
            throw new common_1.ConflictException(`Category ${dto.name} already exists for this venue`);
        return this.prisma.seatCategory.create({
            data: { venueId, name: dto.name, colorCode: dto.colorCode },
        });
    }
    async addSeats(venueId, dto, user) {
        await this.assertVenueAccess(venueId, user);
        const venue = await this.prisma.venue.findUnique({
            where: { id: venueId },
            include: { seatCategories: true },
        });
        if (!venue)
            throw new common_1.NotFoundException('Venue not found');
        const created = [];
        for (const range of dto.ranges) {
            const category = venue.seatCategories.find((c) => c.name === range.category);
            if (!category) {
                throw new common_1.NotFoundException(`Category ${range.category} not found for venue. Create it first.`);
            }
            for (let num = range.fromNumber; num <= range.toNumber; num++) {
                const seat = await this.prisma.venueSeat.upsert({
                    where: {
                        venueId_row_number: { venueId, row: range.row, number: num },
                    },
                    update: { categoryId: category.id },
                    create: {
                        venueId,
                        categoryId: category.id,
                        row: range.row,
                        number: num,
                        label: `${range.row}${num}`,
                    },
                });
                created.push(seat);
            }
        }
        return { created: created.length, seats: created };
    }
    async assertVenueAccess(venueId, user) {
        if (user.role === client_1.Role.ADMIN)
            return;
        const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
        if (!venue)
            throw new common_1.NotFoundException('Venue not found');
        if (venue.createdById !== user.id)
            throw new common_1.ForbiddenException('Access denied');
    }
};
exports.VenuesService = VenuesService;
exports.VenuesService = VenuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VenuesService);
//# sourceMappingURL=venues.service.js.map