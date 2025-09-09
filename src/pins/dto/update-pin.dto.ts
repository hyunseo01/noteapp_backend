import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Length,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreatePinOptionsDto } from '../../pin-options/dto/create-pin-option.dto';
import { CreatePinDirectionDto } from '../../pin-directions/dto/create-pin-direction.dto';
import { CreatePinAreaTypeDto } from '../../pin-area-types/dto/create-pin-area-type.dto';

export class UpdatePinDto {
  // 좌표/주소 등 기본 필드 (부분 수정 가능)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  district?: string;

  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  // ── 서브 리소스들 ────────────────────────────────
  // 전달되면 교체(replace). undefined면 변경 없음.
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePinOptionsDto)
  options?: CreatePinOptionsDto | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePinDirectionDto)
  directions?: CreatePinDirectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePinAreaTypeDto)
  areaTypes?: CreatePinAreaTypeDto[];
}
