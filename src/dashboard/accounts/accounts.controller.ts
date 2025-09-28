import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCredentialDto } from './dto/create-account-credential.dto';
import { AccountsService } from './accounts.service';
import { UpsertEmployeeInfoDto } from './dto/upsert-employee-info.dto';
import { EmployeeInfoService } from './employee-info.service';

@Controller('dashboard/accounts')
@UseGuards(SessionAuthGuard, RolesGuard)
export class AccountsController {
  constructor(
    private readonly service: AccountsService,
    private readonly service2: EmployeeInfoService,
  ) {}

  @Post('credentials')
  async createCredential(@Body() dto: CreateCredentialDto) {
    const created = await this.service.createCredential(dto);
    return { message: '계정 생성', data: created };
  }

  @Post('me/info')
  async upsertMine(@Req() req: any, @Body() dto: UpsertEmployeeInfoDto) {
    const credentialId = (req.session?.user?.credentialId ?? undefined) as
      | string
      | undefined;
    if (!credentialId) throw new Error('세션이 없습니다');
    const result = await this.service2.upsertByCredentialId(credentialId, dto);
    return { message: '내 정보 저장', data: result };
  }

  /* 테스트용 */
  @Get('check/admin')
  @Roles('admin')
  checkAdmin() {
    return { message: '관리자 접근 성공' };
  }

  @Get('check/manager')
  @Roles('manager')
  checkManager() {
    return { message: '매니저 접근 성공' };
  }
}
