import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsPositive,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SeatCategoryName } from '@prisma/client';

export class ShowCategoryPriceDto {
  @ApiProperty({ enum: SeatCategoryName })
  @IsEnum(SeatCategoryName)
  category: SeatCategoryName;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateShowDto {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  venueId: string;

  @ApiProperty({ example: '2025-12-01T14:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-12-01T16:30:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ type: [ShowCategoryPriceDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShowCategoryPriceDto)
  prices: ShowCategoryPriceDto[];
}
