# Permisos de Super Admin para Gestión de Perfiles

**Fecha:** 2026-03-02  
**Estado:** ✅ COMPLETADO

---

## Objetivo

Asegurar que el usuario Super Admin pueda crear, editar y borrar perfiles de usuario sin restricciones.

---

## Problema Identificado

El código tenía verificaciones hardcodeadas que buscaban el nombre de rol `'super_admin'`, pero en la base de datos el rol se llama "Super Administrador". Esto causaba que las validaciones de seguridad fallaran y el super admin no pudiera realizar ciertas operaciones.

### Verificaciones Afectadas

1. **Método `create`:** Validación para crear perfiles con permisos globales
2. **Método `update`:** Validación para actualizar perfiles con permisos globales
3. **Método `checkUserPermission`:** Validación general de permisos

---

## Solución Implementada

### 1. Método Helper `isSuperAdmin`

Se creó un método privado centralizado para verificar si un usuario es super administrador:

```typescript
/**
 * Verificar si un usuario es super administrador
 */
private isSuperAdmin(user: User): boolean {
  return (
    user.role?.name === 'super_admin' ||
    user.role?.name === 'Super Administrador' ||
    user.profile?.name === 'Super Administrador'
  );
}
```

**Ventajas:**
- Centraliza la lógica de verificación
- Soporta múltiples variantes del nombre
- Verifica tanto por rol como por perfil
- Fácil de mantener y actualizar

### 2. Actualización de Métodos

Se actualizaron todos los métodos que verificaban si el usuario es super admin para usar el nuevo helper:

#### Método `create`
```typescript
// ANTES
const isSuperAdmin = performingUser.role?.name === 'super_admin';

// DESPUÉS
const isSuperAdmin = this.isSuperAdmin(performingUser);
```

#### Método `update`
```typescript
// ANTES
const isSuperAdmin = performingUser.role?.name === 'super_admin';

// DESPUÉS
const isSuperAdmin = this.isSuperAdmin(performingUser);
```

#### Método `checkUserPermission`
```typescript
// ANTES
if (
  user.role?.name === 'super_admin' ||
  user.role?.name === 'Super Administrador' ||
  user.profile?.name === 'Super Administrador'
) {
  return true;
}

// DESPUÉS
if (this.isSuperAdmin(user)) {
  return true;
}
```

---

## Permisos del Super Admin

### Perfil Asignado

El usuario Super Admin tiene asignado el perfil "Super Administrador" con los siguientes permisos:

```json
[
  {
    "module": "*",
    "actions": ["*"]
  }
]
```

Esto significa:
- ✅ Acceso a TODOS los módulos
- ✅ Puede realizar TODAS las acciones
- ✅ Sin restricciones de ningún tipo

### Capacidades Específicas para Perfiles

Con esta corrección, el Super Admin ahora puede:

1. ✅ **Crear perfiles:**
   - Con permisos globales (*)
   - Con permisos del módulo super_admin
   - Con permisos de gestión de perfiles (create, edit, delete)

2. ✅ **Editar perfiles:**
   - Modificar cualquier perfil (excepto los del sistema)
   - Agregar/quitar permisos sin restricciones
   - Cambiar nombre y descripción

3. ✅ **Eliminar perfiles:**
   - Eliminar cualquier perfil (excepto los del sistema)
   - Los perfiles del sistema están protegidos por la flag `isSystem`

4. ✅ **Asignar perfiles:**
   - Asignar cualquier perfil a cualquier usuario
   - Revocar perfiles de usuarios

5. ✅ **Ver auditoría:**
   - Acceso completo al historial de cambios
   - Ver quién hizo qué y cuándo

---

## Validaciones de Seguridad Mantenidas

Aunque el Super Admin tiene permisos completos, se mantienen las siguientes validaciones:

### 1. Perfiles del Sistema
```typescript
if (profile.isSystem) {
  throw new ForbiddenException('No se pueden editar perfiles del sistema');
}
```

Los perfiles marcados como `isSystem: true` NO pueden ser editados ni eliminados, ni siquiera por el Super Admin. Esto protege los perfiles predeterminados del sistema.

### 2. Nombres Únicos
```typescript
const existing = await this.profileRepository.findOne({
  where: {
    name: createProfileDto.name,
    tenantId: createProfileDto.tenantId || null,
  },
});

if (existing) {
  throw new BadRequestException(
    `Ya existe un perfil con el nombre "${createProfileDto.name}" en este tenant`,
  );
}
```

