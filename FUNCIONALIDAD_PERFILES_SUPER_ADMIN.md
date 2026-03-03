# Funcionalidad de Perfiles para Super Administrador

**Fecha:** 2026-03-02  
**Estado:** ✅ COMPLETADO

---

## Resumen

El Super Administrador tiene acceso completo al sistema de perfiles y permisos, con capacidad para crear, editar y eliminar perfiles personalizados.

---

## Permisos del Super Administrador

### Perfil Asignado
```json
{
  "id": "17552f97-e79c-4bd2-9171-cf39fa79c60f",
  "name": "Super Administrador",
  "description": "Acceso completo a todas las funciones del sistema",
  "permissions": [
    {
      "module": "*",
      "actions": ["*"]
    }
  ]
}
```

### Interpretación de Permisos
- `module: "*"` = Todos los módulos del sistema
- `actions: ["*"]` = Todas las acciones disponibles

Esto significa que el Super Administrador tiene acceso completo a:
- ✅ Ver perfiles (`profiles:view`)
- ✅ Crear perfiles (`profiles:create`)
- ✅ Editar perfiles (`profiles:edit`)
- ✅ Eliminar perfiles (`profiles:delete`)
- ✅ Asignar perfiles (`profiles:assign`)
- ✅ Y todos los demás módulos y acciones del sistema

---

## Funcionalidades Disponibles

### 1. Ver Perfiles
**Ubicación:** `/profiles`

**Características:**
- Lista de todos los perfiles del sistema
- Filtros por tipo:
  - Todos
  - Sistema (perfiles predefinidos)
  - Personalizados (creados por usuarios)
- Información mostrada:
  - Nombre del perfil
  - Descripción
  - Etiqueta "Sistema" si es un perfil predefinido
  - Cantidad de permisos
  - Cantidad de usuarios asignados
- Botones de acción:
  - "Ver detalles" - Disponible para todos los perfiles
  - "Editar" - Solo para perfiles personalizados
  - "Eliminar" - Solo para perfiles personalizados

### 2. Crear Perfil
**Ubicación:** `/profiles/new`

**Características:**
- Botón "Crear perfil" en la esquina superior derecha
- Formulario para crear un nuevo perfil personalizado
- Campos:
  - Nombre del perfil
  - Descripción
  - Selector de permisos por módulo y acción
  - Estado activo/inactivo
- Validaciones:
  - Solo Super Admins pueden crear perfiles con permisos globales (*)
  - Solo Super Admins pueden asignar permisos del módulo `super_admin`
  - Solo Super Admins pueden asignar permisos de `create/delete` en módulo `profiles`

### 3. Editar Perfil
**Ubicación:** `/profiles/:id/edit`

**Características:**
- Accesible desde el botón "Editar" en cada tarjeta de perfil
- Solo disponible para perfiles personalizados (`isSystem: false`)
- Los perfiles del sistema están protegidos y no se pueden editar
- Formulario similar al de creación
- Mismas validaciones de seguridad

### 4. Eliminar Perfil
**Acción:** Botón "Eliminar" en cada tarjeta de perfil

**Características:**
- Solo disponible para perfiles personalizados
- Los perfiles del sistema están protegidos
- Confirmación antes de eliminar
- Validación de que no haya usuarios asignados al perfil

### 5. Ver Detalles del Perfil
**Ubicación:** `/profiles/:id`

**Características:**
- Información completa del perfil
- Tabs:
  - **Permisos:** Lista detallada de todos los permisos
  - **Usuarios:** Lista de usuarios con este perfil asignado
  - **Auditoría:** Historial de cambios en el perfil
- Botones de acción según permisos

---

## Perfiles del Sistema

Los siguientes perfiles vienen predefinidos y NO se pueden editar ni eliminar:

### 1. Super Administrador
- **Permisos:** `*:*` (Acceso completo)
- **Descripción:** Acceso completo a todas las funciones del sistema
- **Usuarios:** Super admins del sistema

### 2. Administrador General
- **Permisos:** Mayoría de funciones excepto:
  - Módulo `super_admin`
  - `create/edit/delete` en módulo `profiles`
