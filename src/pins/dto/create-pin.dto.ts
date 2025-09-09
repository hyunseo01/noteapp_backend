import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Length,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateUnitDto } from '../../units/dto/create-unit.dto';
import { CreatePinOptionsDto } from '../../pin-options/dto/create-pin-option.dto';
import { CreatePinDirectionDto } from '../../pin-directions/dto/create-pin-direction.dto';
import { CreatePinAreaTypeDto } from '../../pin-area-types/dto/create-pin-area-type.dto';

/** 핀 생성 요청 DTO (임시저장 없음: 좌표/주소는 필수) */
export class CreatePinDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsString()
  @Length(1, 255)
  addressLine!: string;

  // 선택 필드들 (DB는 nullable 허용)
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
  hasElevator?: boolean; // 엘리베이터: 갯수 없음(여부만)

  /* 핀 옵션(핀 1:1) */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePinOptionsDto)
  options?: CreatePinOptionsDto;

  /* 유닛들(여러 개) */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUnitDto)
  units?: CreateUnitDto[];

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
