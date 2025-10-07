import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { AccountCredential } from '../entities/account-credential.entity';
import { UpsertEmployeeInfoDto } from '../dto/upsert-employee-info.dto';

@Injectable()
export class EmployeeInfoService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AccountCredential)
    private readonly accountCredentialRepository: Repository<AccountCredential>,
  ) {}

  private normalize(dto: UpsertEmployeeInfoDto): UpsertEmployeeInfoDto {
    return {
      ...dto,
      name: dto.name?.trim() ?? dto.name ?? null,
      phone: dto.phone?.trim() ?? dto.phone ?? null,
      emergencyContact:
        dto.emergencyContact?.trim() ?? dto.emergencyContact ?? null,
      addressLine: dto.addressLine?.trim() ?? dto.addressLine ?? null,
      salaryBankName: dto.salaryBankName?.trim() ?? dto.salaryBankName ?? null,
      salaryAccount: dto.salaryAccount?.trim() ?? dto.salaryAccount ?? null,
      profileUrl: dto.profileUrl?.trim() ?? dto.profileUrl ?? null,
    };
  }

  // POST /employees/:credentialId/info, POST /me/info
  async upsertByCredentialId(credentialId: string, dto: UpsertEmployeeInfoDto) {
    const credential = await this.accountCredentialRepository.findOne({
      where: { id: credentialId },
    });
    if (!credential) throw new NotFoundException('계정을 찾을 수 없습니다');

    let account = await this.accountRepository.findOne({
      where: { credential_id: credential.id },
    });
    if (!account) throw new NotFoundException('사용자 정보를 찾을 수 없습니다');

    const input = this.normalize(dto);

    if (input.phone) {
      const dupPhone = await this.accountRepository.findOne({
        where: { phone: input.phone },
      });
      if (dupPhone && dupPhone.id !== account.id) {
        throw new ConflictException('이미 사용 중인 연락처입니다');
      }
    }
    if (input.salaryAccount) {
      const dupSalary = await this.accountRepository.findOne({
        where: { salary_account: input.salaryAccount },
      });
      if (dupSalary && dupSalary.id !== account.id) {
        throw new ConflictException('이미 사용 중인 급여 계좌번호입니다');
      }
    }

    account = Object.assign(account, {
      name: input.name ?? account.name,
      phone: input.phone ?? account.phone,
      emergency_contact: input.emergencyContact ?? account.emergency_contact,
      address_line: input.addressLine ?? account.address_line,
      salary_bank_name: input.salaryBankName ?? account.salary_bank_name,
      salary_account: input.salaryAccount ?? account.salary_account,
      profile_url: input.profileUrl ?? account.profile_url,
    });

    const requiredFilled =
      !!account.name &&
      !!account.phone &&
      !!account.emergency_contact &&
      !!account.address_line &&
      !!account.salary_bank_name &&
      !!account.salary_account;

    account.is_profile_completed = requiredFilled;

    const saved = await this.accountRepository.save(account);

    return {
      id: saved.id,
      credentialId: saved.credential_id,
      name: saved.name,
      phone: saved.phone,
      is_profile_completed: saved.is_profile_completed,
    };
  }

  // GET /dashboard/accounts/me/profile
  async getProfileByCredentialId(credentialId: string) {
    if (!credentialId)
      throw new BadRequestException('세션이 유효하지 않습니다.');
    const cred = await this.accountCredentialRepository.findOne({
      where: { id: credentialId },
    });
    if (!cred) throw new NotFoundException('계정을 찾을 수 없습니다.');

    const acc = await this.accountRepository.findOne({
      where: { credential_id: cred.id },
    });

    return {
      credentialId: cred.id,
      email: cred.email,
      role: cred.role,
      disabled: cred.is_disabled,
      profileCompleted: !!(
        acc?.name &&
        acc?.phone &&
        acc?.emergency_contact &&
        acc?.address_line &&
        acc?.salary_bank_name &&
        acc?.salary_account
      ),
      account: acc
        ? {
            id: acc.id,
            name: acc.name,
            phone: acc.phone,
            emergencyContact: acc.emergency_contact ?? null,
            addressLine: acc.address_line ?? null,
            bankName: acc.salary_bank_name ?? null,
            bankAccountNo: acc.salary_account ?? null,
            photoUrl: acc.profile_url ?? null,
          }
        : null,
    };
  }

  // GET /dashboard/accounts/employees/unassigned
  async findUnassignedEmployees() {
    // team_members 레코드가 하나도 없는 계정만
    const rows = await this.accountCredentialRepository
      .createQueryBuilder('cred')
      .leftJoin(Account, 'acc', 'acc.credential_id = cred.id')
      .leftJoin(
        'team_members',
        'tm',
        'tm.credential_id = cred.id OR tm.account_id = acc.id',
      )
      .where('tm.id IS NULL')
      .select([
        'cred.id AS credentialId',
        'cred.email AS email',
        'cred.role AS role',
        'cred.is_disabled AS disabled',
        'acc.name AS name',
        'acc.phone AS phone',
      ])
      .getRawMany();

    return rows.map((r) => ({
      credentialId: r.credentialId,
      email: r.email,
      role: r.role,
      disabled: !!r.disabled,
      name: r.name ?? null,
      phone: r.phone ?? null,
    }));
  }
}
