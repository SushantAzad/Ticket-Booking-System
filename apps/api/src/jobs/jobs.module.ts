import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SeatHoldsModule,
    RealtimeModule,
    WaitlistModule,
  ],
  providers: [JobsService],
})
export class JobsModule {}
