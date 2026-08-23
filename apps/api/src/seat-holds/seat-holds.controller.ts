import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SeatHoldsService } from './seat-holds.service';
import { CreateHoldDto } from './dto/seat-hold.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('seat-holds')
@Controller('shows/:showId/holds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SeatHoldsController {
  constructor(private readonly seatHoldsService: SeatHoldsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a seat hold (10-min TTL)',
    description:
      'Atomically holds seats using SELECT...FOR UPDATE. Returns SEAT_ALREADY_HELD if any seat is unavailable.',
  })
  createHold(
    @Param('showId') showId: string,
    @Body() dto: CreateHoldDto,
    @CurrentUser() user: any,
  ) {
    return this.seatHoldsService.createHold(showId, dto, user);
  }

  @Get(':holdId')
  @ApiOperation({ summary: 'Get hold status and details' })
  getHold(
    @Param('showId') showId: string,
    @Param('holdId') holdId: string,
    @CurrentUser() user: any,
  ) {
    return this.seatHoldsService.getHold(holdId, user);
  }

  @Delete(':holdId')
  @ApiOperation({ summary: 'Release a hold (user cancels selection)' })
  releaseHold(
    @Param('showId') showId: string,
    @Param('holdId') holdId: string,
    @CurrentUser() user: any,
  ) {
    return this.seatHoldsService.releaseHold(holdId, showId, user);
  }
}
