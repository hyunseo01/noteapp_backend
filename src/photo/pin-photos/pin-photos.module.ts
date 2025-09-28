import { Module } from '@nestjs/common';
import { PinPhotosService } from './pin-photos.service';
import { PinPhotosController } from './pin-photos.controller';

@Module({
  controllers: [PinPhotosController],
  providers: [PinPhotosService],
})
export class PinPhotosModule {}
