# Sistema de Permisos Mejorado

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ Implementado y funcional

---

## 🎯 Objetivo

Implementar un sistema de permisos robusto, eficiente y basado en mejores prácticas que permita controlar el acceso a las funcionalidades del sistema según el rol del usuario.

---

## 🏗️ Arquitectura del Sistema

### 1. Definición Centralizada de Permisos

**Archivo:** `backend/src/auth/constants/permissions.ts`

Este archivo centraliza todos los permisos del sistema, evitando errores de tipeo y facilitando el mantenimiento.

```typescript
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_GLOBAL_STATS: 'view_global_stats',

  // Consentimientos
  VIEW_CONSENTS: 'view_consents',
  CREATE_CONSENTS: 'create_consents',
  EDIT_CONSENTS: 'edit_consents',
  DELETE_CONSENTS: 'delete_consents',
  SIGN_CONSENTS: 'sign_consents',
  RESEND_CONSENT_EMAIL: 'resend_consent_email',

  // ... más permisos
} as const;
```

### 2. Permisos por Rol

El archivo también define qué permisos tiene cada rol por defecto:

```typescript
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [...],
  ADMIN_GENERAL: [...],
  ADMIN_SEDE: [...],
  OPERADOR: [...],
} as const;
```

### 3. Guard de Permisos Mejorado

**Archivo:** `backend/src/auth/guards/permissions.guard.ts`

