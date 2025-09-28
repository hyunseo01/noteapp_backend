import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdatePinPhotoDto {
  @IsArray()
  @IsInt({ each: true })
  photoIds!: number[];

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  moveGroupId?: number;
}
