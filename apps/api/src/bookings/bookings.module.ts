import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [SeatHoldsModule, NotificationsModule, WaitlistModule, RealtimeModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
