import { Module } from '@nestjs/common';
import { PinsService } from './pins.service';
import { PinsController } from './pins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pin } from './entities/pin.entity';
import { PinAreaType } from '../pin-area-types/entities/pin-area-type.entity';
import { PinDirection } from '../pin-directions/entities/pin-direction.entity';
import { Unit } from '../units/entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pin, PinAreaType, PinDirection, Unit])],
  controllers: [PinsController],
  providers: [PinsService],
})
export class PinsModule {}