- **Descripción:** Administrador con acceso a la mayoría de funciones
- **Usuarios:** Administradores de tenants

### 3. Administrador de Sede
- **Permisos:** Limitados a su sede
- **Descripción:** Administrador con acceso limitado a su sede
- **Usuarios:** Administradores de sedes específicas

### 4. Operador
- **Permisos:** Permisos básicos de operación
- **Descripción:** Usuario operativo con permisos básicos
- **Usuarios:** Operadores del sistema

### 5. Solo Lectura
- **Permisos:** Solo `view` en módulos permitidos
- **Descripción:** Usuario con permisos de solo lectura
- **Usuarios:** Usuarios de consulta

---

## Protecciones de Seguridad

### 1. Perfiles del Sistema
- **Protección:** No se pueden editar ni eliminar
- **Razón:** Mantener la integridad del sistema
- **Identificación:** Campo `isSystem: true`

### 2. Permisos Restringidos
Solo Super Admins pueden:
- Crear perfiles con permisos globales (`*:*`)
- Asignar permisos del módulo `super_admin`
- Asignar permisos de `create/delete` en módulo `profiles`

### 3. Validación en Backend
El servicio `ProfilesService` valida:
```typescript
// Solo super admins pueden crear perfiles con permisos globales
if (hasGlobalPermissions && !isSuperAdmin) {
  throw new ForbiddenException(
    'Solo los super administradores pueden crear perfiles con permisos globales'
  );
}

// Solo super admins pueden asignar permisos de super_admin
if (hasSuperAdminPermissions && !isSuperAdmin) {
  throw new ForbiddenException(
    'Solo los super administradores pueden asignar permisos de super_admin'
  );
}

// Solo super admins pueden asignar permisos de create/delete en profiles
if (hasProfilesManagementPermissions && !isSuperAdmin) {
  throw new ForbiddenException(
    'Solo los super administradores pueden asignar permisos de gestión de perfiles'
  );
}
```

### 4. Validación de Permisos
El guard `PermissionsGuard` verifica:
```typescript
// Verificar múltiples variantes de super admin
if (
  user.role?.name === 'super_admin' ||
  user.role?.name === 'Super Administrador' ||
  user.profile?.name === 'Super Administrador'
) {
  return true; // Acceso completo
}

// Verificar permisos específicos del perfil
return user.profile.hasPermission(moduleCode, action);
```

---

## Flujo de Trabajo

### Crear un Nuevo Perfil Personalizado

1. **Acceder a la página de perfiles**
   - Navegar a "Roles y Permisos" en el menú lateral
   - O acceder directamente a `/profiles`

2. **Hacer clic en "Crear perfil"**
   - Botón azul en la esquina superior derecha

3. **Completar el formulario**
   - Nombre: Ej. "Gerente de Ventas"
   - Descripción: Ej. "Acceso a módulos de ventas y clientes"
   - Seleccionar permisos:
     - Por módulo (clientes, ventas, reportes, etc.)
     - Por acción (view, create, edit, delete, etc.)
   - Estado: Activo/Inactivo

4. **Guardar el perfil**
   - El perfil se crea con `isSystem: false`
   - Aparece en la lista de perfiles personalizados

5. **Asignar el perfil a usuarios**
   - Desde la página de usuarios
   - O desde el detalle del perfil

### Editar un Perfil Personalizado

1. **Localizar el perfil**
   - En la lista de perfiles
   - Filtrar por "Personalizados" si es necesario

2. **Hacer clic en "Editar"**
   - Solo disponible para perfiles personalizados

3. **Modificar los campos necesarios**
   - Nombre, descripción, permisos, estado

4. **Guardar los cambios**
   - Los cambios se registran en la auditoría
   - Los usuarios con este perfil obtienen los nuevos permisos inmediatamente

### Eliminar un Perfil Personalizado

1. **Localizar el perfil**
   - En la lista de perfiles

2. **Hacer clic en "Eliminar"**
   - Solo disponible para perfiles personalizados
   - Solo si no hay usuarios asignados

3. **Confirmar la eliminación**
   - Aparece un diálogo de confirmación
   - Advertencia si hay usuarios asignados

