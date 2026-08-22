import {
  Controller, Post, Get, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Confirm a seat hold into a booking',
    description: 'Race-safe transition: HOLD_ACTIVE → BOOKING_CONFIRMED. Returns HOLD_EXPIRED if hold TTL passed.',
  })
  confirm(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    return this.bookingsService.confirmBooking(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get my booking history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyBookings(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.getMyBookings(user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking with seats and tickets' })
  getBooking(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.getBooking(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking — triggers waitlist assignment' })
  cancelBooking(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.cancelBooking(id, user);
  }
}
