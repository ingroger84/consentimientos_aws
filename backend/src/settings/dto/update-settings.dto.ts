import { IsString, IsOptional, IsHexColor, IsNumber, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  // Logos
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  footerLogoUrl?: string;

  @IsOptional()
  @IsString()
  watermarkLogoUrl?: string;

  // Colores principales
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  // Colores adicionales
  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @IsOptional()
  @IsHexColor()
  linkColor?: string;

  @IsOptional()
  @IsHexColor()
  borderColor?: string;

  // Información de la empresa
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  // Configuración de logo
  @IsOptional()
  @IsNumber()
  logoSize?: number;

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  logoPosition?: string;

  @IsOptional()
  @IsNumber()
  watermarkOpacity?: number;

  // Textos personalizables
  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  procedureTitle?: string;

  @IsOptional()
  @IsString()
  dataTreatmentTitle?: string;

  @IsOptional()
  @IsString()
  imageRightsTitle?: string;
}
