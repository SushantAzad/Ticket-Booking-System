import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider.interface';
import { GeminiProvider } from './gemini.provider';
export declare class AiProviderFactory {
    private readonly configService;
    private readonly geminiProvider;
    constructor(configService: ConfigService, geminiProvider: GeminiProvider);
    getProvider(): AIProvider;
}
