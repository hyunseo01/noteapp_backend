import { Module } from '@nestjs/common';
import { UnitOptionService } from './unit-option.service';
import { UnitOptionController } from './unit-option.controller';
import { Unit } from '../units/entities/unit.entity';
import { UnitOption } from './entities/unit-option.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, UnitOption])],
  controllers: [UnitOptionController],
  providers: [UnitOptionService],
})
export class UnitOptionModule {}
