import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { EventsModule } from './events/events.module';
import { ShowsModule } from './shows/shows.module';
import { SeatsModule } from './seats/seats.module';
import { SeatHoldsModule } from './seat-holds/seat-holds.module';
import { BookingsModule } from './bookings/bookings.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { OrganiserModule } from './organiser/organiser.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // BullMQ with Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Core infrastructure
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    VenuesModule,
    EventsModule,
    ShowsModule,
    SeatsModule,
    SeatHoldsModule,
    BookingsModule,
    WaitlistModule,
    TicketsModule,
    NotificationsModule,
    RealtimeModule,
    OrganiserModule,
    AdminModule,
    AiModule,
    JobsModule,
  ],
})
export class AppModule {}
