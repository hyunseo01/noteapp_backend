import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountCredential } from './entities/account-credential.entity';
import { UpsertEmployeeInfoDto } from './dto/upsert-employee-info.dto';

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

    // 유니크 체크
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

    // 값 반영 (null 허용)
    account = Object.assign(account, {
      name: input.name ?? account.name,
      phone: input.phone ?? account.phone,
      emergency_contact: input.emergencyContact ?? account.emergency_contact,
      address_line: input.addressLine ?? account.address_line,
      salary_bank_name: input.salaryBankName ?? account.salary_bank_name,
      salary_account: input.salaryAccount ?? account.salary_account,
      profile_url: input.profileUrl ?? account.profile_url,
    });

    // 프로필 완료 기준
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
}
