import { Controller } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('photo/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  // @Post()
  // @UseInterceptors(FilesInterceptor('files')) // files[]
  // async upload(@UploadedFiles() files: Express.Multer.File[]) {
  //   const urls = await this.uploadService.uploadFiles(files);
  //   return { urls };
  // }
}
