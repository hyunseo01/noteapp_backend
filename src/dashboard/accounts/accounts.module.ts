import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TeamMember } from './entities/team-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountCredential } from './entities/account-credential.entity';
import { Account } from './entities/account.entity';
import { Team } from './entities/team.entity';
import { BcryptService } from '../../common/hashing/bcrypt.service';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { AccountsInfoController } from './accounts-info.controllers';
import { EmployeeInfoService } from './employee-info.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountCredential, Account, Team, TeamMember]),
  ],
  controllers: [AccountsController, TeamController, AccountsInfoController],
  providers: [AccountsService, TeamService, BcryptService, EmployeeInfoService],
  exports: [AccountsService, TeamService, BcryptService],
})
export class AccountsModule {}
