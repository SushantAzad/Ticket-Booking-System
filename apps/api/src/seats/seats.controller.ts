import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SeatsService } from './seats.service';

@ApiTags('seats')
@Controller('shows/:showId/seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get full seat map for a show with live status' })
  getSeatMap(@Param('showId') showId: string) {
    return this.seatsService.getSeatMap(showId);
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Get deterministic seat recommendations' })
  @ApiQuery({ name: 'count', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'maxBudget', required: false, type: Number })
  recommend(
    @Param('showId') showId: string,
    @Query('count') count?: number,
    @Query('category') category?: string,
    @Query('maxBudget') maxBudget?: number,
  ) {
    return this.seatsService.recommendSeats(showId, {
      count: count ?? 1,
      categoryPreference: category,
      maxBudgetPerSeat: maxBudget,
    });
  }
}
