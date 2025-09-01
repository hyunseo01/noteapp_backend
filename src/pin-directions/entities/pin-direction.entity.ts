import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Pin } from '../../pins/entities/pin.entity';

export enum DirectionLabel {
  EAST = '동',
  WEST = '서',
  SOUTH = '남',
  NORTH = '북',
  SOUTHEAST = '남동',
  SOUTHWEST = '남서',
  NORTHEAST = '북동',
  NORTHWEST = '북서',
}

@Entity({ name: 'pin_directions' })
@Unique('uq_pin_direction_label', ['pinId', 'label'])
export class PinDirection {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'pin_id' })
  pinId!: string;

  @ManyToOne(() => Pin, (p) => p.directions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pin_id' })
  pin!: Pin;

  @Column({ type: 'varchar', length: 10, name: 'label' })
  label!: DirectionLabel;
}
