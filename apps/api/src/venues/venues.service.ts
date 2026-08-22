import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto, CreateSeatCategoryDto, AddSeatsDto } from './dto/venue.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, user: User) {
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

  async findAll(city?: string) {
    return this.prisma.venue.findMany({
      where: city ? { city } : undefined,
      include: {
        seatCategories: true,
        _count: { select: { venueSeats: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
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

    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async addCategory(venueId: string, dto: CreateSeatCategoryDto, user: User) {
    await this.assertVenueAccess(venueId, user);

    const existing = await this.prisma.seatCategory.findUnique({
      where: { venueId_name: { venueId, name: dto.name } },
    });

    if (existing) throw new ConflictException(`Category ${dto.name} already exists for this venue`);

    return this.prisma.seatCategory.create({
      data: { venueId, name: dto.name, colorCode: dto.colorCode },
    });
  }

  async addSeats(venueId: string, dto: AddSeatsDto, user: User) {
    await this.assertVenueAccess(venueId, user);

    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      include: { seatCategories: true },
    });

    if (!venue) throw new NotFoundException('Venue not found');

    const created: unknown[] = [];

    for (const range of dto.ranges) {
      const category = venue.seatCategories.find((c) => c.name === range.category);
      if (!category) {
        throw new NotFoundException(
          `Category ${range.category} not found for venue. Create it first.`,
        );
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

  private async assertVenueAccess(venueId: string, user: User) {
    if (user.role === Role.ADMIN) return;

    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    if (venue.createdById !== user.id) throw new ForbiddenException('Access denied');
  }
}
