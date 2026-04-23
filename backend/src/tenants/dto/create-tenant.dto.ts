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

  @IsNumber()
  @IsOptional()
  customPriceMonthly?: number;

  @IsNumber()
  @IsOptional()
  customPriceAnnual?: number;

  @IsBoolean()
  @IsOptional()
  useCustomPrice?: boolean;

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

  @IsString()
  @IsOptional()
  documentTypeId?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxUsers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000000)
  maxConsents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxBranches?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxServices?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxQuestions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxMedicalRecords?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxMRConsentTemplates?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxMRConsents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxConsentTemplates?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
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
