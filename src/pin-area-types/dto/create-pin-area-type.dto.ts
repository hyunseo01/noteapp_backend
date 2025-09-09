import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePinAreaTypeDto {
  @Type(() => Number)
  @IsNumber()
  exclusiveArea!: number; // ㎡

  @IsOptional()
  @IsString()
  @Length(0, 50)
  label?: string; // '59' 같은 표기(선택)
}
