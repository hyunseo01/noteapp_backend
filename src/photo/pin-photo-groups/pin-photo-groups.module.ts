import { Module } from '@nestjs/common';
import { PinPhotoGroupsService } from './pin-photo-groups.service';
import { PinPhotoGroupsController } from './pin-photo-groups.controller';

@Module({
  controllers: [PinPhotoGroupsController],
  providers: [PinPhotoGroupsService],
})
export class PinPhotoGroupsModule {}
