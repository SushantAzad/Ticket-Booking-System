"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const gemini_provider_1 = require("./gemini.provider");
let AiProviderFactory = class AiProviderFactory {
    configService;
    geminiProvider;
    constructor(configService, geminiProvider) {
        this.configService = configService;
        this.geminiProvider = geminiProvider;
    }
    getProvider() {
        const providerName = this.configService.get('AI_PROVIDER', 'gemini');
        switch (providerName.toLowerCase()) {
            case 'gemini':
                return this.geminiProvider;
            default:
                return this.geminiProvider;
        }
    }
};
exports.AiProviderFactory = AiProviderFactory;
exports.AiProviderFactory = AiProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        gemini_provider_1.GeminiProvider])
], AiProviderFactory);
//# sourceMappingURL=ai-provider.factory.js.map