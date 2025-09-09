import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pin } from '../../pins/entities/pin.entity';

@Entity({ name: 'pin_area_types' })
@Index(['pinId'])
export class PinAreaType {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'pin_id' })
  pinId!: string;

  @ManyToOne(() => Pin, (p) => p.areaTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pin_id' })
  pin!: Pin;

  /** 전용면적(㎡) — 숫자로 저장 */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'exclusive_area' })
  exclusiveArea!: string; // TypeORM decimal → 런타임에서 문자열. 숫자로 쓰고 싶으면 transformer 추가

  /** (선택) 표시 라벨: '59', '84'같은 간단 표기 */
  @Column({ type: 'varchar', length: 50, nullable: true })
  label: string | null = null;
}
