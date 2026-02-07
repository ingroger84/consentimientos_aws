import { IsString, IsOptional, IsDateString, IsObject, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTreatmentPlanDto {
  @IsString()
  @IsOptional()
  evolutionId?: string;

  @IsString()
  @IsOptional()
  objective?: string;

  @IsObject()
  @IsOptional()
  pharmacologicalTreatment?: {
    medications: Array<{
      name: string;
      dose: string;
      frequency: string;
      duration: string;
      route: string;
    }>;
  };

  @IsString()
  @IsOptional()
  nonPharmacologicalTreatment?: string;

  @IsString()
  @IsOptional()
  patientEducation?: string;

  @IsString()
  @IsOptional()
  followUpCriteria?: string;

  @IsDateString()
  @IsOptional()
  nextAppointment?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsString()
  @IsOptional()
  restrictions?: string;
}

export class UpdateTreatmentPlanDto extends PartialType(CreateTreatmentPlanDto) {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'completed', 'modified', 'cancelled'])
  status?: string;
}