4. **Perfil eliminado**
   - Se elimina de la base de datos
   - Se registra en la auditoría

---

## Endpoints de API

### GET /api/profiles
- **Descripción:** Listar todos los perfiles
- **Permiso requerido:** `profiles:view`
- **Respuesta:** Array de perfiles

### POST /api/profiles
- **Descripción:** Crear un nuevo perfil
- **Permiso requerido:** `profiles:create`
- **Body:** CreateProfileDto
- **Respuesta:** Perfil creado

### GET /api/profiles/:id
- **Descripción:** Obtener un perfil por ID
- **Permiso requerido:** `profiles:view`
- **Respuesta:** Perfil encontrado

### PATCH /api/profiles/:id
- **Descripción:** Actualizar un perfil
- **Permiso requerido:** `profiles:edit`
- **Body:** UpdateProfileDto
- **Respuesta:** Perfil actualizado

### DELETE /api/profiles/:id
- **Descripción:** Eliminar un perfil
- **Permiso requerido:** `profiles:delete`
- **Respuesta:** Confirmación de eliminación

### POST /api/profiles/assign
- **Descripción:** Asignar un perfil a un usuario
- **Permiso requerido:** `profiles:assign`
- **Body:** AssignProfileDto
- **Respuesta:** Usuario actualizado

### DELETE /api/profiles/revoke/:userId
- **Descripción:** Revocar el perfil de un usuario
- **Permiso requerido:** `profiles:assign`
- **Respuesta:** Usuario actualizado

### GET /api/profiles/:id/audit
- **Descripción:** Obtener auditoría de un perfil
- **Permiso requerido:** `profiles:view`
- **Respuesta:** Array de cambios

---

## Verificación de Funcionalidad

### ✅ Verificaciones Completadas

1. **Permisos del Super Administrador**
   - ✅ Perfil "Super Administrador" asignado
   - ✅ Permisos globales `*:*` configurados
   - ✅ Método `hasPermission` funciona correctamente

2. **Interfaz de Usuario**
   - ✅ Botón "Crear perfil" visible
   - ✅ Botones "Editar" y "Eliminar" en perfiles personalizados
   - ✅ Protección de perfiles del sistema

3. **Backend**
   - ✅ Endpoints funcionando correctamente
   - ✅ Validaciones de seguridad implementadas
   - ✅ Auditoría de cambios registrada

4. **Base de Datos**
   - ✅ Usuario con perfil asignado
   - ✅ Perfiles del sistema creados
   - ✅ Estructura de permisos correcta

---

## Próximos Pasos Recomendados

### 1. Crear Perfiles Personalizados de Ejemplo
Crear algunos perfiles personalizados para casos de uso comunes:
- Gerente de Ventas
- Contador
- Recepcionista
- Médico
- Enfermera

### 2. Asignar Perfiles a Usuarios Existentes
Migrar usuarios existentes del sistema de roles al sistema de perfiles:
```sql
-- Script de migración (ejemplo)
UPDATE users u
SET profile_id = (
  SELECT id FROM profiles 
  WHERE name = 'Administrador General'
)
WHERE u.roleId = (
  SELECT id FROM roles 
  WHERE name = 'Administrador General'
)
AND u.profile_id IS NULL;
```

### 3. Documentar Perfiles Estándar
Crear documentación para cada perfil estándar:
- Qué puede hacer
- Qué no puede hacer
- Casos de uso recomendados

### 4. Capacitación de Usuarios
Capacitar a los administradores sobre:
- Cómo crear perfiles personalizados
- Cómo asignar perfiles a usuarios
- Mejores prácticas de seguridad

---

## Estado Final

✅ Super Administrador puede ver todos los perfiles  
✅ Super Administrador puede crear perfiles personalizados  
✅ Super Administrador puede editar perfiles personalizados  
✅ Super Administrador puede eliminar perfiles personalizados  
✅ Perfiles del sistema están protegidos  
✅ Validaciones de seguridad implementadas  
✅ Auditoría de cambios funcionando  

---

**Funcionalidad completada exitosamente el 2026-03-02**
