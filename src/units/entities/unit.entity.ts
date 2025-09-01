import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Pin } from '../../pins/entities/pin.entity';
import { PinAreaType } from '../../pin-area-types/entities/pin-area-type.entity';
import { PinDirection } from '../../pin-directions/entities/pin-direction.entity';
import { UnitOption } from '../../unit-option/entities/unit-option.entity';

export type UnitStatus = 'ON_MARKET' | 'RESERVED' | 'SOLD';

@Entity({ name: 'units' })
@Unique('uq_unit_uniqueness', [
  'pinId',
  'areaTypeId',
  'floor',
  'rooms',
  'baths',
])
@Index(['pinId', 'status'])
export class Unit {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'pin_id' })
  pinId!: string;

  @ManyToOne(() => Pin, (p) => p.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pin_id' })
  pin!: Pin;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'area_type_id',
    nullable: true,
  })
  areaTypeId: string | null = null;

  @ManyToOne(() => PinAreaType, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'area_type_id' })
  areaType: PinAreaType | null = null;

  @Column({ type: 'smallint', name: 'floor', nullable: true })
  floor: number | null = null;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'direction_id',
    nullable: true,
  })
  directionId: string | null = null;

  @ManyToOne(() => PinDirection, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direction_id' })
  direction: PinDirection | null = null;

  @Column({ type: 'tinyint', name: 'rooms' })
  rooms!: number;

  @Column({ type: 'tinyint', name: 'baths' })
  baths!: number;

  @Column({ type: 'bigint', name: 'sale_price_won' })
  salePriceWon!: string;

  @Column({
    type: 'enum',
    enum: ['ON_MARKET', 'RESERVED', 'SOLD'],
    name: 'status',
    default: 'ON_MARKET',
  })
  status!: UnitStatus;

  @Column({ type: 'text', name: 'memo', nullable: true })
  memo: string | null = null;

  @OneToOne(() => UnitOption, (o) => o.unit, { cascade: true })
  options!: UnitOption;
}
