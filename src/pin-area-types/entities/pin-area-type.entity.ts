import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Pin } from '../../pins/entities/pin.entity';

@Entity({ name: 'pin_area_types' })
@Unique('uq_pin_area_label', ['pinId', 'label'])
export class PinAreaType {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'pin_id' })
  pinId!: string;

  @ManyToOne(() => Pin, (p) => p.areaTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pin_id' })
  pin!: Pin;

  @Column({ type: 'varchar', length: 30, name: 'label' })
  label!: string; // 예: '84A', '59B'

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'area_exclusive_m2',
    nullable: true,
  })
  areaExclusiveM2: string | null = null;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'area_actual_m2',
    nullable: true,
  })
  areaActualM2: string | null = null;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary!: boolean;

  @Column({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
