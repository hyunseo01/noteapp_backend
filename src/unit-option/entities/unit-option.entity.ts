import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';

@Entity({ name: 'unit_options' })
@Unique('uq_unit_option_one', ['unitId'])
export class UnitOption {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'unit_id' })
  unitId!: string;

  @OneToOne(() => Unit, (u) => u.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @Column({ type: 'boolean', name: 'has_aircon', default: false })
  hasAircon!: boolean;

  @Column({ type: 'boolean', name: 'has_fridge', default: false })
  hasFridge!: boolean;

  @Column({ type: 'boolean', name: 'has_washer', default: false })
  hasWasher!: boolean;

  @Column({ type: 'boolean', name: 'has_built_in_stove', default: false })
  hasBuiltInStove!: boolean;

  @Column({ type: 'boolean', name: 'has_balcony', default: false })
  hasBalcony!: boolean;

  @Column({ type: 'boolean', name: 'has_terrace', default: false })
  hasTerrace!: boolean;

  @Column({ type: 'boolean', name: 'is_duplex', default: false })
  isDuplex!: boolean;

  @Column({ type: 'boolean', name: 'has_system_ac', default: false })
  hasSystemAc!: boolean;

  @Column({ type: 'boolean', name: 'has_floor_heating', default: false })
  hasFloorHeating!: boolean;

  @Column({ type: 'boolean', name: 'has_bidet', default: false })
  hasBidet!: boolean;

  @Column({ type: 'boolean', name: 'has_microwave', default: false })
  hasMicrowave!: boolean;

  @Column({ type: 'boolean', name: 'has_air_purifier', default: false })
  hasAirPurifier!: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'extra_options_text',
    nullable: true,
  })
  extraOptionsText: string | null = null;
}