No se pueden crear dos perfiles con el mismo nombre en el mismo tenant.

### 3. Validación de Módulos y Acciones
```typescript
await this.validatePermissions(createProfileDto.permissions);
```

Los módulos y acciones especificados deben existir en el catálogo del sistema.

---

## Restricciones para Otros Usuarios

Los usuarios que NO son Super Admin tienen las siguientes restricciones:

### Administrador General

❌ NO puede:
- Crear perfiles con permisos globales (*)
- Crear perfiles con permisos del módulo super_admin
- Crear perfiles con permisos de create/delete en el módulo profiles
- Editar perfiles existentes
- Eliminar perfiles

✅ SÍ puede:
- Ver la lista de perfiles
- Ver detalles de perfiles
- Asignar perfiles existentes a usuarios
- Revocar perfiles de usuarios

### Otros Roles

Los demás roles (Operador, Administrador de Sede, etc.) no tienen acceso al módulo de perfiles a menos que se les asigne explícitamente.

---

## Proceso de Despliegue

### 1. Compilación
```bash
cd backend
npm run build
```

### 2. Empaquetado
```bash
tar -czf backend-dist-v52.2.0-final.tar.gz dist package.json package-lock.json
```

### 3. Subida al Servidor
```bash
scp -i credentials/AWS-ISSABEL.pem backend-dist-v52.2.0-final.tar.gz ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
```

### 4. Despliegue
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
tar -xzf backend-dist-v52.2.0-final.tar.gz
pm2 restart datagree
```

---

## Verificación

### 1. Estado del Backend
```bash
pm2 status datagree
```

**Resultado:** ✅ Online, funcionando correctamente

### 2. Pruebas Funcionales

El Super Admin ahora puede:

1. ✅ Acceder a la página de Perfiles
2. ✅ Ver la lista de perfiles existentes
3. ✅ Hacer clic en "Crear perfil"
4. ✅ Crear un nuevo perfil con cualquier combinación de permisos
5. ✅ Editar perfiles existentes (excepto los del sistema)
6. ✅ Eliminar perfiles (excepto los del sistema)
7. ✅ Asignar perfiles a usuarios
8. ✅ Ver la auditoría de cambios

---

## Archivos Modificados

### Backend
- `backend/src/profiles/profiles.service.ts`
  - Agregado método `isSuperAdmin()`
  - Actualizado método `create()`
  - Actualizado método `update()`
  - Actualizado método `checkUserPermission()`

---

## Scripts de Diagnóstico Creados

### 1. check-user-permissions.js
Verifica la estructura de la tabla users y los permisos del usuario.

### 2. assign-super-admin-profile.js
Asigna el perfil "Super Administrador" al usuario super admin.

### 3. check-super-admin-profile-permissions.js
Verifica los permisos del perfil "Super Administrador".

---

## Recomendaciones Futuras

### 1. Normalización de Nombres de Roles

Considerar usar un campo `code` adicional en la tabla `roles` para identificación programática:

```sql
ALTER TABLE roles ADD COLUMN code VARCHAR(50) UNIQUE;

UPDATE roles SET code = 'super_admin' WHERE name = 'Super Administrador';
UPDATE roles SET code = 'admin' WHERE name = 'Administrador General';
UPDATE roles SET code = 'branch_admin' WHERE name = 'Administrador de Sede';
UPDATE roles SET code = 'operator' WHERE name = 'Operador';
```

Luego actualizar el código para usar `user.role?.code` en lugar de `user.role?.name`.

### 2. Migración de Usuarios Existentes

Crear un script para asignar perfiles a todos los usuarios existentes basándose en sus roles:

```sql
-- Asignar perfiles automáticamente según el rol
UPDATE users u
SET profile_id = (
  SELECT p.id 
  FROM profiles p 
  WHERE p.name = r.name
)
FROM roles r
WHERE u.roleId = r.id
AND u.profile_id IS NULL;
```

### 3. Auditoría Mejorada

Considerar agregar más detalles a la auditoría:
- IP del usuario
- User agent
- Timestamp preciso
- Cambios específicos (diff)

---

## Estado Final

✅ Super Admin puede crear perfiles  
✅ Super Admin puede editar perfiles  
✅ Super Admin puede eliminar perfiles  
✅ Super Admin puede asignar perfiles  
✅ Validaciones de seguridad mantenidas  
✅ Backend desplegado en producción  
✅ Funcionando correctamente  

---

**Implementación completada exitosamente el 2026-03-02 a las 07:35 AM UTC**
