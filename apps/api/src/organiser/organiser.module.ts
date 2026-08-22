import { Module } from '@nestjs/common';
import { OrganiserController } from './organiser.controller';

@Module({
  controllers: [OrganiserController],
})
export class OrganiserModule {}
