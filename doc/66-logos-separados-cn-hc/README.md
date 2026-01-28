# Logos Separados para CN y HC

## Objetivo
Separar la configuración de logos para Consentimientos tradicionales (CN) y Historias Clínicas (HC), permitiendo personalizar independientemente los PDFs de cada módulo.

## Cambios Requeridos

### 1. Frontend - Página de Configuración

**Archivo**: `frontend/src/pages/SettingsPage.tsx`

Cambios:
- Separar pestaña "Logos" en dos: "Logos CN" y "Logos HC"
- Agregar estados para logos HC: `uploadingHCLogo`, `uploadingHCFooterLogo`, `uploadingHCWatermark`
- Agregar refs para inputs HC: `hcLogoInputRef`, `hcFooterLogoInputRef`, `hcWatermarkInputRef`
- Modificar `handleLogoUpload` para soportar tipos: `'hc-logo'`, `'hc-footer'`, `'hc-watermark'`
- Crear sección "Logos CN" con los logos actuales (logo, footerLogo, watermark, favicon)
- Crear sección "Logos HC" con nuevos logos (hcLogo, hcFooterLogo, hcWatermark)

### 2. Backend - Entidad AppSettings

**Archivo**: `backend/src/settings/entities/app-settings.entity.ts`

Agregar columnas:
```typescript
@Column({ name: 'hc_logo_url', nullable: true })
hcLogoUrl: string;

@Column({ name: 'hc_footer_logo_url', nullable: true })
hcFooterLogoUrl: string;

@Column({ name: 'hc_watermark_logo_url', nullable: true })
hcWatermarkLogoUrl: string;
```

### 3. Backend - Controlador de Settings

**Archivo**: `backend/src/settings/settings.controller.ts`

Agregar endpoints:
```typescript
@Post('hc-logo')
@UseInterceptors(FileInterceptor('logo'))
async uploadHCLogo(@UploadedFile() file, @Request() req) {
  // Subir logo HC
}

@Post('hc-footer-logo')
@UseInterceptors(FileInterceptor('logo'))
async uploadHCFooterLogo(@UploadedFile() file, @Request() req) {
  // Subir logo footer HC
}

@Post('hc-watermark-logo')
@UseInterceptors(FileInterceptor('logo'))
async uploadHCWatermarkLogo(@UploadedFile() file, @Request() req) {
  // Subir marca de agua HC
}
```

### 4. Backend - Servicio de Settings

**Archivo**: `backend/src/settings/settings.service.ts`

Agregar métodos:
```typescript
async uploadHCLogo(file, tenantId): Promise<string> {
  // Subir a S3 y actualizar settings
}

async uploadHCFooterLogo(file, tenantId): Promise<string> {
  // Subir a S3 y actualizar settings
}

async uploadHCWatermarkLogo(file, tenantId): Promise<string> {
  // Subir a S3 y actualizar settings
}
```

### 5. Backend - Generador de PDF

**Archivo**: `backend/src/common/services/pdf-generator.service.ts`

Modificar método `generateCompositePDF` para aceptar parámetro `useHCLogos`:
```typescript
async generateCompositePDF(
  templates: Array<{ name: string; content: string }>,
  options?: {
    pageBreakBetweenTemplates?: boolean;
    includePageNumbers?: boolean;
    includeFooter?: boolean;
    footerText?: string;
    useHCLogos?: boolean; // NUEVO
  },
): Promise<Buffer>
```

Lógica:
```typescript
const settings = await this.settingsService.getSettings(tenantId);

const logoUrl = options?.useHCLogos 
  ? (settings.hcLogoUrl || settings.logoUrl) // Fallback a logo CN si no hay HC
  : settings.logoUrl;

const footerLogoUrl = options?.useHCLogos
  ? (settings.hcFooterLogoUrl || settings.footerLogoUrl)
  : settings.footerLogoUrl;

const watermarkLogoUrl = options?.useHCLogos
  ? (settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl)
  : settings.watermarkLogoUrl;
```

### 6. Backend - Servicio de Medical Records

**Archivo**: `backend/src/medical-records/medical-records.service.ts`

Modificar llamada a `generateCompositePDF`:
```typescript
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

### 7. Frontend - Contexto de Theme

**Archivo**: `frontend/src/contexts/ThemeContext.tsx`

Agregar propiedades al interface `Settings`:
```typescript
interface Settings {
  // ... propiedades existentes
  hcLogoUrl?: string;
  hcFooterLogoUrl?: string;
  hcWatermarkLogoUrl?: string;
}
```

### 8. Migración de Base de Datos

**Archivo**: `backend/add-hc-logos-columns.sql`

```sql
-- Agregar columnas para logos HC
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS hc_logo_url TEXT;

ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS hc_footer_logo_url TEXT;

ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS hc_watermark_logo_url TEXT;

-- Comentarios
COMMENT ON COLUMN app_settings.hc_logo_url IS 'URL del logo principal para PDFs de Historias Clínicas';
COMMENT ON COLUMN app_settings.hc_footer_logo_url IS 'URL del logo del footer para PDFs de Historias Clínicas';
COMMENT ON COLUMN app_settings.hc_watermark_logo_url IS 'URL de la marca de agua para PDFs de Historias Clínicas';
```

## Flujo de Uso

### Para Consentimientos Tradicionales (CN)
1. Usuario va a Configuración → Logos CN
2. Sube logo, footer logo, watermark
3. Al generar PDF desde módulo Consentimientos, se usan logos CN

### Para Historias Clínicas (HC)
1. Usuario va a Configuración → Logos HC
2. Sube logo HC, footer logo HC, watermark HC
3. Al generar PDF desde módulo Historias Clínicas, se usan logos HC
4. Si no hay logos HC configurados, se usan logos CN como fallback

## Beneficios

1. **Separación clara**: Cada módulo tiene su propia identidad visual
2. **Flexibilidad**: Permite usar diferentes logos para diferentes contextos
3. **Fallback automático**: Si no hay logos HC, usa logos CN
4. **Compatibilidad**: No rompe funcionalidad existente
5. **Escalable**: Fácil agregar más configuraciones específicas por módulo

## Archivos a Modificar

### Frontend
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/contexts/ThemeContext.tsx`

### Backend
- `backend/src/settings/entities/app-settings.entity.ts`
- `backend/src/settings/settings.controller.ts`
- `backend/src/settings/settings.service.ts`
- `backend/src/common/services/pdf-generator.service.ts`
- `backend/src/medical-records/medical-records.service.ts`

### Migración
- `backend/add-hc-logos-columns.sql`
- `backend/run-hc-logos-migration.js`

## Estado
- [ ] Migración de base de datos
- [ ] Backend - Entidad y DTOs
- [ ] Backend - Controlador y servicio
- [ ] Backend - Generador de PDF
- [ ] Backend - Servicio de Medical Records
- [ ] Frontend - Página de configuración
- [ ] Frontend - Contexto de Theme
- [ ] Pruebas
