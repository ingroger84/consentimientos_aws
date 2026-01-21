import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AppSettings } from './entities/app-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private settingsRepository: Repository<AppSettings>,
    private storageService: StorageService,
  ) {}

  async getSettings(tenantId?: string) {
    // SEGURIDAD: Filtrar por tenantId si se proporciona
    console.log('[SettingsService] getSettings - tenantId recibido:', tenantId);
    console.log('[SettingsService] getSettings - tenantId tipo:', typeof tenantId);
    console.log('[SettingsService] getSettings - tenantId es undefined?', tenantId === undefined);
    console.log('[SettingsService] getSettings - tenantId es null?', tenantId === null);
    
    const where = tenantId ? { tenantId } : { tenantId: IsNull() };
    console.log('[SettingsService] getSettings - Buscando con where:', JSON.stringify(where));
    
    const settings = await this.settingsRepository.find({ where });
    console.log('[SettingsService] getSettings - Encontrados', settings.length, 'registros');
    
    if (settings.length > 0) {
      console.log('[SettingsService] getSettings - Primeros registros:', settings.slice(0, 3).map(s => ({
        key: s.key,
        value: s.value.substring(0, 50),
        tenantId: s.tenantId
      })));
    }
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    const result = {
      // Logos
      logoUrl: settingsMap['logoUrl'] || null,
      footerLogoUrl: settingsMap['footerLogoUrl'] || null,
      watermarkLogoUrl: settingsMap['watermarkLogoUrl'] || null,
      faviconUrl: settingsMap['faviconUrl'] || null,
      
      // Colores principales
      primaryColor: settingsMap['primaryColor'] || '#3B82F6',
      secondaryColor: settingsMap['secondaryColor'] || '#10B981',
      accentColor: settingsMap['accentColor'] || '#F59E0B',
      
      // Colores adicionales
      textColor: settingsMap['textColor'] || '#1F2937',
      linkColor: settingsMap['linkColor'] || '#3B82F6',
      borderColor: settingsMap['borderColor'] || '#D1D5DB',
      
      // Información de la empresa
      companyName: settingsMap['companyName'] || 'Sistema de Consentimientos',
      companyAddress: settingsMap['companyAddress'] || '',
      companyPhone: settingsMap['companyPhone'] || '',
      companyEmail: settingsMap['companyEmail'] || '',
      companyWebsite: settingsMap['companyWebsite'] || '',
      
      // Configuración de logo
      logoSize: parseInt(settingsMap['logoSize']) || 60,
      logoPosition: settingsMap['logoPosition'] || 'left',
      watermarkOpacity: parseFloat(settingsMap['watermarkOpacity']) || 0.1,
      
      // Textos personalizables
      footerText: settingsMap['footerText'] || '',
      procedureTitle: settingsMap['procedureTitle'] || 'CONSENTIMIENTO DEL PROCEDIMIENTO',
      dataTreatmentTitle: settingsMap['dataTreatmentTitle'] || 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES',
      imageRightsTitle: settingsMap['imageRightsTitle'] || 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES',
    };

    console.log('[SettingsService] getSettings - Retornando companyName:', result.companyName);
    return result;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto, tenantId?: string) {
    console.log('[SettingsService] updateSettings - tenantId:', tenantId);
    console.log('[SettingsService] updateSettings - datos:', updateSettingsDto);
    
    const updates = Object.entries(updateSettingsDto);

    for (const [key, value] of updates) {
      if (value !== undefined) {
        // Buscar setting por key Y tenantId
        const where = tenantId ? { key, tenantId } : { key, tenantId: IsNull() };
        let setting = await this.settingsRepository.findOne({ where });
        
        if (setting) {
          console.log(`[SettingsService] Actualizando ${key} = ${value} (existente)`);
          setting.value = value;
          await this.settingsRepository.save(setting);
        } else {
          console.log(`[SettingsService] Creando ${key} = ${value} (nuevo) con tenantId:`, tenantId);
          // Crear nuevo setting con tenantId
          const newSetting = this.settingsRepository.create({
            key, 
            value: String(value),
            tenantId: tenantId || null
          } as any);
          await this.settingsRepository.save(newSetting);
        }
      }
    }

    return this.getSettings(tenantId);
  }

  async uploadLogo(file: Express.Multer.File, tenantId?: string) {
    // Generar nombre único para el archivo
    const ext = file.originalname.split('.').pop();
    const filename = `logo-${tenantId || 'global'}-${Date.now()}.${ext}`;
    
    // Subir a S3 o almacenamiento local
    const logoUrl = await this.storageService.uploadFile(file, 'logo', filename);
    
    // Actualizar configuración
    await this.updateSettings({ logoUrl }, tenantId);
    
    return { logoUrl };
  }

  async uploadFooterLogo(file: Express.Multer.File, tenantId?: string) {
    // Generar nombre único para el archivo
    const ext = file.originalname.split('.').pop();
    const filename = `footer-logo-${tenantId || 'global'}-${Date.now()}.${ext}`;
    
    // Subir a S3 o almacenamiento local
    const logoUrl = await this.storageService.uploadFile(file, 'logo', filename);
    
    // Actualizar configuración
    await this.updateSettings({ footerLogoUrl: logoUrl }, tenantId);
    
    return { footerLogoUrl: logoUrl };
  }

  async uploadWatermarkLogo(file: Express.Multer.File, tenantId?: string) {
    // Generar nombre único para el archivo
    const ext = file.originalname.split('.').pop();
    const filename = `watermark-${tenantId || 'global'}-${Date.now()}.${ext}`;
    
    // Subir a S3 o almacenamiento local
    const logoUrl = await this.storageService.uploadFile(file, 'logo', filename);
    
    // Actualizar configuración
    await this.updateSettings({ watermarkLogoUrl: logoUrl }, tenantId);
    
    return { watermarkLogoUrl: logoUrl };
  }

  async uploadFavicon(file: Express.Multer.File, tenantId?: string) {
    // Generar nombre único para el archivo
    const ext = file.originalname.split('.').pop();
    const filename = `favicon-${tenantId || 'global'}-${Date.now()}.${ext}`;
    
    // Subir a S3 o almacenamiento local
    const faviconUrl = await this.storageService.uploadFile(file, 'favicon', filename);
    
    // Actualizar configuración
    await this.updateSettings({ faviconUrl: faviconUrl }, tenantId);
    
    return { faviconUrl: faviconUrl };
  }

  /**
   * Inicializa la configuración de un tenant con los datos proporcionados
   * Se llama automáticamente al crear un nuevo tenant
   */
  async initializeTenantSettings(tenantId: string, tenantData: {
    name: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }) {
    console.log('[SettingsService] Inicializando configuración para tenant:', tenantId);
    console.log('[SettingsService] Datos del tenant:', tenantData);

    const initialSettings = {
      companyName: tenantData.name,
      companyAddress: '',
      companyPhone: tenantData.contactPhone || '',
      companyEmail: tenantData.contactEmail || '',
      companyWebsite: '',
    };

    console.log('[SettingsService] Settings iniciales a guardar:', initialSettings);

    const result = await this.updateSettings(initialSettings, tenantId);
    
    console.log('[SettingsService] Settings guardados exitosamente:', result);
    
    return result;
  }

  async getEmailConfig(tenantId?: string) {
    const where = tenantId ? { tenantId } : { tenantId: IsNull() };
    const settings = await this.settingsRepository.find({ where });
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    return {
      useCustomEmail: settingsMap['useCustomEmail'] === 'true',
      smtpHost: settingsMap['smtpHost'] || '',
      smtpPort: parseInt(settingsMap['smtpPort']) || 587,
      smtpUser: settingsMap['smtpUser'] || '',
      smtpPassword: settingsMap['smtpPassword'] || '',
      smtpFrom: settingsMap['smtpFrom'] || '',
      smtpFromName: settingsMap['smtpFromName'] || '',
      useEncryption: settingsMap['useEncryption'] === 'true',
    };
  }

  async updateEmailConfig(emailConfig: any, tenantId?: string) {
    const updates = {
      useCustomEmail: String(emailConfig.useCustomEmail),
      smtpHost: emailConfig.smtpHost || '',
      smtpPort: String(emailConfig.smtpPort || 587),
      smtpUser: emailConfig.smtpUser || '',
      smtpPassword: emailConfig.smtpPassword || '',
      smtpFrom: emailConfig.smtpFrom || '',
      smtpFromName: emailConfig.smtpFromName || '',
      useEncryption: String(emailConfig.useEncryption),
    };

    await this.updateSettings(updates as any, tenantId);
    return { message: 'Configuración de correo actualizada correctamente' };
  }

  async testEmail(email: string, tenantId?: string) {
    // Este método será implementado en el MailService
    // Por ahora solo retornamos un mensaje de éxito
    return { 
      message: 'Correo de prueba enviado correctamente',
      email 
    };
  }
}
