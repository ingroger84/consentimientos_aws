import { IsString, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
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
}
