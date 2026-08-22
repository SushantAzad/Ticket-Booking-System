import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from '../seat-holds/seat-holds.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateBookingDto } from './dto/booking.dto';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly holdRepository: SeatHoldsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly waitlistService: WaitlistService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async confirmBooking(dto: CreateBookingDto, user: User) {
    const { holdId } = dto;

    // Fetch hold with items
    const hold = await this.holdRepository.findActiveHold(holdId);
    if (!hold) throw new NotFoundException('Hold not found');
    if (hold.userId !== user.id) throw new ForbiddenException('Not your hold');
    if (hold.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Hold is ${hold.status}. Cannot confirm — the hold may have expired.`,
      );
    }

    // ── The race-safe transition: ACTIVE → COMPLETED ──────────────────────
    // This conditional UPDATE is the same one described in the architecture doc.
    // It races against the expiry worker's conditionalExpire call.
    // Whichever UPDATE commits first wins. The loser gets rowCount = 0.
    const completed = await this.holdRepository.conditionalComplete(holdId);

    if (completed === 0) {
      // Expiry worker won the race — hold has already expired
      throw new BadRequestException(
        'HOLD_EXPIRED: Your seat hold expired moments before confirmation. Please select seats again.',
      );
    }

    // Hold is now COMPLETED — proceed to create the booking record
    const seatIds = hold.items.map((item) => item.showSeatId);

    // Calculate total amount from prices
    const prices = await this.prisma.showSeatCategoryPrice.findMany({
      where: { showId: hold.showId },
      include: { category: true },
    });

    const showSeatsWithCategory = await this.prisma.showSeat.findMany({
      where: { id: { in: seatIds } },
      include: { category: true },
    });

    let totalAmount = new Decimal(0);
    const bookingSeatData: Array<{ showSeatId: string; priceAtBooking: Decimal }> = [];

    for (const showSeat of showSeatsWithCategory) {
      const priceRecord = prices.find((p) => p.categoryId === showSeat.categoryId);
      const price = priceRecord?.price ?? new Decimal(0);
      totalAmount = totalAmount.plus(price);
      bookingSeatData.push({ showSeatId: showSeat.id, priceAtBooking: price });
    }

    // Create booking + booking seats + mark show seats as BOOKED — all in one transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          showId: hold.showId,
          bookingReference: `TBS-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
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

      // Mark seats as BOOKED
      await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'BOOKED', bookingId: newBooking.id },
      });

      return newBooking;
    });

    // ── Side effects (outside the transaction) ────────────────────────────
    // Email + QR generation is async and does not affect seat state
    this.notificationsService
      .sendBookingConfirmation(booking, user)
      .catch((err) => this.logger.error('Notification failed:', err));

    // Broadcast seat status changes
    for (const seatId of seatIds) {
      this.realtimeGateway.broadcastSeatStatus(hold.showId, seatId, 'BOOKED', null);
    }

    return booking;
  }

  async cancelBooking(bookingId: string, user: User) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingSeats: { include: { showSeat: { include: { category: true } } } },
        show: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) throw new ForbiddenException('Not your booking');
    if (booking.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

    const seatIds = booking.bookingSeats.map((bs) => bs.showSeatId);

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // Check waitlist for each seat and move to OFFERED or AVAILABLE
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
          // Offer this seat to the next waitlist entrant
          const offerExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min offer

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

          // Broadcast offer
          this.realtimeGateway.broadcastOfferCreated(
            booking.showId,
            nextEntry.userId,
            nextEntry.id,
            offerExpiresAt,
          );
        } else {
          // No waitlist — seat returns to AVAILABLE
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

  async getBooking(bookingId: string, user: User) {
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

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) throw new ForbiddenException('Not your booking');

    return booking;
  }

  async getMyBookings(user: User, page = 1, limit = 20) {
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
}
