import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BcryptService } from '../../common/hashing/bcrypt.service';
import { AccountCredential } from './entities/account-credential.entity';
import { Account } from './entities/account.entity';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { CreateAccountDto } from './dto/create-account.dto';

type SafeCredential = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  is_disabled: boolean;
};

@Injectable()
export class AccountsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountCredential)
    private readonly accountCredentialRepository: Repository<AccountCredential>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    private readonly bcrypt: BcryptService,
  ) {}

  async createCredential(dto: CreateAccountDto): Promise<SafeCredential> {
    return this.dataSource.transaction(async (transaction) => {
      const accountCredentialRepo =
        transaction.getRepository(AccountCredential);
      const accountRepo = transaction.getRepository(Account);
      const teamRepo = transaction.getRepository(Team);
      const teamMemberRepo = transaction.getRepository(TeamMember);

      // 이메일 중복 확인
      const dup = await accountCredentialRepo.findOne({
        where: { email: dto.email },
      });
      if (dup) throw new ConflictException('이미 존재하는 이메일입니다.');

      // 계정 필수 정보 생성
      const hashed = await this.bcrypt.hash(dto.password);
      const cred = accountCredentialRepo.create({
        email: dto.email,
        password: hashed,
        role: dto.role,
        is_disabled: dto.isDisabled ?? false,
      });
      await accountCredentialRepo.save(cred);

      // 추가정보 생성(빈값)
      const account = accountRepo.create({
        credential_id: cred.id,
        is_profile_completed: false,
      });
      await accountRepo.save(account);

      if (dto.role === 'admin' && dto.team) {
        throw new BadRequestException('admin은 팀 배정을 가질 수 없습니다');
      }

      // 팀 배정(admin 제외)
      if (dto.role !== 'admin') {
        if (!dto.team?.teamId)
          throw new BadRequestException('팀 지정이 필요합니다');

        const team = await teamRepo.findOne({
          where: { id: dto.team.teamId, is_active: true },
        });
        if (!team) throw new NotFoundException('지정한 팀을 찾을 수 없습니다.');

        // 팀장 중복 방지
        if (dto.role === 'manager') {
          // 해당 트랜잭션이 실행되는동안 다른 팀장배정 시도를 막는 쿼리
          await teamMemberRepo
            .createQueryBuilder('tm')
            .setLock('pessimistic_write')
            .where('tm.team_id = :tid AND tm.team_role = :r', {
              tid: team.id,
              r: 'manager',
            })
            .getMany();

          const existsManager = await teamMemberRepo.findOne({
            where: { team_id: team.id, team_role: 'manager' },
          });
          if (existsManager)
            throw new ConflictException(
              `팀: "${team.name}"에는 이미 팀장이 존재합니다.`,
            );
        }

        // 주팀 단일성
        if (dto.team.isPrimary !== false) {
          const alreadyPrimary = await teamMemberRepo.findOne({
            where: { account_id: account.id, is_primary: true },
          });
          if (alreadyPrimary)
            throw new ConflictException('이미 주팀이 설정되어 있습니다.');
        }

        const teamMember = teamMemberRepo.create({
          team_id: team.id,
          account_id: account.id,
          team_role: dto.role === 'manager' ? 'manager' : 'staff',
          is_primary: dto.team.isPrimary !== false, // 기본 true
          joined_at: dto.team.joinedAt ?? new Date().toISOString().slice(0, 10),
        });
        await teamMemberRepo.save(teamMember);
      }

      return {
        id: cred.id,
        email: cred.email,
        role: cred.role,
        is_disabled: cred.is_disabled,
      };
    });
  }
}
