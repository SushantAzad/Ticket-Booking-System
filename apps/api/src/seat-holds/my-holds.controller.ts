import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeatHoldsService } from './seat-holds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('seat-holds')
@Controller('holds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyHoldsController {
  constructor(private readonly seatHoldsService: SeatHoldsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my active seat holds' })
  getMyActiveHolds(@CurrentUser() user: User) {
    return this.seatHoldsService.getMyActiveHolds(user);
  }
}
