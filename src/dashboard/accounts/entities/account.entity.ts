import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountCredential } from './account-credential.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  credential_id!: string;

  @OneToOne(() => AccountCredential)
  @JoinColumn({ name: 'credential_id' })
  credential!: AccountCredential;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact!: string | null;

  @Column({ type: 'text', nullable: true })
  address_line!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  salary_bank_name!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  salary_account!: string | null;

  @Column({ type: 'text', nullable: true })
  profile_url!: string | null;

  @Column({ type: 'boolean', default: false })
  is_profile_completed!: boolean;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @Column({ type: 'datetime', nullable: true })
  deleted_at!: Date | null;
}
