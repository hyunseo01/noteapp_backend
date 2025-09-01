import { Module } from '@nestjs/common';
import { PinAreaTypesService } from './pin-area-types.service';
import { PinAreaTypesController } from './pin-area-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PinAreaType } from './entities/pin-area-type.entity';
import { Pin } from '../pins/entities/pin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PinAreaType, Pin])],
  controllers: [PinAreaTypesController],
  providers: [PinAreaTypesService],
})
export class PinAreaTypesModule {}
