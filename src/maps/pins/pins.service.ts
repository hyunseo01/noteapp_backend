import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DataSource, DeepPartial, In } from 'typeorm';
import { MapPinsDto } from './dto/map-pins.dto';
import { Pin } from './entities/pin.entity';
import { CreatePinDto } from './dto/create-pin.dto';
import { UnitsService } from '../units/units.service';
import { PinDirectionsService } from '../pin-directions/pin-directions.service';
import { PinOptionsService } from '../pin-options/pin-options.service';
import { PinAreaGroupsService } from '../pin_area_groups/pin_area_groups.service';
import { PinResponseDto } from './dto/pin-detail.dto';
import { UpdatePinDto } from './dto/update-pin.dto';
import { SearchPinsDto } from './dto/search-pins.dto';

// type ClusterResp = {
//   mode: 'cluster';
//   clusters: Array<{ lat: number; lng: number; count: number }>;
// };

type PointResp = {
  mode: 'point';
  points: Array<{ id: string; lat: number; lng: number; badge: string | null }>;
};

@Injectable()
export class PinsService {
  constructor(
    @InjectRepository(Pin)
    private readonly pinRepository: Repository<Pin>,
    private readonly dataSource: DataSource,
    private readonly unitsService: UnitsService,
    private readonly pinDirectionsService: PinDirectionsService,
    private readonly pinAreaGroupsService: PinAreaGroupsService,
    private readonly pinOptionsService: PinOptionsService,
  ) {}

  async getMapPins(dto: MapPinsDto): Promise<PointResp /* | ClusterResp */> {
    const { swLat, swLng, neLat, neLng, isOld, isNew, favoriteOnly } = dto;

    const qb = this.pinRepository
      .createQueryBuilder('p')
      .select(['p.id AS id', 'p.lat AS lat', 'p.lng AS lng'])
      .where('p.lat BETWEEN :swLat AND :neLat', { swLat, neLat })
      .andWhere('p.lng BETWEEN :swLng AND :neLng', { swLng, neLng });

    if (typeof isOld === 'boolean') {
      qb.andWhere('p.is_old = :isOld', { isOld });
    }
    if (typeof isNew === 'boolean') {
      qb.andWhere('p.is_new = :isNew', { isNew });
    }
    if (typeof favoriteOnly === 'boolean' && favoriteOnly) {
      qb.andWhere(
        new Brackets((w) => {
          // 예: 현재 사용자 기준 즐겨찾기 여부. 실제 컬럼/관계명에 맞게 수정하세요.
          w.where('p.is_favorite = TRUE');
        }),
      );
    }

    // 비활성화: 서버측 클러스터링 분기
    // if (dto.zoom !== undefined && dto.zoom < 15) {
    //   // 낮은 줌 레벨 -> 서버에서 클러스터링 모드
    //   const clusters = await this.buildClusters(qb);
    //   return { mode: 'cluster', clusters };
    // }

    const points = await qb
      .select(['p.id', 'p.lat', 'p.lng', 'p.badge'])
      .orderBy('p.id', 'DESC')
      .getRawMany<{
        id: string;
        lat: string;
        lng: string;
        badge: string | null;
      }>();

    return {
      mode: 'point',
      points: points.map((p) => ({
        id: String(p.id),
        lat: Number(p.lat),
        lng: Number(p.lng),
        badge: p.badge,
      })),
    };
  }

  // 서버 클러스터링 로직
  // private async buildClusters(baseQb: SelectQueryBuilder<Pin>): Promise<Array<{ lat: number; lng: number; count: number }>> {
  //   const raw = await baseQb
  //     .select([
  //       'p.lat AS lat',
  //       'p.lng AS lng',
  //     ])
  //     .getRawMany<{ lat: string; lng: string }>();
  //
  //   const cellSize = 0.01;
  //   const map = new Map<string, { latSum: number; lngSum: number; count: number }>();
  //
  //   for (const r of raw) {
  //     const lat = Number(r.lat);
  //     const lng = Number(r.lng);
  //     const key = `${Math.floor(lat / cellSize)}:${Math.floor(lng / cellSize)}`;
  //     const prev = map.get(key);
  //     if (prev) {
  //       prev.latSum += lat;
  //       prev.lngSum += lng;
  //       prev.count += 1;
  //     } else {
  //       map.set(key, { latSum: lat, lngSum: lng, count: 1 });
  //     }
  //   }
  //
  //   return Array.from(map.values()).map((c) => ({
  //     lat: c.latSum / c.count,
  //     lng: c.lngSum / c.count,
  //     count: c.count,
  //   }));
  // }

