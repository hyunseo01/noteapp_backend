import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { UnitOption } from '../unit-option/entities/unit-option.entity';
import { Pin } from '../pins/entities/pin.entity';
import { PinAreaType } from '../pin-area-types/entities/pin-area-type.entity';
import { PinDirection } from '../pin-directions/entities/pin-direction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Unit,
      UnitOption,
      Pin,
      PinAreaType,
      PinDirection,
    ]),
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
