import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { TaxApplicationType } from '../entities/tax-config.entity';

export class CreateTaxConfigDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsEnum(TaxApplicationType)
  applicationType: TaxApplicationType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
