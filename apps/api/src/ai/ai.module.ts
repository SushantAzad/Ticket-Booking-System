import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProviderFactory } from './providers/ai-provider.factory';
import { GeminiProvider } from './providers/gemini.provider';
import { EventsModule } from '../events/events.module';
import { SeatsModule } from '../seats/seats.module';

@Module({
  imports: [EventsModule, SeatsModule],
  controllers: [AiController],
  providers: [AiService, AiProviderFactory, GeminiProvider],
})
export class AiModule {}
