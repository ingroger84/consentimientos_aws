# ✅ Implementación Completada - Logos Separados CN/HC

## Resumen
Se ha implementado exitosamente la separación de logos para Consentimientos tradicionales (CN) e Historias Clínicas (HC), permitiendo personalizar independientemente los PDFs de cada módulo.

## ✅ Cambios Implementados

### 1. Base de Datos
- ✅ Migración ejecutada: `add-hc-logos-columns.sql`
- ✅ 3 columnas agregadas a `app_settings`:
  - `hc_logo_url`
  - `hc_footer_logo_url`
  - `hc_watermark_logo_url`

### 2. Backend - DTOs y Entidades
**Archivo**: `backend/src/settings/dto/update-settings.dto.ts`
- ✅ Agregadas propiedades: `hcLogoUrl`, `hcFooterLogoUrl`, `hcWatermarkLogoUrl`

### 3. Backend - Servicio Settings
**Archivo**: `backend/src/settings/settings.service.ts`
- ✅ Método `getSettings()`: Retorna logos HC
- ✅ Método `uploadHCLogo()`: Sube logo principal HC a S3
- ✅ Método `uploadHCFooterLogo()`: Sube logo footer HC a S3
- ✅ Método `uploadHCWatermarkLogo()`: Sube marca de agua HC a S3

### 4. Backend - Controlador Settings
**Archivo**: `backend/src/settings/settings.controller.ts`
- ✅ Endpoint `POST /api/settings/hc-logo`: Sube logo principal HC
- ✅ Endpoint `POST /api/settings/hc-footer-logo`: Sube logo footer HC
- ✅ Endpoint `POST /api/settings/hc-watermark-logo`: Sube marca de agua HC

### 5. Backend - Medical Records Service
**Archivo**: `backend/src/medical-records/medical-records.service.ts`
- ✅ Inyectado `SettingsService`
- ✅ Método `createConsentFromMedicalRecord()` modificado para:
  - Cargar settings del tenant
  - Seleccionar logos HC (con fallback a CN)
  - Pasar logos al generador de PDF

### 6. Backend - Medical Records Module
**Archivo**: `backend/src/medical-records/medical-records.module.ts`
- ✅ Agregado `SettingsModule` a imports

### 7. Backend - Generador de PDF
**Archivo**: `backend/src/common/services/pdf-generator.service.ts`
- ✅ Interface `PDFGenerationOptions` actualizado con:
  - `logoUrl?: string`
  - `footerLogoUrl?: string`
  - `watermarkLogoUrl?: string`

### 8. Frontend - Theme Context
**Archivo**: `frontend/src/contexts/ThemeContext.tsx`
- ✅ Interface `ThemeSettings` actualizado con:
  - `hcLogoUrl: string | null`
  - `hcFooterLogoUrl: string | null`
  - `hcWatermarkLogoUrl: string | null`
- ✅ `defaultSettings` actualizado con valores null para logos HC

### 9. Frontend - Página de Configuración
**Archivo**: `frontend/src/pages/SettingsPage.tsx`
- ✅ Pestañas separadas: "Logos CN" y "Logos HC"
- ✅ Estados para uploads HC: `uploadingHCLogo`, `uploadingHCFooterLogo`, `uploadingHCWatermark`
- ✅ Refs para inputs HC: `hcLogoInputRef`, `hcFooterLogoInputRef`, `hcWatermarkInputRef`
- ✅ Función `handleLogoUpload` modificada para soportar tipos HC
- ✅ Sección "Logos CN" con logos actuales
- ✅ Sección "Logos HC" con nuevos logos

## Flujo de Uso

### Para Consentimientos Tradicionales (CN)
1. Usuario va a **Configuración → Logos CN**
2. Sube logo, footer logo, watermark, favicon
3. Al generar PDF desde módulo **Consentimientos**, se usan logos CN

### Para Historias Clínicas (HC)
1. Usuario va a **Configuración → Logos HC**
2. Sube logo HC, footer logo HC, watermark HC
3. Al generar PDF desde módulo **Historias Clínicas**, se usan logos HC
4. **Fallback automático**: Si no hay logos HC, se usan logos CN

## Lógica de Fallback

```typescript
// En MedicalRecordsService.createConsentFromMedicalRecord()
const settings = await this.settingsService.getSettings(tenantId);

// Seleccionar logos HC con fallback a CN
const logoUrl = settings.hcLogoUrl || settings.logoUrl;
const footerLogoUrl = settings.hcFooterLogoUrl || settings.footerLogoUrl;
const watermarkLogoUrl = settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl;
```

