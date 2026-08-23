import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventType, Role, User } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, user: User) {
    return this.prisma.event.create({
      data: { ...dto, organiserId: user.id },
      include: { organiser: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(filters: {
    type?: EventType;
    genre?: string;
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, genre, city, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (genre) where.genre = { contains: genre, mode: 'insensitive' };
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

  async findOne(id: string) {
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

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto, user: User) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    if (user.role !== Role.ADMIN && event.organiserId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.event.update({
      where: { id },
      data: dto,
      include: { organiser: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, user: User) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    if (user.role !== Role.ADMIN && event.organiserId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
