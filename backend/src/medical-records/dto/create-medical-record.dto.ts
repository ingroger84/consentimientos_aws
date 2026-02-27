import { IsString, IsUUID, IsDateString, IsOptional, IsIn, IsEmail, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClientDataDto {
  @IsString()
  fullName: string;

  @IsEnum(['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'])
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateMedicalRecordDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ValidateNested()
  @Type(() => CreateClientDataDto)
  @IsOptional()
  clientData?: CreateClientDataDto;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsDateString()
  admissionDate: string;

  @IsString()
  @IsIn(['primera_vez', 'control', 'urgencia', 'hospitalizacion', 'cirugia', 'procedimiento', 'telemedicina', 'domiciliaria', 'interconsulta', 'otro'])
  admissionType: string;
}
