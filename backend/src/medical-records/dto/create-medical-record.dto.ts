import { IsString, IsUUID, IsDateString, IsOptional, IsIn } from 'class-validator';

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
