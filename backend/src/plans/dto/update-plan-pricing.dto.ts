import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlanPricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMonthly?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAnnual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsString()
  taxName?: string;
}
