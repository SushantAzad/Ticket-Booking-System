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
var WaitlistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let WaitlistService = WaitlistService_1 = class WaitlistService {
    prisma;
    realtimeGateway;
    notificationsService;
    logger = new common_1.Logger(WaitlistService_1.name);
    constructor(prisma, realtimeGateway, notificationsService) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
        this.notificationsService = notificationsService;
    }
    async joinWaitlist(showId, categoryId, user) {
        const show = await this.prisma.show.findUnique({ where: { id: showId } });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        const category = await this.prisma.seatCategory.findUnique({ where: { id: categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const existing = await this.prisma.waitlistEntry.findUnique({
            where: { userId_showId_categoryId: { userId: user.id, showId, categoryId } },
        });
        if (existing) {
            if (existing.status === 'WAITING') {
                throw new common_1.ConflictException('You are already on the waitlist for this category');
            }
            await this.prisma.waitlistEntry.update({
                where: { id: existing.id },
                data: { status: 'WAITING', position: await this.getNextPosition(showId, categoryId) },
            });
            return existing;
        }
        const position = await this.getNextPosition(showId, categoryId);
        return this.prisma.waitlistEntry.create({
            data: {
                userId: user.id,
                showId,
                categoryId,
                position,
                status: 'WAITING',
            },
        });
    }
    async getNextPosition(showId, categoryId) {
        const lastEntry = await this.prisma.waitlistEntry.findFirst({
            where: { showId, categoryId },
            orderBy: { position: 'desc' },
        });
        return lastEntry ? lastEntry.position + 1 : 1;
    }
    async leaveWaitlist(entryId, user) {
        const entry = await this.prisma.waitlistEntry.findUnique({ where: { id: entryId } });
        if (!entry)
            throw new common_1.NotFoundException('Waitlist entry not found');
        if (entry.userId !== user.id)
            throw new common_1.ForbiddenException('Not your entry');
        await this.prisma.waitlistEntry.update({
            where: { id: entryId },
            data: { status: 'CANCELLED' },
        });
        const activeOffer = await this.prisma.waitlistOffer.findFirst({
            where: { waitlistEntryId: entryId, status: 'ACTIVE' },
        });
        if (activeOffer) {
            await this.expireOfferAndReassign(activeOffer.id);
        }
        return { success: true };
    }
    async expireOfferAndReassign(offerId) {
        const offer = await this.prisma.waitlistOffer.findUnique({
            where: { id: offerId },
            include: {
                waitlistEntry: true,
                showSeat: { include: { category: true } },
            },
        });
        if (!offer || offer.status !== 'ACTIVE')
            return;
        await this.prisma.$transaction(async (tx) => {
            await tx.waitlistOffer.update({
                where: { id: offerId },
                data: { status: 'EXPIRED' },
            });
            await tx.waitlistEntry.update({
                where: { id: offer.waitlistEntryId },
                data: { status: 'EXPIRED' },
            });
            const nextEntry = await tx.waitlistEntry.findFirst({
                where: {
                    showId: offer.waitlistEntry.showId,
                    categoryId: offer.showSeat.categoryId,
                    status: 'WAITING',
                },
                orderBy: { position: 'asc' },
                include: { user: true, show: { include: { event: true } } },
            });
            if (nextEntry) {
                const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
                await tx.waitlistEntry.update({
                    where: { id: nextEntry.id },
                    data: { status: 'OFFERED' },
                });
                await tx.waitlistOffer.create({
                    data: {
                        waitlistEntryId: nextEntry.id,
                        showSeatId: offer.showSeatId,
                        expiresAt,
                        status: 'ACTIVE',
                    },
                });
                this.realtimeGateway.broadcastOfferCreated(nextEntry.showId, nextEntry.userId, nextEntry.id, expiresAt);
                this.notificationsService.sendWaitlistOffer(nextEntry.user.email, nextEntry.user.name, nextEntry.show.event.title, expiresAt);
            }
            else {
                await tx.showSeat.update({
                    where: { id: offer.showSeatId },
                    data: { status: 'AVAILABLE' },
                });
                this.realtimeGateway.broadcastSeatStatus(offer.waitlistEntry.showId, offer.showSeatId, 'AVAILABLE', null);
            }
        });
    }
    async getMyWaitlist(user) {
        return this.prisma.waitlistEntry.findMany({
            where: { userId: user.id },
            include: {
                show: { include: { event: true } },
                category: true,
                offers: {
                    where: { status: 'ACTIVE' },
                    include: { showSeat: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = WaitlistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map