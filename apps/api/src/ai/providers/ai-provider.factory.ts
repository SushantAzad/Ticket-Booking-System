import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider.interface';
import { GeminiProvider } from './gemini.provider';
// Other providers would be imported here

@Injectable()
export class AiProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  getProvider(): AIProvider {
    const providerName = this.configService.get<string>(
      'AI_PROVIDER',
      'gemini',
    );

    switch (providerName.toLowerCase()) {
      case 'gemini':
        return this.geminiProvider;
      // case 'claude': return this.claudeProvider;
      // case 'openai': return this.openaiProvider;
      default:
        return this.geminiProvider;
    }
  }
}
