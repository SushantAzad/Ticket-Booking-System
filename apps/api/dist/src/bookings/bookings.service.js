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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const seat_holds_repository_1 = require("../seat-holds/seat-holds.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const waitlist_service_1 = require("../waitlist/waitlist.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const library_1 = require("@prisma/client/runtime/library");
const uuid_1 = require("uuid");
let BookingsService = BookingsService_1 = class BookingsService {
    prisma;
    holdRepository;
    notificationsService;
    waitlistService;
    realtimeGateway;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(prisma, holdRepository, notificationsService, waitlistService, realtimeGateway) {
        this.prisma = prisma;
        this.holdRepository = holdRepository;
        this.notificationsService = notificationsService;
        this.waitlistService = waitlistService;
        this.realtimeGateway = realtimeGateway;
    }
    async confirmBooking(dto, user) {
        const { holdId } = dto;
        const hold = await this.holdRepository.findActiveHold(holdId);
        if (!hold)
            throw new common_1.NotFoundException('Hold not found');
        if (hold.userId !== user.id)
            throw new common_1.ForbiddenException('Not your hold');
        if (hold.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`Hold is ${hold.status}. Cannot confirm — the hold may have expired.`);
        }
        const completed = await this.holdRepository.conditionalComplete(holdId);
        if (completed === 0) {
            throw new common_1.BadRequestException('HOLD_EXPIRED: Your seat hold expired moments before confirmation. Please select seats again.');
        }
        const seatIds = hold.items.map((item) => item.showSeatId);
        const prices = await this.prisma.showSeatCategoryPrice.findMany({
            where: { showId: hold.showId },
            include: { category: true },
        });
        const showSeatsWithCategory = await this.prisma.showSeat.findMany({
            where: { id: { in: seatIds } },
            include: { category: true },
        });
        let totalAmount = new library_1.Decimal(0);
        const bookingSeatData = [];
        for (const showSeat of showSeatsWithCategory) {
            const priceRecord = prices.find((p) => p.categoryId === showSeat.categoryId);
            const price = priceRecord?.price ?? new library_1.Decimal(0);
            totalAmount = totalAmount.plus(price);
            bookingSeatData.push({ showSeatId: showSeat.id, priceAtBooking: price });
        }
        const booking = await this.prisma.$transaction(async (tx) => {
            const newBooking = await tx.booking.create({
                data: {
                    userId: user.id,
                    showId: hold.showId,
                    bookingReference: `TBS-${Date.now()}-${(0, uuid_1.v4)().slice(0, 6).toUpperCase()}`,
                    totalAmount,
                    status: 'CONFIRMED',
                    bookingSeats: {
                        create: bookingSeatData,
                    },
                },
                include: {
                    bookingSeats: { include: { showSeat: { include: { venueSeat: true, category: true } } } },
                    show: { include: { event: true, venue: true } },
                },
            });
            await tx.showSeat.updateMany({
                where: { id: { in: seatIds } },
                data: { status: 'BOOKED', bookingId: newBooking.id },
            });
            return newBooking;
        });
        this.notificationsService
            .sendBookingConfirmation(booking, user)
            .catch((err) => this.logger.error('Notification failed:', err));
        for (const seatId of seatIds) {
            this.realtimeGateway.broadcastSeatStatus(hold.showId, seatId, 'BOOKED', null);
        }
        return booking;
    }
    async cancelBooking(bookingId, user) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                bookingSeats: { include: { showSeat: { include: { category: true } } } },
                show: true,
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.userId !== user.id)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status === 'CANCELLED')
            throw new common_1.BadRequestException('Already cancelled');
        const seatIds = booking.bookingSeats.map((bs) => bs.showSeatId);
        await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
            });
            for (const bookingSeat of booking.bookingSeats) {
                const seat = bookingSeat.showSeat;
                const nextEntry = await tx.waitlistEntry.findFirst({
                    where: {
                        showId: booking.showId,
                        categoryId: seat.categoryId,
                        status: 'WAITING',
                    },
                    orderBy: { position: 'asc' },
                });
                if (nextEntry) {
                    const offerExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
                    await tx.showSeat.update({
                        where: { id: seat.id },
                        data: { status: 'OFFERED', bookingId: null },
                    });
                    await tx.waitlistEntry.update({
                        where: { id: nextEntry.id },
                        data: { status: 'OFFERED' },
                    });
                    await tx.waitlistOffer.create({
                        data: {
                            waitlistEntryId: nextEntry.id,
                            showSeatId: seat.id,
                            expiresAt: offerExpiresAt,
                            status: 'ACTIVE',
                        },
                    });
                    this.realtimeGateway.broadcastOfferCreated(booking.showId, nextEntry.userId, nextEntry.id, offerExpiresAt);
                }
                else {
                    await tx.showSeat.update({
                        where: { id: seat.id },
                        data: { status: 'AVAILABLE', bookingId: null },
                    });
                    this.realtimeGateway.broadcastSeatStatus(booking.showId, seat.id, 'AVAILABLE', null);
                }
            }
        });
        return { cancelled: true, bookingId };
    }
    async getBooking(bookingId, user) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                bookingSeats: {
                    include: {
                        showSeat: { include: { venueSeat: true, category: true } },
                        ticket: true,
                    },
                },
                show: { include: { event: true, venue: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.userId !== user.id)
            throw new common_1.ForbiddenException('Not your booking');
        return booking;
    }
    async getMyBookings(user, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: { userId: user.id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    show: { include: { event: true, venue: true } },
                    _count: { select: { bookingSeats: true } },
                },
            }),
            this.prisma.booking.count({ where: { userId: user.id } }),
        ]);
        return { bookings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        seat_holds_repository_1.SeatHoldsRepository,
        notifications_service_1.NotificationsService,
        waitlist_service_1.WaitlistService,
        realtime_gateway_1.RealtimeGateway])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map