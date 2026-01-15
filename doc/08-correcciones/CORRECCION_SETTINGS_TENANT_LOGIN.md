# Corrección: Settings por Tenant en Página de Login

## Problema Identificado

Cuando un usuario accedía a la URL de un tenant (ej: `http://demo-medico.localhost:5173/login`), la página de login mostraba los settings del Super Admin en lugar de los settings del tenant correspondiente.

**Síntomas:**
- El nombre de la empresa mostrado era "CONSENTIMIENTOS" (Super Admin) en lugar del nombre del tenant
- Los colores y logos eran los del Super Admin
- No se respetaba la personalización por tenant en la página de login

## Causa Raíz

El endpoint público `/api/settings/public` no estaba detectando el subdominio del request. Siempre retornaba los settings del Super Admin (`tenantId = undefined`) sin importar desde qué URL se accediera.

## Solución Implementada

### 1. Modificación del Controller de Settings

**Archivo:** `backend/src/settings/settings.controller.ts`

Se modificó el método `getPublicSettings()` para:
- Recibir el objeto `Request` completo usando `@Req() req: Request`
- Extraer el `tenantSlug` del request (inyectado por `TenantMiddleware`)
- Buscar el tenant correspondiente usando `TenantsService.findBySlug()`
- Retornar los settings del tenant encontrado, o del Super Admin si no hay slug

```typescript
@Get('public')
async getPublicSettings(@Req() req: Request) {
  const tenantSlug = req['tenantSlug']; // Extraído por TenantMiddleware
  
  console.log('[SettingsController] GET /settings/public');
  console.log('[SettingsController] Tenant Slug:', tenantSlug || 'Super Admin');
  
  let tenantId: string | undefined = undefined;
  
  if (tenantSlug) {
    try {
      const tenant = await this.tenantsService.findBySlug(tenantSlug);
      tenantId = tenant.id;
      console.log('[SettingsController] Tenant encontrado:', tenant.name, '(', tenant.id, ')');
    } catch (error) {
      console.log('[SettingsController] Tenant no encontrado, usando Super Admin');
    }
  }
  
  return this.settingsService.getSettings(tenantId);
}
```

### 2. Resolución de Dependencias Circulares

**Archivos modificados:**
- `backend/src/settings/settings.module.ts`
- `backend/src/tenants/tenants.module.ts`

Se agregó `forwardRef()` en ambos módulos para resolver la dependencia circular:

```typescript
// settings.module.ts
imports: [
  TypeOrmModule.forFeature([AppSettings]),
  forwardRef(() => TenantsModule),
],

// tenants.module.ts
imports: [
  TypeOrmModule.forFeature([Tenant, User, Role]),
  forwardRef(() => SettingsModule),
],
```

### 3. Mejoras en el Frontend

**Archivo:** `frontend/src/contexts/ThemeContext.tsx`

- Creada instancia separada de axios (`settingsApi`) que NO redirige en errores 401
- Mejorado el manejo de errores para evitar propagación innecesaria
- Verificación de token antes de intentar cargar settings autenticados
- Fallback automático a settings públicos si falla la autenticación

## Cómo Funciona

### Flujo de Detección de Tenant

1. **Usuario accede a:** `http://demo-medico.localhost:5173/login`
2. **Frontend hace petición a:** `http://localhost:3000/api/settings/public`
3. **TenantMiddleware detecta:** Header `Host: demo-medico.localhost:3000`
4. **Middleware extrae:** `tenantSlug = "demo-medico"`
5. **Controller busca:** Tenant con slug "demo-medico"
6. **Service retorna:** Settings del tenant encontrado
7. **Frontend muestra:** Nombre, colores y logos del tenant

### Casos de Uso

| URL de Acceso | Tenant Slug Detectado | Settings Retornados |
|---------------|----------------------|---------------------|
| `localhost:5173` | `null` | Super Admin |
| `admin.localhost:5173` | `null` | Super Admin |
| `demo-medico.localhost:5173` | `demo-medico` | Tenant "Demo Consultorio Medico" |
| `otro-tenant.localhost:5173` | `otro-tenant` | Tenant correspondiente |

## Verificación

### 1. Verificar Logs del Backend

Al acceder a diferentes URLs, el backend debe mostrar:

```bash
# Acceso a localhost
[TenantMiddleware] Host: localhost:3000 -> Tenant Slug: null (Super Admin)
[SettingsController] Tenant Slug: Super Admin
[SettingsService] Retornando companyName: CONSENTIMIENTOS

# Acceso a demo-medico.localhost
[TenantMiddleware] Host: demo-medico.localhost:3000 -> Tenant Slug: demo-medico
[SettingsController] Tenant encontrado: Demo Consultorio Medico
[SettingsService] Retornando companyName: Demo Consultorio Medico
```

### 2. Verificar en el Navegador

1. Acceder a `http://localhost:5173/login`
   - Debe mostrar: "CONSENTIMIENTOS" (Super Admin)

2. Acceder a `http://admin.localhost:5173/login`
   - Debe mostrar: "CONSENTIMIENTOS" (Super Admin)

3. Acceder a `http://demo-medico.localhost:5173/login`
   - Debe mostrar: "Demo Consultorio Medico" (Tenant)

### 3. Script de Verificación

Ejecutar el script para verificar settings en la base de datos:

```bash
cd backend
npx ts-node check-tenant-settings.ts
```

Debe mostrar:
- Settings del tenant "demo-medico" (5 registros)
- Settings del Super Admin (45 registros)

## Archivos Modificados

1. `backend/src/settings/settings.controller.ts` - Detección de tenant en endpoint público
2. `backend/src/settings/settings.module.ts` - forwardRef para TenantsModule
3. `backend/src/tenants/tenants.module.ts` - forwardRef para SettingsModule
4. `frontend/src/contexts/ThemeContext.tsx` - Instancia axios separada y mejor manejo de errores
5. `backend/check-tenant-settings.ts` - Actualizado para verificar tenant "demo-medico"

## Mejores Prácticas Aplicadas

1. **Separación de Concerns:** Endpoint público separado del autenticado
2. **Detección Automática:** El middleware inyecta el tenantSlug sin intervención manual
3. **Fallback Seguro:** Si no se encuentra el tenant, usa settings del Super Admin
4. **Logs Detallados:** Facilita debugging y verificación del comportamiento
5. **Manejo de Errores:** No propaga errores 401 innecesariamente al usuario
6. **Resolución de Dependencias:** Uso correcto de forwardRef() para dependencias circulares

## Estado Final

✅ **FUNCIONANDO CORRECTAMENTE**

- Los tenants ven sus propios settings en la página de login
- El Super Admin ve sus settings en localhost o admin.localhost
- La detección de subdominio funciona automáticamente
- No hay errores en consola del navegador
- Los logs del backend confirman el comportamiento correcto

## Fecha de Corrección

6 de enero de 2026
