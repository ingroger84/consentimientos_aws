import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ClientDocumentType } from '../entities/client.entity';

export class SearchClientDto {
  @IsOptional()
  @IsString()
  search?: string; // Búsqueda general (nombre, documento, email, teléfono)

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsEnum(ClientDocumentType)
  documentType?: ClientDocumentType;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
