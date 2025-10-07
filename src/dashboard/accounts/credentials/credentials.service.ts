import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountCredential } from '../entities/account-credential.entity';
import { Account } from '../entities/account.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { BcryptService } from '../../../common/hashing/bcrypt.service';

type SafeCredential = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  is_disabled: boolean;
};

@Injectable()
export class CredentialsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountCredential)
    private readonly accountCredentialRepository: Repository<AccountCredential>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    private readonly bcrypt: BcryptService,
  ) {}

  // POST /dashboard/accounts/credentials
  async createCredential(dto: CreateAccountDto): Promise<SafeCredential> {
    return this.dataSource.transaction(async (tx) => {
      const credRepo = tx.getRepository(AccountCredential);
      const accRepo = tx.getRepository(Account);
      const teamRepo = tx.getRepository(Team);
      const tmRepo = tx.getRepository(TeamMember);

      const dup = await credRepo.findOne({ where: { email: dto.email } });
      if (dup) throw new ConflictException('이미 존재하는 이메일입니다.');

      const hashed = await this.bcrypt.hash(dto.password);
      const cred = credRepo.create({
        email: dto.email,
        password: hashed,
        role: dto.role,
        is_disabled: dto.isDisabled ?? false,
      });
      await credRepo.save(cred);

      const account = accRepo.create({
        credential_id: cred.id,
        is_profile_completed: false,
      });
      await accRepo.save(account);

      if (dto.role === 'admin' && dto.team) {
        throw new BadRequestException('admin은 팀 배정을 가질 수 없습니다');
      }

      if (dto.role !== 'admin') {
        if (!dto.team?.teamId) {
          throw new BadRequestException('팀 지정이 필요합니다');
        }

        const team = await teamRepo.findOne({
          where: { id: dto.team.teamId, is_active: true },
        });
        if (!team) throw new NotFoundException('지정한 팀을 찾을 수 없습니다.');

        if (dto.role === 'manager') {
          await tmRepo
            .createQueryBuilder('tm')
            .setLock('pessimistic_write')
            .where('tm.team_id = :tid AND tm.team_role = :r', {
              tid: team.id,
              r: 'manager',
            })
            .getMany();

          const existsManager = await tmRepo.findOne({
            where: { team_id: team.id, team_role: 'manager' },
          });
          if (existsManager)
            throw new ConflictException(
              `팀 "${team.name}"에 이미 팀장이 존재합니다.`,
            );
        }

        if (dto.team.isPrimary !== false) {
          const alreadyPrimary = await tmRepo.findOne({
            where: { account_id: account.id, is_primary: true },
          });
          if (alreadyPrimary) {
            throw new ConflictException('이미 주팀이 설정되어 있습니다.');
          }
        }

        const teamMember = tmRepo.create({
          team_id: team.id,
          account_id: account.id,
          team_role: dto.role === 'manager' ? 'manager' : 'staff',
          is_primary: dto.team.isPrimary !== false,
          joined_at: dto.team.joinedAt ?? new Date().toISOString().slice(0, 10),
        });
        await tmRepo.save(teamMember);
      }

      return {
        id: cred.id,
        email: cred.email,
        role: cred.role,
        is_disabled: cred.is_disabled,
      };
    });
  }

  // GET /dashboard/accounts/credentials
  async listAllCredentials() {
    // AccountCredential ←→ Account 는 FK(credential_id) 기반으로 조인
    const rows = await this.accountCredentialRepository
      .createQueryBuilder('cred')
      .leftJoinAndMapOne(
        'cred.account',
        Account,
        'acc',
        'acc.credential_id = cred.id',
      )
      .orderBy('cred.created_at', 'DESC')
      .getMany();

    return rows.map((c: any) => ({
      id: c.id,
      email: c.email,
      role: c.role,
      disabled: c.is_disabled,
      name: c.account?.name ?? null,
      phone: c.account?.phone ?? null,
    }));
  }

  // PATCH /dashboard/accounts/credentials/:id/disable
  async setCredentialDisabled(id: string, disabled: boolean) {
    const cred = await this.accountCredentialRepository.findOne({
      where: { id },
    });
    if (!cred) throw new NotFoundException('계정을 찾을 수 없습니다.');
    cred.is_disabled = disabled;
    await this.accountCredentialRepository.save(cred);
    return { id: cred.id, disabled: cred.is_disabled };
  }

  // PATCH /dashboard/accounts/credentials/:id/role
  async setCredentialRole(id: string, role: 'admin' | 'manager' | 'staff') {
    const cred = await this.accountCredentialRepository.findOne({
      where: { id },
    });
    if (!cred) throw new NotFoundException('계정을 찾을 수 없습니다.');
    cred.role = role;
    await this.accountCredentialRepository.save(cred);
    return { id: cred.id, role: cred.role };
  }
}