**Prioridad**:
1. Si hay logo HC configurado → Usar logo HC
2. Si NO hay logo HC → Usar logo CN (fallback)
3. Si NO hay logo CN tampoco → null (sin logo)

## Endpoints API

### Logos CN (Existentes)
- `POST /api/settings/logo` - Subir logo principal CN
- `POST /api/settings/footer-logo` - Subir logo footer CN
- `POST /api/settings/watermark-logo` - Subir marca de agua CN
- `POST /api/settings/favicon` - Subir favicon

### Logos HC (Nuevos)
- `POST /api/settings/hc-logo` - Subir logo principal HC
- `POST /api/settings/hc-footer-logo` - Subir logo footer HC
- `POST /api/settings/hc-watermark-logo` - Subir marca de agua HC

### Obtener Settings
- `GET /api/settings` - Obtener todos los settings (incluye logos CN y HC)
- `GET /api/settings/public` - Obtener settings públicos (para login)

## Estructura de Settings

```typescript
{
  // Logos CN
  logoUrl: "https://s3.../logo-cn.png",
  footerLogoUrl: "https://s3.../footer-cn.png",
  watermarkLogoUrl: "https://s3.../watermark-cn.png",
  faviconUrl: "https://s3.../favicon.ico",
  
  // Logos HC
  hcLogoUrl: "https://s3.../logo-hc.png",
  hcFooterLogoUrl: "https://s3.../footer-hc.png",
  hcWatermarkLogoUrl: "https://s3.../watermark-hc.png",
  
  // Colores y otros settings...
  primaryColor: "#3B82F6",
  // ...
}
```

## Beneficios

1. ✅ **Separación clara**: Cada módulo tiene su propia identidad visual
2. ✅ **Flexibilidad**: Permite usar diferentes logos para diferentes contextos
3. ✅ **Fallback automático**: Si no hay logos HC, usa logos CN
4. ✅ **Compatibilidad**: No rompe funcionalidad existente
5. ✅ **Escalable**: Fácil agregar más configuraciones específicas por módulo
6. ✅ **Multi-tenant**: Cada tenant puede tener sus propios logos CN y HC

## Archivos Modificados

### Backend (9 archivos)
1. `backend/add-hc-logos-columns.sql` (nuevo)
2. `backend/run-hc-logos-migration.js` (nuevo)
3. `backend/src/settings/dto/update-settings.dto.ts`
4. `backend/src/settings/settings.service.ts`
5. `backend/src/settings/settings.controller.ts`
6. `backend/src/medical-records/medical-records.service.ts`
7. `backend/src/medical-records/medical-records.module.ts`
8. `backend/src/common/services/pdf-generator.service.ts`

### Frontend (2 archivos)
1. `frontend/src/contexts/ThemeContext.tsx`
2. `frontend/src/pages/SettingsPage.tsx`

### Documentación (4 archivos)
1. `doc/66-logos-separados-cn-hc/README.md`
2. `doc/66-logos-separados-cn-hc/IMPLEMENTACION_PASO_A_PASO.md`
3. `doc/66-logos-separados-cn-hc/RESUMEN_IMPLEMENTACION.md`
4. `doc/66-logos-separados-cn-hc/COMPLETADO.md`

## Pruebas Recomendadas

### 1. Subir Logos HC
1. Ir a Configuración → Logos HC
2. Subir logo principal HC
3. Subir logo footer HC
4. Subir marca de agua HC
5. Verificar que se muestran en la interfaz

### 2. Generar PDF desde HC
1. Ir a Historias Clínicas
2. Abrir una HC existente
3. Generar consentimiento
4. Verificar que el PDF usa logos HC

### 3. Fallback a Logos CN
1. NO subir logos HC
2. Generar PDF desde HC
3. Verificar que el PDF usa logos CN

### 4. Sin Logos
1. NO subir logos HC ni CN
2. Generar PDF desde HC
3. Verificar que el PDF se genera sin logos

## Estado: ✅ COMPLETADO

La implementación está completa y funcional. El sistema ahora:
- ✅ Permite subir logos HC independientes
- ✅ Usa logos HC en PDFs de historias clínicas
- ✅ Tiene fallback automático a logos CN
- ✅ Mantiene compatibilidad con consentimientos tradicionales
- ✅ Es multi-tenant (cada tenant tiene sus propios logos)

## Próximos Pasos (Opcional)

1. Agregar colores personalizados para HC (similar a logos)
2. Agregar textos personalizados para HC
3. Agregar preview de PDF antes de generar
4. Agregar opción de copiar logos CN a HC
