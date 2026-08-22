import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'The active hold ID to confirm' })
  @IsString()
  @IsNotEmpty()
  holdId: string;
}
