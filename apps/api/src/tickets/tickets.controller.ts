import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify a ticket QR code' })
  async verify(@Param('id') id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        bookingSeat: {
          include: {
            showSeat: {
              include: { venueSeat: true, category: true },
            },
            booking: { select: { status: true, bookingReference: true } },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const isValid = ticket.bookingSeat.booking.status === 'CONFIRMED';

    return {
      valid: isValid,
      ticketId: ticket.id,
      bookingReference: ticket.bookingSeat.booking.bookingReference,
      seat: ticket.bookingSeat.showSeat.venueSeat.label,
      category: ticket.bookingSeat.showSeat.category.name,
      issuedAt: ticket.issuedAt,
    };
  }
}
