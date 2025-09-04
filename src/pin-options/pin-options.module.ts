import { Module } from '@nestjs/common';
import { PinOptionsService } from './pin-options.service';
import { PinOptionsController } from './pin-options.controller';

@Module({
  controllers: [PinOptionsController],
  providers: [PinOptionsService],
})
export class PinOptionsModule {}
