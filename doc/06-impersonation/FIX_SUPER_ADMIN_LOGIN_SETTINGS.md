# Fix: Login del Super Admin Mostraba Settings de Tenant

## Problema Reportado
Al acceder a `http://admin.localhost:5173/login`, el sistema mostraba el login con el logo y nombre de un tenant ("Demo Consultorio Medico") en lugar de mostrar el login del Super Admin con settings por defecto.

## Investigación

### 1. Verificación del Middleware
El middleware `TenantMiddleware` estaba funcionando correctamente:
```
[TenantMiddleware] Host: admin.localhost:3000 -> Tenant Slug: null (Super Admin)
[TenantMiddleware] Subdominio 'admin' detectado - Super Admin
```

### 2. Verificación del Controller
El controller `SettingsController` también estaba funcionando correctamente:
```
[SettingsController] Tenant Slug: null
[SettingsController] Sin tenant slug - Usando settings del Super Admin
[SettingsController] TenantId final: undefined
```

### 3. Verificación del Service
El service `SettingsService` estaba buscando correctamente:
```
[SettingsService] Buscando con where: {"tenantId": IS NULL}
[SettingsService] Encontrados 20 registros
```

### 4. Causa Raíz Identificada
Al revisar los settings en la base de datos, se encontró que **los settings del Super Admin (tenantId IS NULL) tenían configurados logos y nombre de un tenant**:

```sql
SELECT key, value FROM app_settings WHERE "tenantId" IS NULL;

logoUrl: /uploads/logo/logo-1767689715667-506662064.png
watermarkLogoUrl: /uploads/logo/watermark-1767689737767-838343201.png
companyName: CONSENTIMIENTOS
companyAddress: SABANETA
companyPhone: 3134806927
companyEmail: info@innovasystems.com.co
```

Esto significa que alguien había configurado manualmente los settings del Super Admin con datos personalizados de un tenant.

## Solución Implementada

### Script: reset-super-admin-settings.ts
Creado script para resetear los settings del Super Admin a valores por defecto:

```typescript
// Eliminar todos los settings del Super Admin
DELETE FROM app_settings WHERE "tenantId" IS NULL;

// Insertar settings por defecto
INSERT INTO app_settings (key, value, "tenantId")
VALUES
  ('companyName', 'Sistema de Consentimientos', NULL),
  ('primaryColor', '#3B82F6', NULL),
  ('secondaryColor', '#10B981', NULL),
  // ... otros settings por defecto
```

### Valores Por Defecto del Super Admin

#### Logos
- `logoUrl`: `null` (sin logo)
- `footerLogoUrl`: `null` (sin logo)
- `watermarkLogoUrl`: `null` (sin logo)

#### Colores
- `primaryColor`: `#3B82F6` (azul)
- `secondaryColor`: `#10B981` (verde)
- `accentColor`: `#F59E0B` (naranja)
- `textColor`: `#1F2937` (gris oscuro)
- `linkColor`: `#3B82F6` (azul)
- `borderColor`: `#D1D5DB` (gris claro)

#### Información de la Empresa
- `companyName`: `Sistema de Consentimientos`
- `companyAddress`: `` (vacío)
- `companyPhone`: `` (vacío)
- `companyEmail`: `` (vacío)
- `companyWebsite`: `` (vacío)

#### Configuración
- `logoSize`: `60`
- `logoPosition`: `left`
- `watermarkOpacity`: `0.1`
- `footerText`: `` (vacío)

#### Títulos
- `procedureTitle`: `CONSENTIMIENTO DEL PROCEDIMIENTO`
- `dataTreatmentTitle`: `CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES`
- `imageRightsTitle`: `CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES`

## Resultado

### Antes
```json
{
  "logoUrl": "/uploads/logo/logo-1767689715667-506662064.png",
  "watermarkLogoUrl": "/uploads/logo/watermark-1767689737767-838343201.png",
  "companyName": "CONSENTIMIENTOS",
  "companyAddress": "SABANETA",
  "companyPhone": "3134806927"
}
```

### Después
```json
{
  "logoUrl": null,
  "footerLogoUrl": null,
  "watermarkLogoUrl": null,
  "companyName": "Sistema de Consentimientos",
  "companyAddress": "",
  "companyPhone": "",
  "companyEmail": "",
  "companyWebsite": ""
}
```

## Archivos Creados

### Scripts de Diagnóstico y Corrección
1. **check-super-admin-settings.ts**: Verifica los settings del Super Admin y tenants
2. **reset-super-admin-settings.ts**: Resetea los settings del Super Admin a valores por defecto
3. **check-tenant-demo.ts**: Verifica el estado del tenant "demo"

### Documentación
1. **FIX_SUPER_ADMIN_LOGIN_SETTINGS.md**: Este documento

## Cómo Usar los Scripts

### Verificar Settings Actuales
```bash
cd backend
npx ts-node check-super-admin-settings.ts
```

### Resetear Settings del Super Admin
```bash
cd backend
npx ts-node reset-super-admin-settings.ts
```

### Verificar un Tenant Específico
```bash
cd backend
npx ts-node check-tenant-demo.ts
```

## Prevención

### Recomendaciones
1. **No modificar los settings del Super Admin** a menos que sea absolutamente necesario
2. **Cada tenant debe tener sus propios settings** con su `tenantId` correspondiente
3. **El Super Admin debe mantener settings genéricos** sin logos ni información personalizada
4. **Usar la página de Settings** solo cuando estés autenticado como el tenant correcto

### Validación en el Frontend
El frontend debería mostrar claramente en qué contexto estás trabajando:
- **Super Admin**: `admin.localhost:5173` → Settings genéricos
- **Tenant**: `[slug].localhost:5173` → Settings del tenant

## Descubrimiento Adicional

Durante la investigación se encontró que el tenant "demo" fue eliminado (soft delete):
```sql
SELECT * FROM tenants WHERE slug = 'demo';
-- deleted_at: Tue Jan 06 2026 11:11:43 GMT-0500
```

Esto explica por qué al acceder a `demo.localhost` se mostraban los settings del Super Admin (fallback cuando no se encuentra el tenant).

## Estado Actual
✅ **CORREGIDO Y FUNCIONAL**

El login del Super Admin ahora muestra correctamente:
- Sin logos personalizados
- Nombre: "Sistema de Consentimientos"
- Colores por defecto del sistema
- Sin información de contacto personalizada

Los tenants activos mantienen sus settings personalizados correctamente.
