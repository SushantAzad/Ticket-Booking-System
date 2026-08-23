import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SeatHoldsController } from './seat-holds.controller';
import { SeatHoldsService, SEAT_HOLD_QUEUE } from './seat-holds.service';
import { SeatHoldsRepository } from './seat-holds.repository';
import { SeatHoldExpiryProcessor } from './seat-hold-expiry.processor';
import { MyHoldsController } from './my-holds.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: SEAT_HOLD_QUEUE }),
    RealtimeModule,
  ],
  controllers: [SeatHoldsController, MyHoldsController],
  providers: [SeatHoldsService, SeatHoldsRepository, SeatHoldExpiryProcessor],
  exports: [SeatHoldsService, SeatHoldsRepository],
})
export class SeatHoldsModule {}
