import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountCredential } from '../accounts/entities/account-credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountCredential])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
