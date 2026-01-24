import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, MinLength, MaxLength, Matches } from 'class-validator';
import { ClientDocumentType } from '../entities/client.entity';

export class CreateClientDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @IsEnum(ClientDocumentType)
  documentType: ClientDocumentType;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @Matches(/^[0-9A-Z-]+$/, { message: 'Número de documento inválido' })
  documentNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Número de teléfono inválido' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Número de teléfono inválido' })
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
