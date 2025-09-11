import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PinDirection } from '../../pin-directions/entities/pin-direction.entity';
import { Unit } from '../../units/entities/unit.entity';
import { PinOption } from '../../pin-options/entities/pin-option.entity';
import { PinAreaGroup } from '../../pin_area_groups/entities/pin_area_group.entity';

export type Grade3 = '상' | '중' | '하';
export type BuildingType = 'APT' | 'OP' | '주택' | '근생';

@Entity({ name: 'pins' })
@Index(['lat', 'lng'])
export class Pin {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, name: 'lat' })
  lat!: string; // DECIMAL은 string 권장

  @Column({ type: 'decimal', precision: 9, scale: 6, name: 'lng' })
  lng!: string;

  @Column({ type: 'text', name: 'address_line' })
  addressLine!: string;

  @Column({ type: 'varchar', length: 50, name: 'province' })
  province!: string;

  @Column({ type: 'varchar', length: 50, name: 'city' })
  city!: string;

  @Column({ type: 'varchar', length: 50, name: 'district' })
  district!: string;

  @Column({ type: 'date', name: 'completion_date', nullable: true })
  completionDate: Date | null = null;

  @Column({
    type: 'enum',
    enum: ['APT', 'OP', '주택', '근생'],
    name: 'building_type',
    nullable: true,
  })
  buildingType: BuildingType | null = null;

  @Column({ type: 'boolean', name: 'has_elevator', nullable: true })
  hasElevator: boolean | null = null;

  @Column({ type: 'int', name: 'total_households', nullable: true })
  totalHouseholds: number | null = null;

  @Column({ type: 'int', name: 'total_parking_slots', nullable: true })
  totalParkingSlots: number | null = null;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'registration_type_id',
    nullable: true,
  })
  registrationTypeId: number | null = null;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'parking_type_id',
    nullable: true,
  })
  parkingTypeId: number | null = null;

  @Column({
    type: 'enum',
    enum: ['상', '중', '하'],
    name: 'parking_grade',
    nullable: true,
  })
  parkingGrade: Grade3 | null = null;

  @Column({
    type: 'enum',
    enum: ['상', '중', '하'],
    name: 'slope_grade',
    nullable: true,
  })
  slopeGrade: Grade3 | null = null;

  @Column({
    type: 'enum',
    enum: ['상', '중', '하'],
    name: 'structure_grade',
    nullable: true,
  })
  structureGrade: Grade3 | null = null;

  @Column({ type: 'varchar', length: 20, name: 'contact_main_label' })
  contactMainLabel!: string;

  @Column({ type: 'varchar', length: 50, name: 'contact_main_phone' })
  contactMainPhone!: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'contact_sub_label',
    nullable: true,
  })
  contactSubLabel: string | null = null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'contact_sub_phone',
    nullable: true,
  })
  contactSubPhone: string | null = null;

  @Column({ type: 'boolean', default: false })
  isOld!: boolean;

  @Column({ type: 'boolean', default: false })
  isNew!: boolean;

  @Column({ type: 'text', name: 'public_memo', nullable: true })
  publicMemo: string | null = null;

  @Column({ type: 'text', name: 'private_memo', nullable: true })
  privateMemo: string | null = null;

  @OneToOne(() => PinOption, (o) => o.pin, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'pin_option_id' })
  options: PinOption | null = null;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'surveyed_by',
    nullable: true,
  })
  surveyedBy: string | null = null;

  @Column({ type: 'datetime', name: 'surveyed_at', nullable: true })
  surveyedAt: Date | null = null;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'creator_id',
    nullable: true,
  })
  creatorId: string | null = null;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @Column({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null = null;

  @OneToMany(() => PinAreaGroup, (g) => g.pin, { cascade: ['remove'] })
  areaGroups!: PinAreaGroup[]; // 새 관계

  @OneToMany(() => PinDirection, (d) => d.pin, { cascade: ['remove'] })
  directions!: PinDirection[];

  @OneToMany(() => Unit, (u) => u.pin, { cascade: ['remove'] })
  units!: Unit[];
}
