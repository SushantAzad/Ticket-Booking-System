"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const compression = require("compression");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.use(compression());
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Ticket Booking System API')
        .setDescription('Production-grade ticket booking platform with real-time seat availability')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('events', 'Event discovery and management')
        .addTag('shows', 'Show management')
        .addTag('seats', 'Seat map and recommendations')
        .addTag('seat-holds', 'Seat hold management (10-min TTL)')
        .addTag('bookings', 'Booking confirmation and history')
        .addTag('tickets', 'Ticket retrieval and QR verification')
        .addTag('waitlist', 'Waitlist management')
        .addTag('organiser', 'Organiser dashboard')
        .addTag('admin', 'Admin panel')
        .addTag('ai', 'AI-powered event and seat discovery')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`\n🎟️  Ticket Booking System API`);
    console.log(`🚀  Server: http://localhost:${port}`);
    console.log(`📖  Swagger: http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map