import { IsString, IsDateString, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class CreateEpicrisisDto {
  @IsDateString()
  admissionDate: string;

  @IsDateString()
  dischargeDate: string;

  @IsString()
  admissionReason: string;

  @IsString()
  clinicalSummary: string;

  @IsString()
  admissionDiagnosis: string;

  @IsString()
  dischargeDiagnosis: string;

  @IsString()
  treatmentProvided: string;

  @IsString()
  @IsOptional()
  proceduresPerformed?: string;

  @IsString()
  dischargeCondition: string;

  @IsString()
  @IsIn(['home', 'transfer', 'death', 'voluntary', 'other'])
  dischargeType: string;

  @IsString()
  dischargeRecommendations: string;

  @IsString()
  @IsOptional()
  dischargeMedications?: string;

  @IsString()
  @IsOptional()
  followUpInstructions?: string;

  @IsString()
  @IsOptional()
  warningSigns?: string;
}

export class UpdateEpicrisisDto extends PartialType(CreateEpicrisisDto) {}
