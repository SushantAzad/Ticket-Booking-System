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
exports.OrganiserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let OrganiserController = class OrganiserController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(user) {
        const events = await this.prisma.event.findMany({
            where: { organiserId: user.id },
            select: { id: true },
        });
        const eventIds = events.map((e) => e.id);
        const shows = await this.prisma.show.findMany({
            where: { eventId: { in: eventIds } },
            select: { id: true },
        });
        const showIds = shows.map((s) => s.id);
        const bookings = await this.prisma.booking.aggregate({
            where: {
                showId: { in: showIds },
                status: 'CONFIRMED',
            },
            _sum: { totalAmount: true },
            _count: true,
        });
        const upcomingShows = await this.prisma.show.findMany({
            where: {
                eventId: { in: eventIds },
                startTime: { gte: new Date() },
            },
            orderBy: { startTime: 'asc' },
            take: 5,
            include: {
                event: { select: { title: true } },
                _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
            },
        });
        return {
            totalEvents: events.length,
            totalShows: shows.length,
            totalBookings: bookings._count,
            totalRevenue: bookings._sum.totalAmount || 0,
            upcomingShows,
        };
    }
};
exports.OrganiserController = OrganiserController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organiser overview analytics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganiserController.prototype, "getDashboard", null);
exports.OrganiserController = OrganiserController = __decorate([
    (0, swagger_1.ApiTags)('organiser'),
    (0, common_1.Controller)('organiser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ORGANISER, client_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganiserController);
//# sourceMappingURL=organiser.controller.js.map