import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProcedureDto {
  @IsString()
  @IsOptional()
  procedureCode?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  procedureType?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  consentId?: string;
}

export class UpdateProcedureDto extends PartialType(CreateProcedureDto) {
  @IsString()
  @IsOptional()
  @IsIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsDateString()
  @IsOptional()
  performedAt?: string;

  @IsString()
  @IsOptional()
  findings?: string;

  @IsString()
  @IsOptional()
  complications?: string;

  @IsString()
  @IsOptional()
  postProcedureRecommendations?: string;
}
