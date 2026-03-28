# Despliegue V75.3 - Corrección Carga Infinita en Página de Cuenta Suspendida

**Fecha:** 26 de marzo de 2026  
**Versión:** 75.3  
**Tipo:** Corrección crítica (hotfix)

## 🐛 PROBLEMA IDENTIFICADO

La página de cuenta suspendida (`/suspended`) se quedaba cargando infinitamente cuando un usuario de un tenant suspendido intentaba acceder. El problema persistía en múltiples equipos (cache descartado).

### Causa Raíz

Había DOS problemas:

1. **TenantGuard bloqueando endpoints:** El `TenantGuard` estaba bloqueando TODAS las peticiones de usuarios con tenant suspendido, incluyendo el endpoint de facturas necesario para mostrar las facturas pendientes.

2. **Endpoint de tenant bloqueado:** El endpoint `GET /tenants/:id` requería el permiso `MANAGE_TENANTS` (solo Super Admin), por lo que usuarios de tenant suspendido no podían ver su propio tenant para verificar el tipo de cuenta.

**Flujo del problema:**
1. Usuario con tenant suspendido accede a `/suspended`
2. La página intenta cargar:
   - Tipo de cuenta con `GET /tenants/:id` → FALLA (403 - sin permisos)
   - Facturas con `GET /invoices/tenant/:tenantId` → FALLA (403 - tenant suspendido)
3. El interceptor de Axios detecta el 403 y redirige a `/suspended` (donde ya está)
4. Se queda cargando infinitamente esperando las respuestas

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Endpoints de Facturas

Agregado el decorador `@AllowAnyTenant()` a los endpoints críticos que deben funcionar incluso con tenant suspendido:

**Archivo:** `backend/src/invoices/invoices.controller.ts`

- ✅ Agregado import del decorador `AllowAnyTenant`
- ✅ Agregado `@AllowAnyTenant()` al método `findByTenant()` (GET /invoices/tenant/:tenantId)
- ✅ Agregado `@AllowAnyTenant()` al método `createPaymentLink()` (POST /invoices/:id/create-payment-link)

```typescript
// Import agregado
import { AllowAnyTenant } from '../common/decorators/allow-any-tenant.decorator';

// Endpoints modificados
@Get('tenant/:tenantId')
@AllowAnyTenant()  // ← NUEVO
async findByTenant(@Request() req, @Param('tenantId') tenantId: string) {
  // ... código existente
}

@Post(':id/create-payment-link')
@AllowAnyTenant()  // ← NUEVO
async createPaymentLink(@Request() req, @Param('id') id: string) {
  // ... código existente
}
```

### 2. Endpoint de Tenant

Modificado el endpoint `GET /tenants/:id` para permitir que usuarios vean su propio tenant:

**Archivo:** `backend/src/tenants/tenants.controller.ts`

- ✅ Agregado import del decorador `AllowAnyTenant`
- ✅ Agregado import de `Request` de `@nestjs/common`
- ✅ Modificado método `findOne()` para permitir acceso al propio tenant
- ✅ Agregado `@AllowAnyTenant()` para bypasear validación de estado

```typescript
// Imports agregados
import { Request } from '@nestjs/common';
import { AllowAnyTenant } from '../common/decorators/allow-any-tenant.decorator';

// Método modificado
@Get(':id')
@AllowAnyTenant()  // ← NUEVO
async findOne(@Param('id') id: string, @Request() req) {
  // Permitir que usuarios vean su propio tenant (incluso si está suspendido)
  // o que el Super Admin vea cualquier tenant
  const user = req.user;
  const isSuperAdmin = user?.permissions?.includes(PERMISSIONS.MANAGE_TENANTS);
  const isOwnTenant = user?.tenant?.id === id;

  if (!isSuperAdmin && !isOwnTenant) {
    throw new Error('No tienes permisos para ver este tenant');
  }

  return this.tenantsService.findOne(id);
}
```

### Qué hace `@AllowAnyTenant()`

Este decorador permite que el endpoint sea accesible incluso cuando el tenant está suspendido o expirado, bypaseando la validación del `TenantGuard`. Los permisos de usuario se siguen validando manualmente dentro del método.

## 📦 DESPLIEGUE

### Backend

```powershell
# 1. Compilar
cd backend
npm run build

# 2. Desplegar archivos modificados
scp -i AWS-ISSABEL.pem backend/dist/tenants/tenants.controller.js* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/tenants/
scp -i AWS-ISSABEL.pem backend/dist/invoices/invoices.controller.js* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/invoices/

# 3. Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

**Estado:** ✅ Desplegado exitosamente

## 🧪 VERIFICACIÓN

### Script de Prueba

Creado `backend/test-suspended-tenant-invoices.js` para verificar el funcionamiento:

```bash
node backend/test-suspended-tenant-invoices.js
```

### Prueba Manual

1. Acceder a: https://demo-medico.archivoenlinea.com
2. Login con: proyectos@innovasystems.com.co
3. Verificar que la página `/suspended` carga correctamente
4. Verificar que se muestran las facturas pendientes
5. Verificar que el botón "Pagar Ahora" funciona

## 📊 IMPACTO

- ✅ Usuarios de tenants suspendidos pueden ver sus facturas pendientes
- ✅ Usuarios de tenants suspendidos pueden generar links de pago
- ✅ La página de cuenta suspendida carga correctamente
- ✅ El flujo de pago automático funciona desde cuentas suspendidas
- ✅ No afecta la seguridad: los permisos se validan manualmente en cada método

## 🔍 ENDPOINTS AFECTADOS

| Endpoint | Método | Cambio | Razón |
|----------|--------|--------|-------|
| `/invoices/tenant/:tenantId` | GET | Agregado `@AllowAnyTenant()` | Permitir ver facturas desde tenant suspendido |
| `/invoices/:id/create-payment-link` | POST | Agregado `@AllowAnyTenant()` | Permitir generar link de pago desde tenant suspendido |
| `/tenants/:id` | GET | Agregado `@AllowAnyTenant()` + validación manual | Permitir ver propio tenant desde cuenta suspendida |

## 📝 NOTAS TÉCNICAS

- El decorador `@AllowAnyTenant()` solo bypasea el `TenantGuard`
- Los guards `JwtAuthGuard` y `RolesGuard` siguen activos
- La validación de permisos se hace manualmente dentro de cada método
- Los usuarios solo pueden ver/pagar sus propias facturas (validación por `userTenantId`)

## ✅ RESULTADO

La página de cuenta suspendida ahora carga correctamente y muestra las facturas pendientes, permitiendo a los usuarios realizar el pago y reactivar su cuenta automáticamente.
