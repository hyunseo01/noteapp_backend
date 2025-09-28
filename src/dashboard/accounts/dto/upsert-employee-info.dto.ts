import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertEmployeeInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContact?: string | null;

  @IsOptional()
  @IsString()
  addressLine?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryBankName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryAccount?: string | null;

  @IsOptional()
  @IsString()
  profileUrl?: string | null;
}
