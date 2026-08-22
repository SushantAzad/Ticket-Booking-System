import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import compression = require('compression');
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`\n🎟️  Ticket Booking System API`);
  console.log(`🚀  Server: http://localhost:${port}`);
  console.log(`📖  Swagger: http://localhost:${port}/api/docs\n`);
}

bootstrap();
