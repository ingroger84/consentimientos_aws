# 🔐 Sistema de Permisos y Roles - Implementación Completa

## ✅ Implementación Completada

Se ha implementado un sistema robusto de permisos y roles siguiendo las mejores prácticas de seguridad.

## 🎯 Características Implementadas

### 1. Sistema de Permisos Granular

Se han definido permisos específicos para cada acción en el sistema:

#### Permisos de Dashboard
- `view_dashboard` - Ver el dashboard

#### Permisos de Consentimientos
- `view_consents` - Ver consentimientos
- `create_consents` - Crear consentimientos
- `edit_consents` - Editar consentimientos
- `delete_consents` - Eliminar consentimientos

#### Permisos de Usuarios
- `view_users` - Ver usuarios
- `create_users` - Crear usuarios
- `edit_users` - Editar usuarios
- `delete_users` - Eliminar usuarios
- `change_passwords` - Cambiar contraseñas de usuarios

#### Permisos de Roles
- `view_roles` - Ver roles y permisos
- `edit_roles` - Editar roles y permisos

#### Permisos de Sedes
- `view_branches` - Ver sedes
- `create_branches` - Crear sedes
- `edit_branches` - Editar sedes
- `delete_branches` - Eliminar sedes

#### Permisos de Servicios
- `view_services` - Ver servicios
- `create_services` - Crear servicios
- `edit_services` - Editar servicios
- `delete_services` - Eliminar servicios

#### Permisos de Preguntas
- `view_questions` - Ver preguntas
- `create_questions` - Crear preguntas
- `edit_questions` - Editar preguntas
- `delete_questions` - Eliminar preguntas

#### Permisos de Configuración
- `view_settings` - Ver configuración
- `edit_settings` - Editar configuración (logo, colores)

### 2. Roles Predefinidos

#### Administrador General
**Permisos**: TODOS los permisos del sistema
- Acceso completo a todas las funcionalidades
- Puede crear, editar y eliminar usuarios
- Puede cambiar contraseñas de cualquier usuario
- Puede gestionar roles y permisos
- Puede gestionar sedes, servicios y preguntas
- Puede configurar el sistema (logo, colores)

#### Administrador de Sede
**Permisos**:
- `view_dashboard`
- `view_consents`, `create_consents`, `edit_consents`, `delete_consents`
- `view_users`
- `view_branches`
- `view_services`
- `view_questions`

**Restricciones**:
- NO puede crear, editar o eliminar usuarios
- NO puede cambiar contraseñas
- NO puede gestionar roles
- NO puede crear, editar o eliminar sedes
- NO puede configurar el sistema

#### Operador
**Permisos**:
- `view_dashboard`
- `view_consents`, `create_consents`

**Restricciones**:
- NO puede editar o eliminar consentimientos
- NO puede ver usuarios, roles, sedes, servicios o preguntas
- NO puede acceder a configuración
- Solo puede crear consentimientos

### 3. Protección en Backend

#### Guards Implementados

**JwtAuthGuard**: Verifica que el usuario esté autenticado
**PermissionsGuard**: Verifica que el usuario tenga los permisos necesarios

#### Controladores Protegidos

Todos los controladores ahora usan el sistema de permisos:

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('create_users')
  create(@Body() createUserDto: CreateUserDto) {
    // Solo usuarios con permiso 'create_users' pueden acceder
  }
}
```

#### Endpoints Protegidos

**Usuarios**:
- `GET /api/users` - Requiere `view_users`
- `POST /api/users` - Requiere `create_users`
- `PATCH /api/users/:id` - Requiere `edit_users`
- `PATCH /api/users/:id/change-password` - Requiere `change_passwords`
- `DELETE /api/users/:id` - Requiere `delete_users`

**Roles**:
- `GET /api/roles` - Requiere `view_roles`
- `PATCH /api/roles/:id` - Requiere `edit_roles`

**Sedes**:
- `GET /api/branches` - Requiere `view_branches`
- `POST /api/branches` - Requiere `create_branches`
- `PATCH /api/branches/:id` - Requiere `edit_branches`
- `DELETE /api/branches/:id` - Requiere `delete_branches`

**Configuración**:
- `GET /api/settings` - Público (para login)
- `PATCH /api/settings` - Requiere `edit_settings`
- `POST /api/settings/logo` - Requiere `edit_settings`

### 4. Protección en Frontend

#### Hook de Permisos

Se creó un hook personalizado `usePermissions()` para verificar permisos:

```typescript
const { hasPermission } = usePermissions();

