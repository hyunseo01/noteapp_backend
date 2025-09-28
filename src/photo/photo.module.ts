import { Module } from '@nestjs/common';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { PinPhotoGroupsModule } from './pin-photo-groups/pin-photo-groups.module';
import { PinPhotosModule } from './pin-photos/pin-photos.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [UploadModule, PinPhotoGroupsModule, PinPhotosModule]
})
export class PhotoModule {}
