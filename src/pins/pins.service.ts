import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { MapPinsDto } from './dto/map-pins.dto';
import { Pin } from './entities/pin.entity';

type ClusterResp = {
  mode: 'cluster';
  clusters: Array<{ lat: number; lng: number; count: number }>;
};

type PointResp = {
  mode: 'point';
  points: Array<{ id: string; lat: number; lng: number }>;
};

@Injectable()
export class PinsService {
  constructor(
    @InjectRepository(Pin)
    private readonly repo: Repository<Pin>,
  ) {}

  /**
   * 줌 기준(프론트가 최종 수치 확정해서 전달)
   * - 국가/시·도(줌 낮음)  → cluster
   * - 구 이하(줌 높음)     → point
   *
   * 기본값 예시:
   *  - Z_POINT_FROM = 12 : 줌 12 이상이면 구/동 단위로 간주, 포인트 모드
   *  (프로젝트에서 프론트와 합의 후 값만 교체)
   */
  private readonly Z_POINT_FROM = 12;

  /**
   * 국가/시도 클러스터링 그리드 크기(단순 binning)
   * - 전국 수준: 큰 셀
   * - 시/도 수준: 중간 셀
   */
  private clusterCellSizeDeg(zoom: number): number {
    if (zoom <= 9) return 1.0; // 국가/광역
    return 0.25; // 시/도
  }

  private buildBaseWhere(
    qb: ReturnType<Repository<Pin>['createQueryBuilder']>,
    dto: MapPinsDto,
  ) {
    const { swLat, swLng, neLat, neLng, isOld, isNew } = dto;

    qb.where('p.isDeleted = false').andWhere(
      new Brackets((w) => {
        w.where('p.lat BETWEEN :minLat AND :maxLat', {
          minLat: swLat,
          maxLat: neLat,
        }).andWhere('p.lng BETWEEN :minLng AND :maxLng', {
          minLng: swLng,
          maxLng: neLng,
        });
      }),
    );

    // 구옥/신축 필터 (둘 다 false/undefined면 조건 없음)
    if (isOld === true) qb.andWhere('p.isOld = true');
    if (isNew === true) qb.andWhere('p.isNew = true');

    // 즐겨찾기(favoriteOnly)는 DB 생기면 여기서 조인/조건 추가 예정
  }

  async getMapPins(dto: MapPinsDto): Promise<ClusterResp | PointResp> {
    const { zoom } = dto;

    // 줌 기준으로 모드 결정: 구부터는 포인트, 그 외는 클러스터
    const pointMode = zoom >= this.Z_POINT_FROM;

    if (!pointMode) {
      // ---- 클러스터 모드 (국가/시·도) ----
      const cell = this.clusterCellSizeDeg(zoom);
      const qb = this.repo
        .createQueryBuilder('p')
        .select('AVG(p.lat)', 'lat')
        .addSelect('AVG(p.lng)', 'lng')
        .addSelect('COUNT(*)', 'count')
        .addSelect(`FLOOR(p.lat / ${cell})`, 'gx')
        .addSelect(`FLOOR(p.lng / ${cell})`, 'gy')
        .groupBy('gx, gy');

      this.buildBaseWhere(qb, dto);

      const rows = await qb.getRawMany<{
        lat: string;
        lng: string;
        count: string;
      }>();
      const clusters = rows.map((r) => ({
        lat: Number(r.lat),
        lng: Number(r.lng),
        count: Number(r.count),
      }));

      return { mode: 'cluster', clusters };
    }

    // ---- 포인트 모드 (구 이하) ----
    const qb = this.repo
      .createQueryBuilder('p')
      .select(['p.id AS id', 'p.lat AS lat', 'p.lng AS lng']);

    this.buildBaseWhere(qb, dto);

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
}
