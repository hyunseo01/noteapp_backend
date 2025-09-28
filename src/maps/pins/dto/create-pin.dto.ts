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
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { CreateUnitDto } from '../../units/dto/create-unit.dto';
import { CreatePinOptionsDto } from '../../pin-options/dto/create-pin-option.dto';
import { CreatePinDirectionDto } from '../../pin-directions/dto/create-pin-direction.dto';
import { CreatePinAreaGroupDto } from '../../pin_area_groups/dto/create-pin_area_group.dto';
import { PinBadge } from '../entities/pin.entity';

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

  @IsOptional()
  @IsEnum(PinBadge)
  badge?: PinBadge;

  @IsString()
  @Length(1, 255)
  addressLine!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  contactMainLabel!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  contactMainPhone!: string;

  // 서브 연락처(선택)
  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactSubLabel?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  contactSubPhone?: string;

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
  hasElevator?: boolean;

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
  @Type(() => CreatePinAreaGroupDto)
  areaGroups?: CreatePinAreaGroupDto[];
}
