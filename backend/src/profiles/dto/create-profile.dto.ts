import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PermissionDto {
  @ApiProperty({ description: 'Código del módulo', example: 'medical_records' })
  @IsString()
  module: string;

  @ApiProperty({ description: 'Acciones permitidas', example: ['view', 'create', 'edit'] })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

export class CreateProfileDto {
  @ApiProperty({ description: 'Nombre del perfil', example: 'Médico Especialista' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del perfil' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID del tenant (null para perfil global)' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ description: 'Permisos del perfil', type: [PermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @ApiPropertyOptional({ description: 'Estado activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
