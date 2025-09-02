import {
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MapPinsDto {
  /** 남서(SW) */
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  swLat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  swLng!: number;

  /** 북동(NE) */
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  neLat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  neLng!: number;

  /** 카카오맵 줌 레벨 */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  zoom!: number;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isOld?: boolean;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  favoriteOnly?: boolean;
}
