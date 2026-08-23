import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import {
  CreateVenueDto,
  CreateSeatCategoryDto,
  AddSeatsDto,
} from './dto/venue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a venue (Admin/Organiser)' })
  create(@Body() dto: CreateVenueDto, @CurrentUser() user: any) {
    return this.venuesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all venues' })
  @ApiQuery({ name: 'city', required: false })
  findAll(@Query('city') city?: string) {
    return this.venuesService.findAll(city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue with seat layout' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Post(':id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add seat category to venue' })
  addCategory(
    @Param('id') id: string,
    @Body() dto: CreateSeatCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.venuesService.addCategory(id, dto, user);
  }

  @Post(':id/seats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add seats to venue layout' })
  addSeats(
    @Param('id') id: string,
    @Body() dto: AddSeatsDto,
    @CurrentUser() user: any,
  ) {
    return this.venuesService.addSeats(id, dto, user);
  }
}