El guard valida que el usuario tenga al menos uno de los permisos requeridos:

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  canActivate(context: ExecutionContext): boolean {
    // Obtener permisos requeridos
    // Validar usuario autenticado
    // Verificar permisos
    // Logging para debugging
  }
}
```

**Características:**
- ✅ Logging detallado para debugging
- ✅ Mensajes de error claros
- ✅ Validación de usuario y rol
- ✅ Soporte para múltiples permisos (OR logic)

---

## 📋 Permisos Disponibles

### Dashboard
- `view_dashboard` - Ver dashboard y estadísticas
- `view_global_stats` - Ver estadísticas globales del sistema (Solo Super Admin)

### Consentimientos
- `view_consents` - Ver consentimientos
- `create_consents` - Crear consentimientos
- `edit_consents` - Editar consentimientos
- `delete_consents` - Eliminar consentimientos
- `sign_consents` - Firmar consentimientos
- `resend_consent_email` - Reenviar email de consentimiento

### Usuarios
- `view_users` - Ver usuarios
- `create_users` - Crear usuarios
- `edit_users` - Editar usuarios
- `delete_users` - Eliminar usuarios
- `change_passwords` - Cambiar contraseñas

### Roles
- `view_roles` - Ver roles
- `edit_roles` - Editar permisos de roles

### Sedes
- `view_branches` - Ver sedes
- `create_branches` - Crear sedes
- `edit_branches` - Editar sedes
- `delete_branches` - Eliminar sedes

### Servicios
- `view_services` - Ver servicios
- `create_services` - Crear servicios
- `edit_services` - Editar servicios
- `delete_services` - Eliminar servicios

### Preguntas
- `view_questions` - Ver preguntas
- `create_questions` - Crear preguntas
- `edit_questions` - Editar preguntas
- `delete_questions` - Eliminar preguntas

### Configuración
- `view_settings` - Ver configuración
- `edit_settings` - Editar configuración

### Tenants
- `manage_tenants` - Gestionar tenants (Solo Super Admin)

---

## 👥 Permisos por Rol

### Super Administrador
**Acceso:** Total al sistema multi-tenant

**Permisos:**
- ✅ Todos los permisos del sistema
- ✅ Gestión de tenants
- ✅ Estadísticas globales

### Administrador General
**Acceso:** Completo dentro de su tenant

**Permisos:**
- ✅ Dashboard y estadísticas del tenant
- ✅ CRUD completo de consentimientos
- ✅ CRUD completo de usuarios
- ✅ Gestión de roles y permisos
- ✅ CRUD completo de sedes
- ✅ CRUD completo de servicios
- ✅ CRUD completo de preguntas
- ✅ Configuración del tenant

**Restricciones:**
- ❌ No puede gestionar tenants
- ❌ No puede ver estadísticas globales
- ❌ No puede ver/editar el rol Super Admin

### Administrador de Sede
**Acceso:** Gestión de su sede

**Permisos:**
- ✅ Dashboard y estadísticas
- ✅ Ver, crear, editar y eliminar consentimientos
- ✅ Firmar consentimientos
- ✅ Reenviar emails
- ✅ Ver usuarios
- ✅ Crear y editar usuarios
- ✅ Ver sedes
- ✅ Ver servicios
- ✅ Ver preguntas
- ✅ Ver configuración

**Restricciones:**
- ❌ No puede eliminar usuarios
- ❌ No puede cambiar contraseñas
- ❌ No puede gestionar roles
- ❌ No puede crear/editar/eliminar sedes
- ❌ No puede crear/editar/eliminar servicios
- ❌ No puede crear/editar/eliminar preguntas
- ❌ No puede editar configuración

### Operador
**Acceso:** Crear consentimientos

**Permisos:**
- ✅ Dashboard básico
- ✅ Ver consentimientos
- ✅ Crear consentimientos
- ✅ Firmar consentimientos

**Restricciones:**
- ❌ No puede editar consentimientos
- ❌ No puede eliminar consentimientos
- ❌ No puede gestionar usuarios
- ❌ No puede gestionar sedes
- ❌ No puede gestionar servicios
- ❌ No puede gestionar preguntas
- ❌ No puede ver/editar configuración

---

## 🔧 Uso en Controladores

### Ejemplo Básico

```typescript
import { PERMISSIONS } from '../auth/constants/permissions';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_SERVICES)
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: User) {
    // Solo usuarios con permiso 'create_services' pueden acceder
  }
}
```

### Múltiples Permisos (OR Logic)

```typescript
@Get()
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS)
findAll() {
  // Usuario necesita VIEW_USERS O EDIT_USERS
}
```

### Sin Permisos (Solo Autenticación)

```typescript
@Get()
findAll(@CurrentUser() user: User) {
  // Solo requiere estar autenticado
  // No requiere permisos específicos
}
```

---

## 🛡️ Seguridad Multi-Tenant

### Aislamiento por Tenant

Todos los controladores implementan aislamiento automático:

```typescript
@Get()
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_USERS)
findAll(@CurrentUser() user: User) {
  const tenantId = user.tenant?.id;
  // Solo retorna usuarios del mismo tenant
  return this.usersService.findAll(tenantId);
}
```

### Protección del Super Admin

Los usuarios de tenant NO pueden:
- Ver el rol Super Admin
- Editar el rol Super Admin
- Ver usuarios Super Admin
- Acceder a funciones de gestión de tenants

---

## 📊 Endpoint de Permisos

### GET /api/roles/permissions

Retorna todos los permisos disponibles con sus descripciones y categorías.

**Requiere:** `view_roles`

**Respuesta:**
```json
{
  "permissions": [
    "view_dashboard",
    "view_consents",
    "create_consents",
    ...
  ],
  "descriptions": {
    "view_dashboard": "Ver dashboard y estadísticas",
    "view_consents": "Ver consentimientos",
    ...
  },
  "categories": {
    "dashboard": {
      "name": "Dashboard",
      "permissions": ["view_dashboard", "view_global_stats"]
    },
    "consents": {
      "name": "Consentimientos",
      "permissions": ["view_consents", "create_consents", ...]
    },
    ...
  }
}
```

---

## 🔄 Actualización de Permisos

### Modificar Permisos de un Rol

**Endpoint:** `PATCH /api/roles/:id`

**Requiere:** `edit_roles`

**Body:**
```json
{
  "permissions": [
    "view_dashboard",
    "view_consents",
    "create_consents"
  ]
}
```

**Restricciones:**
- Usuarios de tenant NO pueden editar el rol Super Admin
- Los permisos deben existir en el sistema

---

## 📝 Logging y Debugging

### Logs del Guard

El `PermissionsGuard` genera logs detallados:

```
[PermissionsGuard] Usuario operador1@demo-medico.com (Operador) intentó acceder sin permisos.
Requeridos: [delete_consents], Tiene: [view_dashboard, view_consents, create_consents, sign_consents]
```

### Logs en Desarrollo

En modo desarrollo, el guard registra accesos exitosos:

```
[PermissionsGuard] Usuario admin@demo-medico.com accedió con permiso: create_users
```

---

## ✅ Mejores Prácticas Implementadas

### 1. Constantes Centralizadas
- ✅ Evita errores de tipeo
- ✅ Facilita refactoring
- ✅ Autocompletado en IDE

### 2. Separación de Responsabilidades
- ✅ Guard solo valida permisos
- ✅ Controladores manejan lógica de negocio
- ✅ Servicios manejan acceso a datos

### 3. Logging Detallado
- ✅ Facilita debugging
- ✅ Auditoría de accesos
- ✅ Detección de intentos no autorizados

### 4. Mensajes de Error Claros
- ✅ Usuario sabe qué permiso necesita
- ✅ Facilita soporte técnico
- ✅ Mejora experiencia de usuario

### 5. Aislamiento Multi-Tenant
- ✅ Cada tenant ve solo sus datos
- ✅ Super Admin protegido
- ✅ Validación en cada endpoint

### 6. Flexibilidad
- ✅ Permisos editables por rol
- ✅ Fácil agregar nuevos permisos
- ✅ Soporte para lógica OR

---

## 🧪 Testing

### Verificar Permisos de un Usuario

1. Login con el usuario
2. Intentar acceder a un endpoint protegido
3. Verificar respuesta:
   - ✅ 200: Tiene permiso
   - ❌ 403: No tiene permiso (mensaje indica qué permiso necesita)

### Verificar Aislamiento Multi-Tenant

1. Login como usuario de tenant A
2. Intentar acceder a datos de tenant B
3. Verificar que NO puede ver/editar datos de otro tenant

### Verificar Protección Super Admin

1. Login como Admin General de un tenant
2. Intentar ver/editar rol Super Admin
3. Verificar que NO puede acceder

---

## 📚 Archivos Modificados

### Backend

1. **`backend/src/auth/constants/permissions.ts`** (NUEVO)
   - Definición centralizada de permisos
   - Permisos por rol
   - Descripciones y categorías

2. **`backend/src/auth/guards/permissions.guard.ts`** (MEJORADO)
   - Logging detallado
   - Validaciones robustas
   - Mensajes de error claros

3. **Controladores Actualizados:**
   - `backend/src/users/users.controller.ts`
   - `backend/src/roles/roles.controller.ts`
   - `backend/src/branches/branches.controller.ts`
   - `backend/src/services/services.controller.ts`
   - `backend/src/questions/questions.controller.ts`
   - `backend/src/consents/consents.controller.ts`
   - `backend/src/tenants/tenants.controller.ts`
   - `backend/src/settings/settings.controller.ts`

4. **Servicios Actualizados:**
   - `backend/src/questions/questions.service.ts` (Agregado filtrado por tenant)

5. **`backend/src/database/seed.ts`** (ACTUALIZADO)
   - Usa constantes de permisos
   - Permisos actualizados por rol

---

## 🚀 Próximos Pasos

### Frontend

1. **Componente de Gestión de Permisos**
   - Interfaz para editar permisos por rol
   - Vista de permisos por categoría
   - Checkboxes para activar/desactivar permisos

2. **Protección de Rutas**
   - Ocultar opciones de menú según permisos
   - Deshabilitar botones sin permisos
   - Redireccionar si no tiene acceso

3. **Indicadores Visuales**
   - Mostrar permisos del usuario actual
   - Badges de rol
   - Tooltips explicativos

### Backend

1. **Auditoría**
   - Registrar todos los accesos
   - Tabla de logs de permisos
   - Reportes de accesos denegados

2. **Permisos Personalizados**
   - Permitir crear permisos custom
   - Asignar permisos a usuarios individuales
   - Grupos de permisos

3. **Caché de Permisos**
   - Cachear permisos del usuario
   - Invalidar caché al cambiar rol
   - Mejorar rendimiento

---

## 📖 Documentación para Usuarios

### Para Administradores

**Gestionar Permisos:**
1. Ir a "Roles y Permisos"
2. Seleccionar un rol
3. Marcar/desmarcar permisos
4. Guardar cambios

**Nota:** Los cambios aplican inmediatamente a todos los usuarios con ese rol.

### Para Desarrolladores

**Agregar Nuevo Permiso:**
1. Agregar constante en `permissions.ts`
2. Agregar descripción en `PERMISSION_DESCRIPTIONS`
3. Agregar a categoría en `PERMISSION_CATEGORIES`
4. Agregar a roles correspondientes en `ROLE_PERMISSIONS`
5. Usar en controlador con `@RequirePermissions(PERMISSIONS.NUEVO_PERMISO)`

---

**Desarrollado por:** Kiro AI  
**Fecha:** 6 de enero de 2026  
**Versión:** 1.0
