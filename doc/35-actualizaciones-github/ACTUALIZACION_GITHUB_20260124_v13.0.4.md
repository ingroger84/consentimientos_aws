# Actualización GitHub - Versión 13.0.4
**Fecha**: 2026-01-24

## Cambios Implementados

### 1. Sistema de Sesión Única - Corrección de Endpoints Bloqueados (v13.0.0)
**Problema**: El `SessionGuard` bloqueaba los endpoints de autenticación, impidiendo el login.

**Solución**:
- Agregado decorador `@SkipSessionCheck()` a endpoints de autenticación
- Endpoints modificados: `/auth/login`, `/auth/validate`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/magic-login/:token`, `/auth/version`

**Archivos modificados**:
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/decorators/skip-session-check.decorator.ts`
- `backend/src/auth/guards/session.guard.ts`

### 2. Corrección de Login - Token No Se Guardaba (v13.0.2)
**Problema**: Después del login exitoso, el token JWT no se guardaba en localStorage.

**Solución**:
- Agregado código para guardar explícitamente token y usuario en localStorage después del login
- `localStorage.setItem('token', response.access_token)`
- `localStorage.setItem('user', JSON.stringify(response.user))`

**Archivos modificados**:
- `frontend/src/pages/LoginPage.tsx`

### 3. Limpieza de localStorage al Cambiar de Subdominio (v13.0.3)
**Problema**: El localStorage es compartido entre subdominios, causando conflictos de sesión.

**Solución**:
- Agregada lógica en `App.tsx` para detectar cambio de subdominio
- Limpia automáticamente token/user si el subdominio cambia
- Guarda el subdominio actual en `localStorage.getItem('current_subdomain')`

**Archivos modificados**:
- `frontend/src/App.tsx`

### 4. Eliminación de Plantillas Duplicadas (v13.0.4)
**Problema**: Había 4 plantillas duplicadas de cada tipo (12 plantillas en total).

**Solución**:
- Ejecutados scripts SQL para eliminar duplicados
- Eliminadas 9 plantillas duplicadas, quedando solo 3 (una de cada tipo)
- Modificado `ConsentTemplatesPage.tsx` para permitir eliminar plantillas predeterminadas

**Archivos modificados**:
- `frontend/src/pages/ConsentTemplatesPage.tsx`
- `backend/delete-duplicate-templates.sql` (ejecutado)
- `backend/delete-data-treatment-duplicates.sql` (ejecutado)

### 5. Verificación Periódica de Sesión (v13.0.4)
**Problema**: El sistema cierra la sesión anterior en el backend, pero el frontend no detecta que fue cerrado hasta hacer una petición.

**Solución**:
- Creado hook `useSessionCheck.ts` que verifica cada 30 segundos si la sesión sigue activa
- Hook agregado al `Layout.tsx` para ejecutarse en todas las páginas protegidas
- Hook llama a `/auth/validate` periódicamente y detecta error 401 para cerrar sesión local
- Muestra alerta al usuario cuando su sesión fue cerrada en otro dispositivo

**Archivos creados**:
- `frontend/src/hooks/useSessionCheck.ts`

**Archivos modificados**:
- `frontend/src/components/Layout.tsx`

## Estado de Plantillas por Tenant
Las plantillas ya están correctamente implementadas con filtrado por tenant:
- El servicio `consent-templates.service.ts` filtra automáticamente por `tenantId`
- Cada tenant tiene sus propias plantillas
- Las plantillas actuales tienen `tenantId` asignado (no son null)

## Versión Actual
**Backend**: 13.0.0  
**Frontend**: 13.0.4

## Estado del Despliegue
✅ Backend desplegado en producción  
✅ Frontend desplegado en ambas ubicaciones:
  - `/var/www/html/` (dominio principal)
  - `/home/ubuntu/consentimientos_aws/frontend/dist/` (subdominios)

## Próximos Pasos
1. Probar el sistema de sesión única con dos navegadores/pestañas diferentes
2. Verificar que después de 30 segundos, la sesión anterior se cierre automáticamente
3. Confirmar que las plantillas se muestran correctamente agrupadas por tenant
