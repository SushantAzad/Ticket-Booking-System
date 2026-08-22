import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  async getUsers(@Query('role') role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { bookings: true, organisedEvents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform-wide dashboard' })
  async getDashboard() {
    const [userCount, eventCount, bookingCount, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.event.count(),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalUsers: userCount,
      totalEvents: eventCount,
      totalBookings: bookingCount,
      totalPlatformRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}
