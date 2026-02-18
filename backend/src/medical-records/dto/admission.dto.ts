import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionType } from '../entities/admission.entity';

export class CreateAdmissionDto {
  @ApiProperty({
    description: 'ID de la historia clínica',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  medicalRecordId: string;

  @ApiProperty({
    description: 'Fecha de admisión',
    example: '2026-02-18T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiProperty({
    description: 'Tipo de admisión',
    enum: AdmissionType,
    example: AdmissionType.CONTROL,
  })
  @IsEnum(AdmissionType)
  @IsNotEmpty()
  admissionType: AdmissionType;

  @ApiProperty({
    description: 'Motivo de la admisión/consulta',
    example: 'Control de seguimiento post-operatorio',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateAdmissionDto {
  @ApiProperty({
    description: 'Fecha de admisión',
    example: '2026-02-18T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiProperty({
    description: 'Tipo de admisión',
    enum: AdmissionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdmissionType)
  admissionType?: AdmissionType;

  @ApiProperty({
    description: 'Motivo de la admisión/consulta',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CloseAdmissionDto {
  @ApiProperty({
    description: 'Notas de cierre de la admisión',
    example: 'Paciente dado de alta en buen estado general',
    required: false,
  })
  @IsOptional()
  @IsString()
  closureNotes?: string;
}
