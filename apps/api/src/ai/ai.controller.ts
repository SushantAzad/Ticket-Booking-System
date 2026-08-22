import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiQueryDto {
  @ApiProperty({ example: 'I need 2 VIP tickets for a rock concert in Mumbai' })
  @IsString()
  @IsNotEmpty()
  query: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('event-search')
  @ApiOperation({ summary: 'AI-powered natural language event search and seat recommendation' })
  search(@Body() dto: AiQueryDto) {
    return this.aiService.processEventQuery(dto.query);
  }
}
