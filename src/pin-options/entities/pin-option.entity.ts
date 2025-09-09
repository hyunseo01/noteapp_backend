import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Pin } from '../../pins/entities/pin.entity';

@Entity({ name: 'pin_options' })
@Unique('uq_pin_options_pin', ['pinId'])
export class PinOption {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'pin_id' })
  pinId!: string;

  @OneToOne(() => Pin, (p) => p.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pin_id' })
  pin!: Pin;

  // 전부 nullable: 임시저장 지원
  @Column({ type: 'boolean', name: 'has_aircon', nullable: true }) hasAircon:
    | boolean
    | null = null;
  @Column({ type: 'boolean', name: 'has_fridge', nullable: true }) hasFridge:
    | boolean
    | null = null;
  @Column({ type: 'boolean', name: 'has_washer', nullable: true }) hasWasher:
    | boolean
    | null = null;
  @Column({ type: 'boolean', name: 'has_dryer', nullable: true }) hasDryer:
    | boolean
    | null = null;
  @Column({ type: 'boolean', name: 'has_bidet', nullable: true }) hasBidet:
    | boolean
    | null = null;
  @Column({ type: 'boolean', name: 'has_air_purifier', nullable: true })
  hasAirPurifier: boolean | null = null;

  // 직촬임대
  @Column({ type: 'boolean', name: 'is_direct_lease', nullable: true })
  isDirectLease: boolean | null = null;

  // 추가 자유기입(선택)
  @Column({
    type: 'varchar',
    length: 255,
    name: 'extra_options_text',
    nullable: true,
  })
  extraOptionsText: string | null = null;
}
