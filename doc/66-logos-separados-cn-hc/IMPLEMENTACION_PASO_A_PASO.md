# Implementación Paso a Paso - Logos Separados CN/HC

## Estado Actual
✅ Migración de base de datos completada
- Columnas `hc_logo_url`, `hc_footer_logo_url`, `hc_watermark_logo_url` agregadas a `app_settings`

## Próximos Pasos

### 1. Backend - Entidad AppSettings ✅ COMPLETADO
**Archivo**: `backend/src/settings/entities/app-settings.entity.ts`

Agregar propiedades:
```typescript
@Column({ name: 'hc_logo_url', nullable: true })
hcLogoUrl: string;

@Column({ name: 'hc_footer_logo_url', nullable: true })
hcFooterLogoUrl: string;

@Column({ name: 'hc_watermark_logo_url', nullable: true })
hcWatermarkLogoUrl: string;
```

### 2. Backend - Controlador Settings
**Archivo**: `backend/src/settings/settings.controller.ts`

Agregar 3 nuevos endpoints después de los endpoints existentes de logos:

```typescript
@Post('hc-logo')
@UseInterceptors(FileInterceptor('logo', {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  },
}))
async uploadHCLogo(
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const url = await this.settingsService.uploadHCLogo(file, req.user.tenantId);
  return { url };
}

@Post('hc-footer-logo')
@UseInterceptors(FileInterceptor('logo', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  },
}))
async uploadHCFooterLogo(
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const url = await this.settingsService.uploadHCFooterLogo(file, req.user.tenantId);
  return { url };
}

@Post('hc-watermark-logo')
@UseInterceptors(FileInterceptor('logo', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  },
}))
async uploadHCWatermarkLogo(
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const url = await this.settingsService.uploadHCWatermarkLogo(file, req.user.tenantId);
  return { url };
}
```

### 3. Backend - Servicio Settings
**Archivo**: `backend/src/settings/settings.service.ts`

Agregar 3 nuevos métodos después de los métodos existentes de logos:

```typescript
async uploadHCLogo(file: Express.Multer.File, tenantId: string): Promise<string> {
  const folder = `settings/${tenantId}`;
  const fileName = `hc-logo-${Date.now()}.${file.originalname.split('.').pop()}`;
  
  const url = await this.storageService.uploadBuffer(
    file.buffer,
    folder,
    fileName,
    file.mimetype,
  );

  await this.settingsRepository.update(
    { tenantId },
    { hcLogoUrl: url },
  );

  return url;
}

async uploadHCFooterLogo(file: Express.Multer.File, tenantId: string): Promise<string> {
  const folder = `settings/${tenantId}`;
  const fileName = `hc-footer-logo-${Date.now()}.${file.originalname.split('.').pop()}`;
  
  const url = await this.storageService.uploadBuffer(
    file.buffer,
    folder,
    fileName,
    file.mimetype,
  );

  await this.settingsRepository.update(
    { tenantId },
    { hcFooterLogoUrl: url },
  );

  return url;
}

async uploadHCWatermarkLogo(file: Express.Multer.File, tenantId: string): Promise<string> {
  const folder = `settings/${tenantId}`;
  const fileName = `hc-watermark-${Date.now()}.${file.originalname.split('.').pop()}`;
  
  const url = await this.storageService.uploadBuffer(
    file.buffer,
    folder,
    fileName,
    file.mimetype,
  );

  await this.settingsRepository.update(
    { tenantId },
    { hcWatermarkLogoUrl: url },
  );

  return url;
}
```

### 4. Backend - Generador de PDF
**Archivo**: `backend/src/common/services/pdf-generator.service.ts`

Modificar método `generateCompositePDF`:

```typescript
async generateCompositePDF(
  templates: Array<{ name: string; content: string }>,
  options?: {
    pageBreakBetweenTemplates?: boolean;
    includePageNumbers?: boolean;
    includeFooter?: boolean;
    footerText?: string;
    useHCLogos?: boolean; // NUEVO PARÁMETRO
  },
): Promise<Buffer> {
  // ... código existente ...

  // Obtener settings
  const settings = await this.settingsService.getSettings(tenantId);

  // Seleccionar logos según el tipo de documento
  const logoUrl = options?.useHCLogos 
    ? (settings.hcLogoUrl || settings.logoUrl) // Fallback a CN si no hay HC
    : settings.logoUrl;

  const footerLogoUrl = options?.useHCLogos
    ? (settings.hcFooterLogoUrl || settings.footerLogoUrl)
    : settings.footerLogoUrl;

  const watermarkLogoUrl = options?.useHCLogos
    ? (settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl)
    : settings.watermarkLogoUrl;

  // Usar logoUrl, footerLogoUrl, watermarkLogoUrl en lugar de settings.logoUrl, etc.
  // ... resto del código ...
}
```

### 5. Backend - Servicio Medical Records
**Archivo**: `backend/src/medical-records/medical-records.service.ts`

Modificar llamada a `generateCompositePDF` en el método `createConsentFromMedicalRecord`:

```typescript
// 7. Generar PDF compuesto
const pdfBuffer = await this.pdfGeneratorService.generateCompositePDF(
  renderedTemplates,
  {
    pageBreakBetweenTemplates: true,
    includePageNumbers: true,
    includeFooter: true,
    footerText: `${medicalRecord.tenant?.name || ''} - Documento generado electrónicamente`,
    useHCLogos: true, // NUEVO - Usar logos HC
  },
);
```

### 6. Frontend - Contexto Theme
**Archivo**: `frontend/src/contexts/ThemeContext.tsx`

Agregar propiedades al interface Settings:

```typescript
interface Settings {
  // ... propiedades existentes ...
  hcLogoUrl?: string;
  hcFooterLogoUrl?: string;
  hcWatermarkLogoUrl?: string;
}
```

### 7. Frontend - Página de Configuración
**Archivo**: `frontend/src/pages/SettingsPage.tsx`

Ya implementado parcialmente. Necesita:
- Completar la sección de logos HC
- Asegurar que los endpoints se llamen correctamente

## Orden de Implementación

1. ✅ Migración de base de datos
2. ⏳ Backend - Entidad (siguiente)
3. ⏳ Backend - Servicio
4. ⏳ Backend - Controlador
5. ⏳ Backend - Generador de PDF
6. ⏳ Backend - Medical Records Service
7. ⏳ Frontend - Theme Context
8. ⏳ Frontend - Settings Page
9. ⏳ Pruebas

## Notas Importantes

- Los logos HC tienen fallback automático a logos CN si no están configurados
- No rompe funcionalidad existente
- Los consentimientos tradicionales siguen usando logos CN
- Los consentimientos de HC usan logos HC (o CN como fallback)
