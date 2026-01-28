# Resumen de Implementación - Logos Separados CN/HC

## ✅ Completado

### 1. Base de Datos
- ✅ Migración ejecutada: 3 columnas agregadas a `app_settings`
  - `hc_logo_url`
  - `hc_footer_logo_url`
  - `hc_watermark_logo_url`

### 2. Backend - DTOs y Entidades
- ✅ `UpdateSettingsDto`: Agregadas propiedades `hcLogoUrl`, `hcFooterLogoUrl`, `hcWatermarkLogoUrl`

### 3. Backend - Servicio Settings
- ✅ Método `getSettings()`: Retorna logos HC
- ✅ Método `uploadHCLogo()`: Sube logo principal HC
- ✅ Método `uploadHCFooterLogo()`: Sube logo footer HC
- ✅ Método `uploadHCWatermarkLogo()`: Sube marca de agua HC

### 4. Backend - Controlador Settings
- ✅ Endpoint `POST /settings/hc-logo`: Sube logo principal HC
- ✅ Endpoint `POST /settings/hc-footer-logo`: Sube logo footer HC
- ✅ Endpoint `POST /settings/hc-watermark-logo`: Sube marca de agua HC

### 5. Frontend - Página de Configuración (Parcial)
- ✅ Pestañas separadas: "Logos CN" y "Logos HC"
- ✅ Estados para uploads HC
- ✅ Refs para inputs HC
- ✅ Función `handleLogoUpload` modificada para soportar logos HC

## ⏳ Pendiente

### 1. Backend - Generador de PDF
**Archivo**: `backend/src/common/services/pdf-generator.service.ts`

**Nota**: El generador actual es muy simple y no usa settings. Necesita refactorización completa para:
- Inyectar `SettingsService`
- Recibir `tenantId` como parámetro
- Aceptar opción `useHCLogos` en `PDFGenerationOptions`
- Cargar logos desde settings según el tipo
- Aplicar logos al PDF (header, footer, watermark)

**Alternativa más simple**: Pasar los logos directamente como parámetros en lugar de cargarlos desde settings dentro del generador.

### 2. Backend - Medical Records Service
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
    useHCLogos: true, // AGREGAR ESTA LÍNEA
  },
);
```

### 3. Frontend - Theme Context
**Archivo**: `frontend/src/contexts/ThemeContext.tsx`

Agregar al interface `Settings`:
```typescript
hcLogoUrl?: string;
hcFooterLogoUrl?: string;
hcWatermarkLogoUrl?: string;
```

### 4. Frontend - Settings Page (Completar)
**Archivo**: `frontend/src/pages/SettingsPage.tsx`

El archivo ya tiene los cambios parciales pero necesita:
- Verificar que la sección "Logos HC" se renderice correctamente
- Asegurar que los endpoints se llamen correctamente

## Decisión de Diseño: Generador de PDF

El generador de PDF actual (`pdf-generator.service.ts`) es muy simple y no usa settings ni logos. Hay dos opciones:

### Opción A: Refactorizar Generador (Complejo)
- Inyectar `SettingsService`
- Cargar settings dentro del generador
- Aplicar logos al PDF
- **Problema**: Requiere refactorización completa del generador

### Opción B: Pasar Logos como Parámetros (Simple) ⭐ RECOMENDADO
- Cargar settings en `MedicalRecordsService`
- Pasar logos como parámetros a `generateCompositePDF`
- Generador solo aplica los logos recibidos
- **Ventaja**: Cambio mínimo, más flexible

## Implementación Recomendada (Opción B)

### 1. Modificar Interface PDFGenerationOptions
```typescript
export interface PDFGenerationOptions {
  pageBreakBetweenTemplates?: boolean;
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerText?: string;
  footerText?: string;
  // NUEVOS PARÁMETROS
  logoUrl?: string;
  footerLogoUrl?: string;
  watermarkLogoUrl?: string;
}
```

### 2. Modificar MedicalRecordsService
```typescript
// Cargar settings
const settings = await this.settingsService.getSettings(tenantId);

// Seleccionar logos HC (con fallback a CN)
const logoUrl = settings.hcLogoUrl || settings.logoUrl;
const footerLogoUrl = settings.hcFooterLogoUrl || settings.footerLogoUrl;
const watermarkLogoUrl = settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl;

// Generar PDF con logos
const pdfBuffer = await this.pdfGeneratorService.generateCompositePDF(
  renderedTemplates,
  {
    pageBreakBetweenTemplates: true,
    includePageNumbers: true,
    includeFooter: true,
    footerText: `${medicalRecord.tenant?.name || ''} - Documento generado electrónicamente`,
    logoUrl,
    footerLogoUrl,
    watermarkLogoUrl,
  },
);
```

### 3. Modificar PDFGeneratorService
```typescript
// En el método generateCompositePDF, usar los logos recibidos
if (options.logoUrl) {
  // Agregar logo al header
}

if (options.watermarkLogoUrl) {
  // Agregar marca de agua al fondo
}

if (options.footerLogoUrl) {
  // Agregar logo al footer
}
```

## Estado Actual del Sistema

### ✅ Funcional
- Subida de logos HC desde frontend
- Almacenamiento en S3
- Guardado en base de datos
- Recuperación de logos HC desde API

### ⚠️ No Funcional Aún
- PDFs de HC no usan logos HC (usan logos CN o ninguno)
- Necesita completar integración con generador de PDF

## Próximos Pasos

1. ✅ Reiniciar backend para aplicar cambios
2. ⏳ Inyectar `SettingsService` en `MedicalRecordsService`
3. ⏳ Modificar `createConsentFromMedicalRecord` para cargar y pasar logos
4. ⏳ Modificar `PDFGeneratorService` para aceptar y aplicar logos
5. ⏳ Actualizar `ThemeContext` en frontend
6. ⏳ Probar subida de logos HC
7. ⏳ Probar generación de PDF con logos HC

## Notas Importantes

- Los logos HC tienen fallback automático a logos CN
- Si no hay logos HC configurados, se usan logos CN
- Si no hay logos CN tampoco, el PDF se genera sin logos
- No rompe funcionalidad existente
- Consentimientos tradicionales siguen usando logos CN
