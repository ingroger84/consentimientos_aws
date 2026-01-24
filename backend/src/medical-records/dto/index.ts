import { IsString, IsUUID, IsDateString, IsOptional, IsIn, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Medical Record DTOs
export class CreateMedicalRecordDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsDateString()
  admissionDate: string;

  @IsString()
  @IsIn(['consulta', 'urgencia', 'hospitalizacion', 'control'])
  admissionType: string;
}

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'closed', 'archived'])
  status?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}

// Anamnesis DTOs
export class CreateAnamnesisDto {
  @IsString()
  chiefComplaint: string;

  @IsString()
  @IsOptional()
  currentIllness?: string;

  @IsObject()
  @IsOptional()
  personalHistory?: Record<string, any>;

  @IsObject()
  @IsOptional()
  familyHistory?: Record<string, any>;

  @IsObject()
  @IsOptional()
  habits?: Record<string, any>;

  @IsObject()
  @IsOptional()
  gynecologicalHistory?: Record<string, any>;

  @IsObject()
  @IsOptional()
  systemsReview?: Record<string, any>;
}

export class UpdateAnamnesisDto extends PartialType(CreateAnamnesisDto) {}

// Physical Exam DTOs
export class CreatePhysicalExamDto {
  @IsNumber()
  @IsOptional()
  bloodPressureSystolic?: number;

  @IsNumber()
  @IsOptional()
  bloodPressureDiastolic?: number;

  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  oxygenSaturation?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  generalAppearance?: string;

  @IsObject()
  @IsOptional()
  physicalExamData?: Record<string, any>;

  @IsString()
  @IsOptional()
  otherFindings?: string;
}

export class UpdatePhysicalExamDto extends PartialType(CreatePhysicalExamDto) {}

// Diagnosis DTOs
export class CreateDiagnosisDto {
  @IsString()
  cie10Code: string;

  @IsString()
  cie10Description: string;

  @IsString()
  @IsOptional()
  @IsIn(['principal', 'relacionado', 'complicacion'])
  diagnosisType?: string;

  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;

  @IsBoolean()
  @IsOptional()
  isPresumptive?: boolean;
}

export class UpdateDiagnosisDto extends PartialType(CreateDiagnosisDto) {}

// Evolution DTOs
export class CreateEvolutionDto {
  @IsDateString()
  evolutionDate: string;

  @IsString()
  @IsOptional()
  subjective?: string;

  @IsString()
  @IsOptional()
  objective?: string;

  @IsString()
  @IsOptional()
  assessment?: string;

  @IsString()
  @IsOptional()
  plan?: string;

  @IsString()
  @IsOptional()
  @IsIn(['evolution', 'interconsulta', 'epicrisis'])
  noteType?: string;
}

export class UpdateEvolutionDto extends PartialType(CreateEvolutionDto) {}
