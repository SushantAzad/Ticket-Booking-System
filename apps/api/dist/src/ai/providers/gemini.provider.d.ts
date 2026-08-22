import { ConfigService } from '@nestjs/config';
import { AIProvider, StructuredFilters, RecommendationContext } from './ai-provider.interface';
export declare class GeminiProvider implements AIProvider {
    private readonly configService;
    private readonly logger;
    private ai;
    private readonly modelName;
    constructor(configService: ConfigService);
    interpretEventQuery(rawText: string): Promise<StructuredFilters>;
    explainRecommendation(context: RecommendationContext): Promise<string>;
    private mockInterpret;
    private mockExplain;
}
