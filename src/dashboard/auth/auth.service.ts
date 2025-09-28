import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountCredential } from '../accounts/entities/account-credential.entity';
import { BcryptService } from '../../common/hashing/bcrypt.service';

type SigninResult = {
  credentialId: string;
  role: 'admin' | 'manager' | 'staff';
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AccountCredential)
    private readonly accountCredentialRepository: Repository<AccountCredential>,
    private readonly bcrypt: BcryptService,
  ) {}

  async signin(email: string, password: string): Promise<SigninResult> {
    const credential = await this.accountCredentialRepository.findOne({
      where: { email },
    });
    if (!credential || credential.is_disabled) {
      throw new UnauthorizedException('인증 실패');
    }
    const ok = await this.bcrypt.compare(password, credential.password);
    if (!ok) {
      throw new UnauthorizedException('인증 실패');
    }
    return {
      credentialId: credential.id,
      role: credential.role as 'admin' | 'manager' | 'staff',
    };
  }
}