  async create(dto: CreatePinDto) {
    // 좌표 1차 검증
    if (!Number.isFinite(dto.lat) || !Number.isFinite(dto.lng)) {
      throw new BadRequestException('잘못된 좌표');
    }

    return this.dataSource.transaction(async (manager) => {
      const pinRepo = manager.getRepository(Pin);

      // 핀 본체 저장
      const pin = pinRepo.create({
        lat: String(dto.lat),
        lng: String(dto.lng),
        badge: dto.badge ?? null,
        addressLine: dto.addressLine,
        name: dto.name ?? null,
        province: dto.province ?? null,
        city: dto.city ?? null,
        district: dto.district ?? null,
        hasElevator: dto.hasElevator ?? null,
        contactMainLabel: dto.contactMainLabel,
        contactMainPhone: dto.contactMainPhone,
        contactSubLabel: dto.contactSubLabel ?? null,
        contactSubPhone: dto.contactSubPhone ?? null,
      } as DeepPartial<Pin>);
      await pinRepo.save(pin);

      // 옵션
      if (dto.options) {
        await this.pinOptionsService.upsertWithManager(
          manager,
          pin.id,
          dto.options,
        );
      } else {
        await this.pinOptionsService.ensureExistsWithDefaults(manager, pin.id);
      }

      // 방향 목록 교체
      if (Array.isArray(dto.directions)) {
        const norm = dto.directions
          .map((d) => ({ direction: (d.direction ?? '').trim() }))
          .filter((d) => d.direction.length > 0);
        const unique = Array.from(
          new Map(norm.map((x) => [x.direction, x])).values(),
        );
        await this.pinDirectionsService.replaceForPinWithManager(
          manager,
          pin.id,
          unique,
        );
      }

      // 전용/실평 범위
      if (Array.isArray(dto.areaGroups)) {
        await this.pinAreaGroupsService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.areaGroups,
        );
      }

      // 구조 (방/욕실/복층/테라스/표시가) 생성
      if (Array.isArray(dto.units) && dto.units.length > 0) {
        await this.unitsService.bulkCreateWithManager(
          manager,
          pin.id,
          dto.units,
        );
      }

      return { id: String(pin.id) };
    });
  }

  async findDetail(id: string): Promise<PinResponseDto> {
    const pin = await this.pinRepository.findOneOrFail({
      where: { id },
      relations: ['options', 'directions', 'areaGroups', 'units'],
    });
    return PinResponseDto.fromEntity(pin);
  }

  async update(id: string, dto: UpdatePinDto) {
    return this.dataSource.transaction(async (manager) => {
      const pinRepo = manager.getRepository(Pin);
      const pin = await pinRepo.findOne({ where: { id } });
      if (!pin) throw new NotFoundException('핀 없음');

      if (dto.lat !== undefined || dto.lng !== undefined) {
        if (!Number.isFinite(dto.lat))
          throw new BadRequestException('잘못된 좌표');
        pin.lat = String(dto.lat);

        if (!Number.isFinite(dto.lng))
          throw new BadRequestException('잘못된 lng');
        pin.lng = String(dto.lng);
      }

      if (dto.addressLine !== undefined) pin.addressLine = dto.addressLine;
      // if (dto.name !== undefined) pin.name = dto.name ?? null;
      if (dto.province !== undefined) pin.province = dto.province ?? null;
      if (dto.city !== undefined) pin.city = dto.city ?? null;
      if (dto.district !== undefined) pin.district = dto.district ?? null;
      if (dto.hasElevator !== undefined) pin.hasElevator = dto.hasElevator;

      // 연락처
      if (dto.contactMainLabel !== undefined)
        pin.contactMainLabel = dto.contactMainLabel;
      if (dto.contactMainPhone !== undefined)
        pin.contactMainPhone = dto.contactMainPhone;
      if (dto.contactSubLabel !== undefined)
        pin.contactSubLabel = dto.contactSubLabel ?? null;
      if (dto.contactSubPhone !== undefined)
        pin.contactSubPhone = dto.contactSubPhone ?? null;
      if (dto.badge !== undefined) pin.badge = dto.badge ?? null;

      await pinRepo.save(pin);

      // 옵션
      if (dto.options !== undefined) {
        if (dto.options === null) {
          pin.options = null;
          await manager.getRepository(Pin).save(pin);
        } else {
          await this.pinOptionsService.upsertWithManager(
            manager,
            pin.id,
            dto.options,
          );
        }
      }

      // directions
      if (dto.directions !== undefined) {
        await this.pinDirectionsService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.directions ?? [],
        );
      }

      // areaGroups
      if (dto.areaGroups !== undefined) {
        const bad = (dto.areaGroups ?? []).find(
          (g) =>
            (g.exclusiveMinM2 != null &&
              g.exclusiveMaxM2 != null &&
              g.exclusiveMinM2 > g.exclusiveMaxM2) ||
            (g.actualMinM2 != null &&
              g.actualMaxM2 != null &&
              g.actualMinM2 > g.actualMaxM2),
        );
        if (bad) throw new BadRequestException('범위가 올바르지 않습니다.');

        await this.pinAreaGroupsService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.areaGroups ?? [],
        );
      }

      if (dto.units !== undefined) {
        await this.unitsService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.units ?? [],
        );
      }

      return { id: String(pin.id) };
    });
  }

  // 필터링 검색
  async searchPins(dto: SearchPinsDto): Promise<PinResponseDto[]> {
    const qb = this.pinRepository
      .createQueryBuilder('p')
      .leftJoin('p.units', 'u')
      .leftJoin('p.areaGroups', 'ag')
      .where('1=1');

    // 비활성 제외
    if (this.pinRepository.metadata.findColumnWithPropertyName('isDisabled')) {
      qb.andWhere('p.isDisabled = FALSE');
    }

    // 엘리베이터
    if (typeof dto.hasElevator === 'boolean') {
      qb.andWhere('p.hasElevator = :hasElevator', {
        hasElevator: dto.hasElevator,
      });
    }

    // 구조(유닛)
    if (dto.rooms?.length) {
      qb.andWhere('u.rooms IN (:...rooms)', { rooms: dto.rooms });
    }
    if (typeof dto.hasLoft === 'boolean') {
      qb.andWhere('u.hasLoft = :hasLoft', { hasLoft: dto.hasLoft });
    }
    if (typeof dto.hasTerrace === 'boolean') {
      qb.andWhere('u.hasTerrace = :hasTerrace', { hasTerrace: dto.hasTerrace });
    }
    if (dto.salePriceMin != null) {
      qb.andWhere('u.salePrice >= :salePriceMin', {
        salePriceMin: dto.salePriceMin,
      });
    }
    if (dto.salePriceMax != null) {
      qb.andWhere('u.salePrice <= :salePriceMax', {
        salePriceMax: dto.salePriceMax,
      });
    }

    // 면적
    if (dto.areaMinM2 != null || dto.areaMaxM2 != null) {
      qb.andWhere(
        new Brackets((w) => {
          if (dto.areaMinM2 != null) {
            w.andWhere(
              new Brackets((w2) => {
                w2.where(
                  '(ag.exclusiveMaxM2 IS NOT NULL AND ag.exclusiveMaxM2 >= :amin)',
                  { amin: dto.areaMinM2 },
                ).orWhere(
                  '(ag.actualMaxM2 IS NOT NULL AND ag.actualMaxM2 >= :amin)',
                  { amin: dto.areaMinM2 },
                );
              }),
            );
          }
          if (dto.areaMaxM2 != null) {
            w.andWhere(
              new Brackets((w2) => {
                w2.where(
                  '(ag.exclusiveMinM2 IS NOT NULL AND ag.exclusiveMinM2 <= :amax)',
                  { amax: dto.areaMaxM2 },
                ).orWhere(
                  '(ag.actualMinM2 IS NOT NULL AND ag.actualMinM2 <= :amax)',
                  { amax: dto.areaMaxM2 },
                );
              }),
            );
          }
        }),
      );
    }

    // 중복 핀 제거
    const rows = await qb
      .select(['p.id AS p_id'])
      .groupBy('p.id')
      .orderBy('p.id', 'DESC')
      .getRawMany<{ p_id: string }>();

    const ids = rows.map((r) => r.p_id);

    if (!ids.length) return [];

    const pins = await this.pinRepository.find({
      where: { id: In(ids) },
      relations: ['options', 'directions', 'areaGroups', 'units'],
      order: { id: 'DESC' },
    });

    return pins.map((p) => PinResponseDto.fromEntity(p));
  }
}
