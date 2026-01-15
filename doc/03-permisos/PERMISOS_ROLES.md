# Sistema de Permisos por Roles

## ✅ Implementación Completada

Se ha agregado un sistema de permisos configurable para controlar qué usuarios pueden realizar ciertas acciones, específicamente **eliminar consentimientos**.

---

## 🔐 Permisos Disponibles

### 1. `delete_consents`
- **Descripción:** Permite eliminar consentimientos firmados
- **Uso:** Controla quién puede ver y usar el botón de eliminar en la lista de consentimientos

### 2. `manage_users`
- **Descripción:** Gestionar usuarios del sistema
- **Uso:** Crear, editar y eliminar usuarios

### 3. `manage_branches`
- **Descripción:** Gestionar sedes
- **Uso:** Crear, editar y eliminar sedes

### 4. `manage_services`
- **Descripción:** Gestionar servicios
- **Uso:** Crear, editar y eliminar servicios

---

## 👥 Permisos por Rol (Por Defecto)

### Administrador General
- ✅ `delete_consents`
- ✅ `manage_users`
- ✅ `manage_branches`
- ✅ `manage_services`

### Administrador de Sede
- ✅ `delete_consents`

### Operador
- ❌ Sin permisos especiales
- Solo puede crear consentimientos

---

## 🎯 Funcionalidades

### Backend

#### 1. Guard de Permisos
**Archivo:** `backend/src/auth/guards/permissions.guard.ts`
- Verifica que el usuario tenga los permisos requeridos
- Lanza excepción 403 si no tiene permisos

#### 2. Decorador de Permisos
**Archivo:** `backend/src/auth/decorators/permissions.decorator.ts`
- `@RequirePermissions('permission1', 'permission2')`
- Se usa en los controladores para proteger endpoints

#### 3. Endpoint Protegido
**Archivo:** `backend/src/consents/consents.controller.ts`
```typescript
@Delete(':id')
@UseGuards(PermissionsGuard)
@RequirePermissions('delete_consents')
remove(@Param('id') id: string) {
  return this.consentsService.remove(id);
}
```

#### 4. Gestión de Permisos
**Archivo:** `backend/src/roles/roles.controller.ts`
- `PATCH /api/roles/:id` - Actualizar permisos de un rol
- Requiere permiso `manage_users`

### Frontend

#### 1. Página de Roles y Permisos
**Archivo:** `frontend/src/pages/RolesPage.tsx`
- Interfaz visual para gestionar permisos
- Checkboxes para activar/desactivar permisos
- Solo accesible para usuarios con permiso `manage_users`

#### 2. Control de Visibilidad
**Archivo:** `frontend/src/pages/ConsentsPage.tsx`
- El botón de eliminar solo se muestra si el usuario tiene el permiso `delete_consents`
```typescript
const canDeleteConsents = user?.role?.permissions?.includes('delete_consents') || false;

{canDeleteConsents && (
  <button onClick={() => handleDelete(...)}>
    <Trash2 />
  </button>
)}
```

---

## 🗄️ Base de Datos

### Migración
**Archivo:** `backend/src/database/migrations/1704298000000-AddPermissionsToRoles.ts`

Agrega el campo `permissions` a la tabla `roles`:
- Tipo: `text` (array de strings separados por comas)
- Valores por defecto según el tipo de rol

### Entidad Role
**Archivo:** `backend/src/roles/entities/role.entity.ts`
```typescript
@Column({ type: 'simple-array', default: '' })
permissions: string[];
```

---

## 🎨 Interfaz de Usuario

### Menú de Navegación
Se agregó el enlace "Roles y Permisos" con ícono de escudo (🛡️)

### Página de Roles
- **Tarjetas por rol** con información y permisos actuales
- **Botón "Editar Permisos"** para modificar
- **Checkboxes interactivos** para activar/desactivar permisos
- **Botones Guardar/Cancelar** al editar

### Lista de Consentimientos
- **Botón de eliminar** solo visible para usuarios autorizados
- **Mensaje de error 403** si intenta eliminar sin permisos

---

## 🧪 Cómo Probar

### 1. Acceder como Administrador
1. Login: admin@consentimientos.com / admin123
2. Ir a "Roles y Permisos"
3. Ver que el Administrador General tiene todos los permisos
4. Ir a "Consentimientos"
5. Verificar que el botón de eliminar (🗑️) está visible

### 2. Modificar Permisos
1. En "Roles y Permisos"
2. Click en "Editar Permisos" del rol "Operador"
3. Activar el permiso "Eliminar Consentimientos"
4. Click en "Guardar"
5. Crear un usuario operador y verificar que puede eliminar

### 3. Probar Restricciones
1. Desactivar el permiso `delete_consents` del rol "Operador"
2. Login como operador
3. Ir a "Consentimientos"
4. Verificar que el botón de eliminar NO está visible

### 4. Probar Protección del Backend
1. Intentar hacer DELETE a `/api/consents/:id` sin permisos
2. Debe retornar error 403 Forbidden

---

## 📋 Archivos Creados/Modificados

### Backend (8 archivos)
1. ✅ `backend/src/roles/entities/role.entity.ts` - Campo permissions
2. ✅ `backend/src/roles/dto/update-role.dto.ts` - DTO para actualizar
3. ✅ `backend/src/roles/roles.controller.ts` - Endpoint PATCH
4. ✅ `backend/src/roles/roles.service.ts` - Método update
5. ✅ `backend/src/auth/guards/permissions.guard.ts` - Guard nuevo
6. ✅ `backend/src/auth/decorators/permissions.decorator.ts` - Decorador nuevo
7. ✅ `backend/src/consents/consents.controller.ts` - Protección DELETE
8. ✅ `backend/src/database/migrations/1704298000000-AddPermissionsToRoles.ts`

### Frontend (5 archivos)
1. ✅ `frontend/src/types/index.ts` - Campo permissions en Role
2. ✅ `frontend/src/pages/RolesPage.tsx` - Página nueva
3. ✅ `frontend/src/pages/ConsentsPage.tsx` - Control de visibilidad
4. ✅ `frontend/src/App.tsx` - Ruta /roles
5. ✅ `frontend/src/components/Layout.tsx` - Enlace en menú

---

## 🔄 Migración de Datos

Al ejecutar la migración, los roles existentes recibirán automáticamente estos permisos:

```sql
-- Administrador General
UPDATE roles SET permissions = 'delete_consents,manage_users,manage_branches,manage_services' 
WHERE type = 'ADMIN_GENERAL';

-- Administrador de Sede
UPDATE roles SET permissions = 'delete_consents' 
WHERE type = 'ADMIN_SEDE';

-- Operador
UPDATE roles SET permissions = '' 
WHERE type = 'OPERADOR';
```

---

## ✅ Sistema Listo

El sistema de permisos está completamente funcional:

- ✅ Backend protegido con guards
- ✅ Frontend con control de visibilidad
- ✅ Interfaz para gestionar permisos
- ✅ Migración de base de datos
- ✅ Permisos por defecto configurados

**Accede a la gestión de permisos en:** http://localhost:5173/roles
