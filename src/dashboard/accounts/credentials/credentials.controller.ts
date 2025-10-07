import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SystemRole } from '../types/roles';
import { CreateCredentialDto } from '../dto/create-account-credential.dto';
import { PatchCredentialDisableDto } from '../dto/patch-credential-disable.dto';
import { PatchCredentialRoleDto } from '../dto/patch-credential-role.dto';
import { CredentialsService } from './credentials.service';

@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(SystemRole.ADMIN)
@Controller('dashboard/accounts/credentials')
export class CredentialsController {
  constructor(private readonly service: CredentialsService) {}

  @Post()
  async createCredential(@Body() dto: CreateCredentialDto) {
    const created = await this.service.createCredential(dto);
    return { message: '계정 생성', data: created };
  }

  @Get()
  async listCredentials() {
    const items = await this.service.listAllCredentials();
    return { message: '계정 목록', data: items };
  }

  @Patch(':id/disable')
  async patchCredentialDisable(
    @Param('id') id: string,
    @Body() dto: PatchCredentialDisableDto,
  ) {
    const result = await this.service.setCredentialDisabled(id, dto.disabled);
    return { message: '계정 활성/비활성 변경', data: result };
  }

  @Patch(':id/role')
  async patchCredentialRole(
    @Param('id') id: string,
    @Body() dto: PatchCredentialRoleDto,
  ) {
    const result = await this.service.setCredentialRole(id, dto.role);
    return { message: '권한 변경', data: result };
  }
}
