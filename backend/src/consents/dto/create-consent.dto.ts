import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientDocumentType } from '../../clients/entities/client.entity';

export class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateConsentDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  clientPhoto?: string;

  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  // Información adicional del cliente para crear/vincular
  @IsEnum(ClientDocumentType)
  @IsOptional()
  documentType?: ClientDocumentType;

  @IsUUID()
  @IsOptional()
  existingClientId?: string; // ID del cliente si ya existe

  // tenantId se inyectará automáticamente desde el usuario autenticado
  // No debe ser enviado por el cliente
}
