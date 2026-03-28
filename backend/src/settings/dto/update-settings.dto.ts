import { IsString, IsOptional, IsHexColor, IsNumber, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  // Logos CN (Consentimientos tradicionales)
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  footerLogoUrl?: string;

  @IsOptional()
  @IsString()
  watermarkLogoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  // Logos HC (Historias Clínicas)
  @IsOptional()
  @IsString()
  hcLogoUrl?: string;

  @IsOptional()
  @IsString()
  hcFooterLogoUrl?: string;

  @IsOptional()
  @IsString()
  hcWatermarkLogoUrl?: string;

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

  @IsOptional()
  @IsString()
  supportEmail?: string;

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

  // Configuración de backups automáticos
  @IsOptional()
  @IsString()
  backupSchedule1?: string; // Formato: "HH:MM" (ej: "12:00")

  @IsOptional()
  @IsString()
  backupSchedule2?: string; // Formato: "HH:MM" (ej: "19:00")
}
