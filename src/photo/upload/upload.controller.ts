import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('photo/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  // @Post()
  // @UseInterceptors(FilesInterceptor('files')) // files[]
  // async upload(@UploadedFiles() files: Express.Multer.File[]) {
  //   const urls = await this.uploadService.uploadFiles(files); // S3 연동은 나중에
  //   return { urls };
  // }
}
