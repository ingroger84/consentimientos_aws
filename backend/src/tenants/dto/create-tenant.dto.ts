import { IsString, IsEmail, IsOptional, IsEnum, IsInt, Min, Max, ValidateNested, IsNotEmpty, MinLength, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus, TenantPlan, BillingCycle } from '../entities/tenant.entity';

export class AdminUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan;

  @IsNumber()
  @IsOptional()
  planPrice?: number;

  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @IsInt()
  @Min(1)
  @Max(28)
  @IsOptional()
  billingDay?: number;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  maxUsers?: number;

  @IsInt()
  @Min(1)
  @Max(1000000)
  @IsOptional()
  maxConsents?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxBranches?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxServices?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxQuestions?: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  maxMedicalRecords?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxMRConsentTemplates?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxConsentTemplates?: number;

  @IsInt()
  @Min(1)
  @Max(999999)
  @IsOptional()
  storageLimitMb?: number;

  @IsOptional()
  features?: Record<string, any>;

  @IsOptional()
  trialEndsAt?: Date;

  @IsOptional()
  subscriptionEndsAt?: Date;

  @IsOptional()
  planStartedAt?: Date;

  @IsOptional()
  planExpiresAt?: Date;

  @IsOptional()
  settings?: Record<string, any>;

  @IsOptional()
  metadata?: Record<string, any>;

  // Datos del usuario administrador del tenant
  @ValidateNested()
  @Type(() => AdminUserDto)
  @IsNotEmpty()
  adminUser: AdminUserDto;
}
