import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { User, SeatCategoryName } from '@prisma/client';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async joinWaitlist(showId: string, categoryId: string, user: User) {
    const show = await this.prisma.show.findUnique({ where: { id: showId } });
    if (!show) throw new NotFoundException('Show not found');

    const category = await this.prisma.seatCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Prevent duplicates
    const existing = await this.prisma.waitlistEntry.findUnique({
      where: {
        userId_showId_categoryId: { userId: user.id, showId, categoryId },
      },
    });

    if (existing) {
      if (existing.status === 'WAITING') {
        throw new ConflictException(
          'You are already on the waitlist for this category',
        );
      }
      // If previous entry was cancelled/expired, let them rejoin at the back of the queue
      await this.prisma.waitlistEntry.update({
        where: { id: existing.id },
        data: {
          status: 'WAITING',
          position: await this.getNextPosition(showId, categoryId),
        },
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

  private async getNextPosition(showId: string, categoryId: string) {
    const lastEntry = await this.prisma.waitlistEntry.findFirst({
      where: { showId, categoryId },
      orderBy: { position: 'desc' },
    });
    return lastEntry ? lastEntry.position + 1 : 1;
  }

  async leaveWaitlist(entryId: string, user: User) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) throw new NotFoundException('Waitlist entry not found');
    if (entry.userId !== user.id)
      throw new ForbiddenException('Not your entry');

    await this.prisma.waitlistEntry.update({
      where: { id: entryId },
      data: { status: 'CANCELLED' },
    });

    // If they had an active offer, expire it immediately and reassign the seat
    const activeOffer = await this.prisma.waitlistOffer.findFirst({
      where: { waitlistEntryId: entryId, status: 'ACTIVE' },
    });

    if (activeOffer) {
      await this.expireOfferAndReassign(activeOffer.id);
    }

    return { success: true };
  }

  /**
   * Called automatically when an offer expires (by the cron/sweep job)
   * or when a user cancels their waitlist entry while holding an active offer.
   */
  async expireOfferAndReassign(offerId: string) {
    const offer = await this.prisma.waitlistOffer.findUnique({
      where: { id: offerId },
      include: {
        waitlistEntry: true,
        showSeat: { include: { category: true } },
      },
    });

    if (!offer || offer.status !== 'ACTIVE') return;

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark offer and entry as EXPIRED
      await tx.waitlistOffer.update({
        where: { id: offerId },
        data: { status: 'EXPIRED' },
      });

      await tx.waitlistEntry.update({
        where: { id: offer.waitlistEntryId },
        data: { status: 'EXPIRED' },
      });

      // 2. Find next person in line
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
        // Offer to next person
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

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

        this.realtimeGateway.broadcastOfferCreated(
          nextEntry.showId,
          nextEntry.userId,
          nextEntry.id,
          expiresAt,
        );

        this.notificationsService.sendWaitlistOffer(
          nextEntry.user.email,
          nextEntry.user.name,
          nextEntry.show.event.title,
          expiresAt,
        );
      } else {
        // No one left on waitlist — seat becomes AVAILABLE
        await tx.showSeat.update({
          where: { id: offer.showSeatId },
          data: { status: 'AVAILABLE' },
        });

        this.realtimeGateway.broadcastSeatStatus(
          offer.waitlistEntry.showId,
          offer.showSeatId,
          'AVAILABLE',
          null,
        );
      }
    });
  }

  async getMyWaitlist(user: User) {
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
}
