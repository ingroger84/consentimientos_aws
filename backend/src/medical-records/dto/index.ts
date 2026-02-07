import { IsString, IsUUID, IsDateString, IsOptional, IsIn, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Medical Record DTOs - Importar desde archivos separados
export { CreateMedicalRecordDto, CreateClientDataDto } from './create-medical-record.dto';
export { UpdateMedicalRecordDto } from './update-medical-record.dto';

// Anamnesis DTOs
export class CreateAnamnesisDto {
  @IsString()
  chiefComplaint: string;

  @IsString()
  @IsOptional()
  currentIllness?: string;

  @IsString()
  @IsOptional()
  personalHistory?: string;

  @IsString()
  @IsOptional()
  familyHistory?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  currentMedications?: string;
}

export class UpdateAnamnesisDto extends PartialType(CreateAnamnesisDto) {}

// Physical Exam DTOs
export class CreatePhysicalExamDto {
  @IsObject()
  @IsOptional()
  vitalSigns?: Record<string, any>;

  @IsString()
  @IsOptional()
  generalAppearance?: string;

  @IsObject()
  @IsOptional()
  systemsReview?: Record<string, any>;

  @IsString()
  @IsOptional()
  findings?: string;
}

export class UpdatePhysicalExamDto extends PartialType(CreatePhysicalExamDto) {}

// Diagnosis DTOs
export class CreateDiagnosisDto {
  @IsString()
  @IsIn(['principal', 'relacionado', 'complicacion'])
  diagnosisType: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;
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
}

export class UpdateEvolutionDto extends PartialType(CreateEvolutionDto) {}

// Medical Orders DTOs
export { CreateMedicalOrderDto, UpdateMedicalOrderDto } from './medical-order.dto';

// Prescriptions DTOs
export { CreatePrescriptionDto, UpdatePrescriptionDto } from './prescription.dto';

// Procedures DTOs
export { CreateProcedureDto, UpdateProcedureDto } from './procedure.dto';

// Treatment Plans DTOs
export { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from './treatment-plan.dto';

// Epicrisis DTOs
export { CreateEpicrisisDto, UpdateEpicrisisDto } from './epicrisis.dto';

// Medical Record Documents DTOs
export { UploadDocumentDto } from './medical-record-document.dto';
