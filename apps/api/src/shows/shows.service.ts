import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowDto } from './dto/show.dto';
import { Role, ShowStatus, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ShowsService {
  private readonly logger = new Logger(ShowsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShowDto, user: User) {
    // Verify event exists and user has access
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (user.role !== Role.ADMIN && event.organiserId !== user.id) {
      throw new ForbiddenException('Only the event organiser can create shows');
    }

    const venue = await this.prisma.venue.findUnique({
      where: { id: dto.venueId },
      include: { seatCategories: true, venueSeats: true },
    });
    if (!venue) throw new NotFoundException('Venue not found');

    if (new Date(dto.startTime) >= new Date(dto.endTime)) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Create show + prices + ShowSeats (one per VenueSeat) in a single transaction
    const show = await this.prisma.$transaction(async (tx) => {
      const newShow = await tx.show.create({
        data: {
          eventId: dto.eventId,
          venueId: dto.venueId,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          status: ShowStatus.SCHEDULED,
        },
      });

      // Create pricing entries
      for (const priceDto of dto.prices) {
        const category = venue.seatCategories.find(
          (c) => c.name === priceDto.category,
        );
        if (!category) continue;

        await tx.showSeatCategoryPrice.create({
          data: {
            showId: newShow.id,
            categoryId: category.id,
            price: new Decimal(priceDto.price),
          },
        });
      }

      // Generate ShowSeat for every VenueSeat — the independent snapshot per show
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

    this.logger.log(
      `Show ${show.id} created with ${venue.venueSeats.length} seats for event ${dto.eventId}`,
    );

    return this.findOne(show.id);
  }

  async findOne(id: string) {
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

    if (!show) throw new NotFoundException('Show not found');
    return show;
  }

  async findByEvent(eventId: string) {
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

  async cancel(showId: string, user: User) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
      include: { event: true },
    });

    if (!show) throw new NotFoundException('Show not found');
    if (user.role !== Role.ADMIN && show.event.organiserId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.show.update({
      where: { id: showId },
      data: { status: ShowStatus.CANCELLED },
    });
  }

  async getAvailabilityStats(showId: string) {
    const counts = await this.prisma.showSeat.groupBy({
      by: ['status', 'categoryId'],
      where: { showId },
      _count: { status: true },
    });

    return counts;
  }
}
