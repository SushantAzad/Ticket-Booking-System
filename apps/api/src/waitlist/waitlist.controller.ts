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
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinWaitlistDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

@ApiTags('waitlist')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post('shows/:showId/waitlist')
  @ApiOperation({ summary: 'Join waitlist for a specific show and category' })
  joinWaitlist(
    @Param('showId') showId: string,
    @Body() dto: JoinWaitlistDto,
    @CurrentUser() user: any,
  ) {
    return this.waitlistService.joinWaitlist(showId, dto.categoryId, user);
  }

  @Delete('waitlist/:id')
  @ApiOperation({ summary: 'Leave waitlist / Reject offer' })
  leaveWaitlist(@Param('id') id: string, @CurrentUser() user: any) {
    return this.waitlistService.leaveWaitlist(id, user);
  }

  @Get('waitlist/me')
  @ApiOperation({ summary: 'Get my waitlist entries and active offers' })
  getMyWaitlist(@CurrentUser() user: any) {
    return this.waitlistService.getMyWaitlist(user);
  }
}