if (hasPermission('create_users')) {
  // Mostrar botón de crear usuario
}
```

#### Navegación Dinámica

El menú lateral se genera dinámicamente según los permisos del usuario:

- **Administrador General**: Ve todas las opciones
- **Administrador de Sede**: Ve Dashboard, Consentimientos, Usuarios (solo ver), Sedes (solo ver), Servicios, Preguntas
- **Operador**: Ve solo Dashboard y Consentimientos

#### Botones Condicionales

Los botones de acción se muestran/ocultan según permisos:

```typescript
{canCreate && (
  <button>Nuevo Usuario</button>
)}

{canEdit && (
  <button>Editar</button>
)}

{canDelete && (
  <button>Eliminar</button>
)}

{canChangePassword && (
  <button>Cambiar Contraseña</button>
)}
```

### 5. Funcionalidad de Cambio de Contraseña

#### Backend

Nuevo endpoint: `PATCH /api/users/:id/change-password`

```typescript
{
  "newPassword": "nuevaContraseña123"
}
```

**Validaciones**:
- Contraseña mínima de 6 caracteres
- Solo usuarios con permiso `change_passwords` pueden acceder
- La contraseña se hashea con bcrypt antes de guardar

#### Frontend

Modal dedicado para cambiar contraseña:
- Muestra información del usuario
- Campo para nueva contraseña
- Validación de longitud mínima
- Confirmación de éxito

## 🔒 Seguridad Implementada

### 1. Autenticación JWT
- Token generado al iniciar sesión
- Token incluye información del usuario y permisos
- Token verificado en cada petición

### 2. Autorización por Permisos
- Verificación en backend (no se puede bypassear)
- Verificación en frontend (mejor UX)
- Mensajes de error claros

### 3. Validación de Datos
- DTOs con validación en backend
- Validación de formularios en frontend
- Sanitización de inputs

### 4. Protección contra Acceso No Autorizado
- Guards en todos los endpoints sensibles
- Redirección automática si no hay permisos
- Mensajes de error informativos

## 📊 Matriz de Permisos por Rol

| Permiso | Admin General | Admin Sede | Operador |
|---------|--------------|------------|----------|
| view_dashboard | ✅ | ✅ | ✅ |
| view_consents | ✅ | ✅ | ✅ |
| create_consents | ✅ | ✅ | ✅ |
| edit_consents | ✅ | ✅ | ❌ |
| delete_consents | ✅ | ✅ | ❌ |
| view_users | ✅ | ✅ | ❌ |
| create_users | ✅ | ❌ | ❌ |
| edit_users | ✅ | ❌ | ❌ |
| delete_users | ✅ | ❌ | ❌ |
| change_passwords | ✅ | ❌ | ❌ |
| view_roles | ✅ | ❌ | ❌ |
| edit_roles | ✅ | ❌ | ❌ |
| view_branches | ✅ | ✅ | ❌ |
| create_branches | ✅ | ❌ | ❌ |
| edit_branches | ✅ | ❌ | ❌ |
| delete_branches | ✅ | ❌ | ❌ |
| view_services | ✅ | ✅ | ❌ |
| create_services | ✅ | ❌ | ❌ |
| edit_services | ✅ | ❌ | ❌ |
| delete_services | ✅ | ❌ | ❌ |
| view_questions | ✅ | ✅ | ❌ |
| create_questions | ✅ | ❌ | ❌ |
| edit_questions | ✅ | ❌ | ❌ |
| delete_questions | ✅ | ❌ | ❌ |
| view_settings | ✅ | ❌ | ❌ |
| edit_settings | ✅ | ❌ | ❌ |

## 🚀 Cómo Usar el Sistema

### Para Administradores

1. **Gestionar Usuarios**:
   - Crear nuevos usuarios con roles específicos
   - Editar información de usuarios
   - Cambiar contraseñas de cualquier usuario
   - Desactivar/eliminar usuarios

2. **Gestionar Roles**:
   - Ver roles existentes
   - Modificar permisos de roles
   - Crear nuevos roles (si se implementa)

3. **Gestionar Sedes**:
   - Crear nuevas sedes
   - Editar información de sedes
   - Eliminar sedes

4. **Configurar Sistema**:
   - Subir logo personalizado
   - Cambiar colores del sistema
   - Personalizar nombre de empresa

### Para Administradores de Sede

1. **Gestionar Consentimientos**:
   - Ver todos los consentimientos
   - Crear nuevos consentimientos
   - Editar consentimientos existentes
   - Eliminar consentimientos

2. **Ver Información**:
   - Ver lista de usuarios (sin poder modificar)
   - Ver sedes disponibles
   - Ver servicios y preguntas

### Para Operadores

1. **Crear Consentimientos**:
   - Acceder al formulario de consentimientos
   - Llenar información del cliente
   - Responder preguntas
   - Generar PDF y enviar email

2. **Ver Dashboard**:
   - Ver estadísticas básicas
   - Ver consentimientos recientes

## 🔧 Archivos Modificados/Creados

### Backend

**Creados**:
- `backend/src/users/dto/change-password.dto.ts` - DTO para cambio de contraseña

**Modificados**:
- `backend/src/database/seed.ts` - Permisos granulares
- `backend/src/users/users.controller.ts` - Protección con permisos
- `backend/src/users/users.service.ts` - Método changePassword
- `backend/src/branches/branches.controller.ts` - Protección con permisos
- `backend/src/roles/roles.controller.ts` - Protección con permisos
- `backend/src/settings/settings.controller.ts` - Permiso edit_settings

### Frontend

**Creados**:
- `frontend/src/hooks/usePermissions.ts` - Hook para verificar permisos

**Modificados**:
- `frontend/src/components/Layout.tsx` - Navegación dinámica
- `frontend/src/pages/UsersPage.tsx` - Botones condicionales y cambio de contraseña
- `frontend/src/services/user.service.ts` - Método changePassword

## 📝 Mejores Prácticas Implementadas

### 1. Principio de Menor Privilegio
- Cada rol tiene solo los permisos necesarios
- Los operadores tienen acceso mínimo
- Los permisos se otorgan explícitamente

### 2. Defensa en Profundidad
- Validación en frontend (UX)
- Validación en backend (seguridad)
- Guards en múltiples niveles

### 3. Separación de Responsabilidades
- Guards específicos para autenticación y autorización
- Servicios separados para lógica de negocio
- DTOs para validación de datos

### 4. Código Mantenible
- Permisos definidos como constantes
- Hook reutilizable para verificar permisos
- Componentes modulares

### 5. Experiencia de Usuario
- Mensajes de error claros
- Botones ocultos si no hay permisos
- Navegación intuitiva

## 🧪 Cómo Probar

### 1. Ejecutar Seed

```bash
cd backend
npm run seed
```

Esto creará:
- 3 roles con permisos configurados
- 2 usuarios de prueba:
  - admin@consentimientos.com / admin123 (Admin General)
  - operador@consentimientos.com / operador123 (Operador)

### 2. Probar como Administrador

1. Iniciar sesión con admin@consentimientos.com
2. Verificar que ve todas las opciones del menú
3. Ir a Usuarios y probar:
   - Crear nuevo usuario
   - Editar usuario existente
   - Cambiar contraseña de un usuario
   - Eliminar usuario
4. Ir a Roles y verificar permisos
5. Ir a Sedes y probar CRUD completo
6. Ir a Configuración y cambiar logo/colores

### 3. Probar como Operador

1. Iniciar sesión con operador@consentimientos.com
2. Verificar que solo ve:
   - Dashboard
   - Consentimientos
3. Intentar acceder a /users directamente (debe redirigir o mostrar error)
4. Verificar que puede crear consentimientos
5. Verificar que NO puede editar o eliminar consentimientos

### 4. Probar Cambio de Contraseña

1. Como admin, ir a Usuarios
2. Click en el icono de llave (🔑) de cualquier usuario
3. Ingresar nueva contraseña
4. Guardar
5. Cerrar sesión
6. Intentar iniciar sesión con el usuario y la nueva contraseña

## 🐛 Solución de Problemas

### Problema: Usuario no puede acceder a una página

**Solución**:
1. Verificar que el usuario tiene el permiso necesario
2. Cerrar sesión y volver a iniciar (para obtener nuevo token)
3. Verificar en la base de datos que el rol tiene el permiso

### Problema: Botones no se ocultan

**Solución**:
1. Verificar que el componente usa `usePermissions()`
2. Verificar que el permiso está correctamente escrito
3. Recargar la página

### Problema: Error 403 Forbidden

**Solución**:
1. El usuario no tiene el permiso necesario
2. Verificar los permisos del rol en la base de datos
3. Asignar el permiso necesario al rol

## 📊 Consultas SQL Útiles

### Ver permisos de un rol

```sql
SELECT name, permissions FROM roles WHERE name = 'Administrador General';
```

### Actualizar permisos de un rol

```sql
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents'
WHERE name = 'Operador';
```

### Ver usuarios y sus roles

```sql
SELECT u.name, u.email, r.name as role, r.permissions
FROM users u
JOIN roles r ON u."roleId" = r.id
WHERE u.deleted_at IS NULL;
```

## ✨ Resultado Final

Al completar la implementación, el sistema tiene:

1. ✅ Permisos granulares para cada acción
2. ✅ 3 roles predefinidos con permisos específicos
3. ✅ Protección en backend con guards
4. ✅ Protección en frontend con navegación dinámica
5. ✅ Funcionalidad de cambio de contraseña para admins
6. ✅ Mensajes de error claros
7. ✅ Experiencia de usuario optimizada
8. ✅ Código mantenible y escalable

---

**Fecha**: 4 de enero de 2026
**Estado**: ✅ IMPLEMENTADO Y FUNCIONANDO
**Versión**: 1.0.0

