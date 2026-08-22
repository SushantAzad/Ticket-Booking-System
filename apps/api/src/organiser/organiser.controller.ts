import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('organiser')
@Controller('organiser')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANISER, Role.ADMIN)
@ApiBearerAuth()
export class OrganiserController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get organiser overview analytics' })
  async getDashboard(@CurrentUser() user: any) {
    // 1. Get all events for this organiser
    const events = await this.prisma.event.findMany({
      where: { organiserId: user.id },
      select: { id: true },
    });
    const eventIds = events.map((e) => e.id);

    // 2. Get all shows for these events
    const shows = await this.prisma.show.findMany({
      where: { eventId: { in: eventIds } },
      select: { id: true },
    });
    const showIds = shows.map((s) => s.id);

    // 3. Aggregate bookings
    const bookings = await this.prisma.booking.aggregate({
      where: {
        showId: { in: showIds },
        status: 'CONFIRMED',
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // 4. Upcoming shows list
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
}
