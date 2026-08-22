import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsHexColor,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SeatCategoryName } from '@prisma/client';

export class CreateVenueDto {
  @ApiProperty({ example: 'Cineplex Grand' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '12 Film Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;
}

export class CreateSeatCategoryDto {
  @ApiProperty({ enum: SeatCategoryName })
  @IsEnum(SeatCategoryName)
  name: SeatCategoryName;

  @ApiProperty({ example: '#4ade80' })
  @IsHexColor()
  colorCode: string;
}

export class SeatRangeDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  row: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  fromNumber: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  toNumber: number;

  @ApiProperty({ enum: SeatCategoryName })
  @IsEnum(SeatCategoryName)
  category: SeatCategoryName;
}

export class AddSeatsDto {
  @ApiProperty({ type: [SeatRangeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeatRangeDto)
  ranges: SeatRangeDto[];
}
