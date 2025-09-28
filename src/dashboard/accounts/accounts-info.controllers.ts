import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeeInfoService } from './employee-info.service';
import { UpsertEmployeeInfoDto } from './dto/upsert-employee-info.dto';

@UseGuards(SessionAuthGuard, RolesGuard)
@Controller('dashboard/accounts/employees')
export class AccountsInfoController {
  constructor(private readonly service: EmployeeInfoService) {}

  @Roles('admin', 'manager')
  @Post(':credentialId/info')
  async updateEmployeeInfo(
    @Param('credentialId') credentialId: string,
    @Body() dto: UpsertEmployeeInfoDto,
  ) {
    const result = await this.service.upsertByCredentialId(credentialId, dto);
    return { message: '사용자 정보 저장', data: result };
  }
}
