import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min } from 'class-validator';

class LimitsDto {
  @IsOptional()
  @IsNumber()
  @Min(-1)
  users?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  branches?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  consents?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  medicalRecords?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  mrConsentTemplates?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  consentTemplates?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  services?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  questions?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  storageMb?: number;
}

class FeaturesDto {
  @IsOptional()
  @IsBoolean()
  customization?: boolean;

  @IsOptional()
  @IsBoolean()
  advancedReports?: boolean;

  @IsOptional()
  @IsBoolean()
  prioritySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  customDomain?: boolean;

  @IsOptional()
  @IsBoolean()
  whiteLabel?: boolean;

  @IsOptional()
  @IsBoolean()
  apiAccess?: boolean;

  @IsOptional()
  @IsString()
  backup?: 'none' | 'weekly' | 'daily';

  @IsOptional()
  @IsString()
  supportResponseTime?: string;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMonthly?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAnnual?: number;

  @IsOptional()
  @IsObject()
  limits?: LimitsDto;

  @IsOptional()
  @IsObject()
  features?: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;
}
