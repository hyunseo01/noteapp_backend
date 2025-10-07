import { Pin } from '../entities/pin.entity';
import { PinAreaGroup } from '../../pin_area_groups/entities/pin_area_group.entity';
import { Unit } from '../../units/entities/unit.entity';
import { PinOption } from '../../pin-options/entities/pin-option.entity';
import { PinDirection } from '../../pin-directions/entities/pin-direction.entity';

export class PinDirectionResponseDto {
  direction!: string;

  static fromEntity(entity: PinDirection): PinDirectionResponseDto {
    return { direction: entity.direction };
  }
}

export class PinAreaGroupResponseDto {
  title!: string | null;
  exclusiveMinM2!: number | null;
  exclusiveMaxM2!: number | null;
  actualMinM2!: number | null;
  actualMaxM2!: number | null;
  sortOrder!: number;

  static fromEntity(entity: PinAreaGroup): PinAreaGroupResponseDto {
    return {
      title: entity.title,
      exclusiveMinM2: Number(entity.exclusiveMinM2),
      exclusiveMaxM2: Number(entity.exclusiveMaxM2),
      actualMinM2: Number(entity.actualMinM2),
      actualMaxM2: Number(entity.actualMaxM2),
      sortOrder: Number(entity.sortOrder),
    };
  }
}

export class UnitResponseDto {
  rooms!: number | null;
  baths!: number | null;
  hasLoft!: boolean | null;
  hasTerrace!: boolean | null;
  minPrice!: number | null;
  maxPrice!: number | null;
  note!: string | null;

  static fromEntity(entity: Unit): UnitResponseDto {
    return {
      rooms: entity.rooms,
      baths: entity.baths,
      hasLoft: entity.hasLoft,
      hasTerrace: entity.hasTerrace,
      minPrice: entity.minPrice,
      maxPrice: entity.maxPrice,
      note: entity.note,
    };
  }
}

export class PinOptionsResponseDto {
  hasAircon!: boolean | null;
  hasFridge!: boolean | null;
  hasWasher!: boolean | null;
  hasDryer!: boolean | null;
  hasBidet!: boolean | null;
  hasAirPurifier!: boolean | null;
  isDirectLease!: boolean | null;
  extraOptionsText!: string | null;

  static fromEntity(entity: PinOption): PinOptionsResponseDto {
    return {
      hasAircon: entity.hasAircon,
      hasFridge: entity.hasFridge,
      hasWasher: entity.hasWasher,
      hasDryer: entity.hasDryer,
      hasBidet: entity.hasBidet,
      hasAirPurifier: entity.hasAirPurifier,
      isDirectLease: entity.isDirectLease,
      extraOptionsText: entity.extraOptionsText,
    };
  }
}

//최상위 DTO
export class PinResponseDto {
  id!: string;
  lat!: number;
  lng!: number;
  addressLine!: string;
  province!: string;
  city!: string;
  district!: string;
  hasElevator!: boolean | null;
  contactMainLabel!: string;
  contactMainPhone!: string;
  contactSubLabel!: string | null;
  contactSubPhone!: string | null;
  badge!: string | null;

  directions!: PinDirectionResponseDto[];
  areaGroups!: PinAreaGroupResponseDto[];
  units!: UnitResponseDto[];
  options!: PinOptionsResponseDto | null;

  static fromEntity(entity: Pin): PinResponseDto {
    return {
      id: String(entity.id),
      lat: Number(entity.lat),
      lng: Number(entity.lng),
      addressLine: entity.addressLine,
      province: entity.province,
      city: entity.city,
      district: entity.district,
      hasElevator: entity.hasElevator,
      contactMainLabel: entity.contactMainLabel,
      contactMainPhone: entity.contactMainPhone,
      contactSubLabel: entity.contactSubLabel,
      contactSubPhone: entity.contactSubPhone,
      badge: entity.badge ?? null,

      directions:
        entity.directions?.map((d) => PinDirectionResponseDto.fromEntity(d)) ??
        [],
      areaGroups:
        entity.areaGroups
          ?.sort((a, b) => a.sortOrder - b.sortOrder)
          .map((d) => PinAreaGroupResponseDto.fromEntity(d)) ?? [],
      units: entity.units?.map((d) => UnitResponseDto.fromEntity(d)) ?? [],
      options: entity.options
        ? PinOptionsResponseDto.fromEntity(entity.options)
        : null,
    };
  }
}
