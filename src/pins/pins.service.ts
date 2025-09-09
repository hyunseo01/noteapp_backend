import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DataSource } from 'typeorm';
import { MapPinsDto } from './dto/map-pins.dto';
import { Pin } from './entities/pin.entity';
import { CreatePinDto } from './dto/create-pin.dto';
import { PinOption } from '../pin-options/entities/pin-option.entity';
import { UnitsService } from '../units/units.service';
import { PinDirectionsService } from '../pin-directions/pin-directions.service';
import { PinAreaTypesService } from '../pin-area-types/pin-area-types.service';
import { PinOptionsService } from '../pin-options/pin-options.service';

// type ClusterResp = {
//   mode: 'cluster';
//   clusters: Array<{ lat: number; lng: number; count: number }>;
// };

type PointResp = {
  mode: 'point';
  points: Array<{ id: string; lat: number; lng: number }>;
};

@Injectable()
export class PinsService {
  constructor(
    @InjectRepository(Pin)
    private readonly pinRepository: Repository<Pin>,
    @InjectRepository(PinOption)
    private readonly pinOptionRepository: Repository<PinOption>,
    private readonly dataSource: DataSource,
    private readonly unitsService: UnitsService,
    private readonly pinDirectionsService: PinDirectionsService,
    private readonly pinAreaTypesService: PinAreaTypesService,
    private readonly pinOptionsService: PinOptionsService,
  ) {}

  async getMapPins(dto: MapPinsDto): Promise<PointResp /* | ClusterResp */> {
    const { swLat, swLng, neLat, neLng, isOld, isNew, favoriteOnly } = dto;

    const qb = this.pinRepository
      .createQueryBuilder('p')
      .select(['p.id AS id', 'p.lat AS lat', 'p.lng AS lng'])
      .where('p.lat BETWEEN :swLat AND :neLat', { swLat, neLat })
      .andWhere('p.lng BETWEEN :swLng AND :neLng', { swLng, neLng });

    // 선택 필터들 (예: 준공/신축 여부, 즐겨찾기만 등)
    if (typeof isOld === 'boolean') {
      qb.andWhere('p.is_old = :isOld', { isOld });
    }
    if (typeof isNew === 'boolean') {
      qb.andWhere('p.is_new = :isNew', { isNew });
    }
    if (typeof favoriteOnly === 'boolean' && favoriteOnly) {
      // 즐겨찾기 조인/조건 예시 (스키마에 맞게 조정)
      qb.andWhere(
        new Brackets((w) => {
          // 예: 현재 사용자 기준 즐겨찾기 여부. 실제 컬럼/관계명에 맞게 수정하세요.
          w.where('p.is_favorite = TRUE');
        }),
      );
    }

    // ===== [비활성화: 서버측 클러스터링 분기] =====
    // if (dto.zoom !== undefined && dto.zoom < 15) {
    //   // 낮은 줌 레벨 → 서버에서 클러스터링 모드
    //   const clusters = await this.buildClusters(qb);
    //   return { mode: 'cluster', clusters };
    // }
    // ===========================================

    // 항상 포인트 모드로 반환
    const points = await qb
      .orderBy('p.id', 'DESC')
      .getRawMany<{ id: string; lat: string; lng: string }>();

    return {
      mode: 'point',
      points: points.map((p) => ({
        id: String(p.id),
        lat: Number(p.lat),
        lng: Number(p.lng),
      })),
    };
  }

  /**
   * [서버 클러스터링 로직]
   * 현행에선 호출하지 않으며, 필요 시 프론트가 하지 못하는 경우를 대비해 남겨둠
   */
  // private async buildClusters(baseQb: SelectQueryBuilder<Pin>): Promise<Array<{ lat: number; lng: number; count: number }>> {
  //   const raw = await baseQb
  //     .select([
  //       'p.lat AS lat',
  //       'p.lng AS lng',
  //     ])
  //     .getRawMany<{ lat: string; lng: string }>();
  //
  //   // 간단한 grid 기반 클러스터링 예시
  //   const cellSize = 0.01; // 대략 ~1km 수준(위경도 기준 대략치), 필요 시 조정
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

      // 1) 핀 본체 저장
      const pin = pinRepo.create({
        lat: String(dto.lat),
        lng: String(dto.lng),
        addressLine: dto.addressLine,
        name: dto.name ?? null,
        province: dto.province ?? null,
        city: dto.city ?? null,
        district: dto.district ?? null,
        hasElevator: dto.hasElevator ?? null,
      });
      await pinRepo.save(pin);

      if (dto.options) {
        await this.pinOptionsService.upsertWithManager(
          manager,
          pin.id,
          dto.options,
        );
      }

      // 3) 방향 리스트 – undefined면 변경 없음, 배열이면 교체
      if (Array.isArray(dto.directions)) {
        await this.pinDirectionsService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.directions,
        );
      }

      // 4) 전용면적 리스트 – undefined면 변경 없음, 배열이면 교체
      if (Array.isArray(dto.areaTypes)) {
        await this.pinAreaTypesService.replaceForPinWithManager(
          manager,
          pin.id,
          dto.areaTypes,
        );
      }

      // 5) 유닛(타입별 라인: 방/욕실/복층/테라스/매매가) – 전달됐을 때만 생성
      if (Array.isArray(dto.units) && dto.units.length > 0) {
        await this.unitsService.bulkCreateWithManager(
          manager,
          pin.id,
          dto.units,
        );
      }

      // 최소 응답 (필요시 확장)
      return { id: String(pin.id) };
    });
  }
}
