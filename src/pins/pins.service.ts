import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { MapPinsDto } from './dto/map-pins.dto';
import { Pin } from './entities/pin.entity';

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
}
