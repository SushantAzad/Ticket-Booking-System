import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/show.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('shows')
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a show (generates ShowSeats from venue layout)' })
  create(@Body() dto: CreateShowDto, @CurrentUser() user: any) {
    return this.showsService.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get show details with pricing' })
  findOne(@Param('id') id: string) {
    return this.showsService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get seat availability counts by category and status' })
  getAvailability(@Param('id') id: string) {
    return this.showsService.getAvailabilityStats(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a show' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.showsService.cancel(id, user);
  }
}
