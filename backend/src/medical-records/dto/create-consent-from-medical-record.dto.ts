import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ConsentTypeFromMR {
  GENERAL = 'general',
  PROCEDURE = 'procedure',
  DATA_TREATMENT = 'data_treatment',
  IMAGE_RIGHTS = 'image_rights',
}

export class AdditionalInfoDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risks?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complications?: string[];
}

export class CreateConsentFromMedicalRecordDto {
  @IsEnum(ConsentTypeFromMR)
  consentType: ConsentTypeFromMR;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  templateIds?: string[];

  @IsOptional()
  @IsString()
  signatureData?: string;

  @IsOptional()
  @IsString()
  clientPhoto?: string;

  @IsOptional()
  @IsString()
  procedureName?: string;

  @IsOptional()
  @IsString()
  diagnosisCode?: string;

  @IsOptional()
  @IsString()
  diagnosisDescription?: string;

  @IsOptional()
  @IsBoolean()
  requiredForProcedure?: boolean;

  @IsOptional()
  @IsString()
  evolutionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalInfoDto)
  additionalInfo?: AdditionalInfoDto;
}
