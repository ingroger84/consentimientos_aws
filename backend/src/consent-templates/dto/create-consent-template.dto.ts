import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsUUID, MinLength, ArrayMinSize } from 'class-validator';
import { TemplateType } from '../entities/consent-template.entity';

export class CreateConsentTemplateDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(TemplateType)
  type: TemplateType;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1, { message: 'Debe asociar al menos un servicio a la plantilla' })
  serviceIds: string[];
}
