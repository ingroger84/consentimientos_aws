# 🔐 Sistema de Perfiles y Permisos Granulares

**Fecha:** 2026-02-27  
**Versión:** 51.0.0  
**Estado:** ✅ EN IMPLEMENTACIÓN

---

## 📋 Resumen

Sistema completo de perfiles con permisos granulares que permite:
- ✅ Crear perfiles personalizados
- ✅ Asignar permisos por módulo y acción
- ✅ Control específico por tenant
- ✅ Auditoría completa de cambios
- ✅ Perfiles predeterminados del sistema

---

## 🎯 Características Principales

### 1. Perfiles Personalizables
- Crear perfiles específicos para cada necesidad
- Perfiles globales o por tenant
- Perfiles del sistema (no editables)
- Perfiles personalizados (editables)

### 2. Permisos Granulares
- Control por módulo (dashboard, medical_records, clients, etc.)
- Control por acción (view, create, edit, delete, export, etc.)
- Permisos globales (*) para super admins
- Validación automática de permisos

### 3. Separación por Tenant
- Perfiles globales (disponibles para todos)
- Perfiles específicos de tenant
- Usuarios solo ven perfiles de su tenant

### 4. Auditoría Completa
- Registro de creación de perfiles
- Registro de modificaciones
- Registro de asignaciones
- Registro de revocaciones
- IP y User Agent capturados

---

## 🗄️ Estructura de Base de Datos

### Tablas Creadas

1. **profiles** - Perfiles de usuario
   - id, name, description
   - tenant_id (null para globales)
   - is_system (perfiles predeterminados)
   - is_active
   - permissions (JSONB)

2. **system_modules** - Catálogo de módulos
   - id, code, name, description
   - category, icon, route
   - parent_module_id (para submódulos)
   - display_order

3. **module_actions** - Acciones por módulo
   - id, module_id, code, name
   - description

4. **permission_audit** - Auditoría de cambios
   - id, profile_id, user_id
   - action, changes
   - performed_by, performed_at
   - ip_address, user_agent

### Relaciones

```
users
  ├─ profile_id → profiles
  └─ role_id → roles (legacy)

profiles
  ├─ tenant_id → tenants
  └─ permissions (JSONB array)

system_modules
  └─ parent_module_id → system_modules

module_actions
  └─ module_id → system_modules

permission_audit
  ├─ profile_id → profiles
  ├─ user_id → users
  └─ performed_by → users
```

---

## 📊 Módulos del Sistema

### Dashboard
- `dashboard` - Panel principal
- `dashboard_stats` - Estadísticas
- `dashboard_charts` - Gráficos

### Historias Clínicas
- `medical_records` - Gestión HC
- `medical_records_list` - Listar
- `medical_records_create` - Crear
- `medical_records_view` - Ver
- `medical_records_edit` - Editar
- `medical_records_delete` - Eliminar
- `medical_records_export` - Exportar
- `medical_records_print` - Imprimir

### Consentimientos
- `consents` - Gestión consentimientos
- `consents_list` - Listar
- `consents_create` - Crear
- `consents_view` - Ver
- `consents_edit` - Editar
- `consents_delete` - Eliminar
- `consents_sign` - Firmar

### Clientes
- `clients` - Gestión clientes
- `clients_list` - Listar
- `clients_create` - Crear
- `clients_view` - Ver
- `clients_edit` - Editar
- `clients_delete` - Eliminar
- `clients_export` - Exportar

### Usuarios
- `users` - Gestión usuarios
- `users_list` - Listar
- `users_create` - Crear
- `users_view` - Ver
- `users_edit` - Editar
- `users_delete` - Eliminar
- `users_reset_password` - Resetear password

### Perfiles
- `profiles` - Gestión perfiles
- `profiles_list` - Listar
- `profiles_create` - Crear
- `profiles_view` - Ver
- `profiles_edit` - Editar
- `profiles_delete` - Eliminar
- `profiles_assign` - Asignar

### Sedes
- `branches` - Gestión sedes
- `branches_list` - Listar
- `branches_create` - Crear
- `branches_edit` - Editar
- `branches_delete` - Eliminar

### Plantillas
- `templates` - Gestión plantillas
- `templates_list` - Listar
- `templates_create` - Crear
- `templates_edit` - Editar
- `templates_delete` - Eliminar

### Reportes
- `reports` - Reportes
- `reports_medical_records` - Reporte HC
- `reports_consents` - Reporte consentimientos
- `reports_clients` - Reporte clientes
- `reports_export` - Exportar

### Configuración
- `settings` - Configuración
- `settings_general` - General
- `settings_email` - Email
- `settings_billing` - Facturación
- `settings_security` - Seguridad

### Super Admin
- `super_admin` - Super Admin
- `super_admin_tenants` - Gestión tenants
- `super_admin_users` - Usuarios globales
- `super_admin_system` - Sistema
- `super_admin_logs` - Logs

---

## 🔧 Perfiles Predeterminados

### 1. Super Administrador
```json
{
  "permissions": [
    {"module": "*", "actions": ["*"]}
  ]
}
```
- Acceso total a todo el sistema

### 2. Administrador General
```json
{
  "permissions": [
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "delete", "export", "print", "email"]},
    {"module": "consents", "actions": ["view", "create", "edit", "delete", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit", "delete", "export"]},
    {"module": "users", "actions": ["view", "create", "edit", "delete", "reset_password"]},
    {"module": "profiles", "actions": ["view", "create", "edit", "assign"]},
    {"module": "branches", "actions": ["view", "create", "edit", "delete"]},
    {"module": "templates", "actions": ["view", "create", "edit", "delete"]},
    {"module": "reports", "actions": ["view", "export"]},
    {"module": "settings", "actions": ["view", "edit"]}
  ]
}
```

### 3. Administrador de Sede
```json
{
  "permissions": [
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "export", "print"]},
    {"module": "consents", "actions": ["view", "create", "edit", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit", "export"]},
    {"module": "users", "actions": ["view"]},
    {"module": "reports", "actions": ["view", "export"]},
    {"module": "settings", "actions": ["view"]}
  ]
}
```

### 4. Operador
```json
{
  "permissions": [
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "print"]},
    {"module": "consents", "actions": ["view", "create", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit"]},
    {"module": "reports", "actions": ["view"]}
  ]
}
```

### 5. Solo Lectura
```json
{
  "permissions": [
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view"]},
    {"module": "consents", "actions": ["view"]},
    {"module": "clients", "actions": ["view"]},
    {"module": "reports", "actions": ["view"]}
  ]
}
```

---

## 🚀 Implementación

### Paso 1: Ejecutar Migración SQL

```bash
# Conectar a Supabase
psql -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -f backend/migrations/create-profiles-system.sql
```

O desde el SQL Editor de Supabase:
1. Ir a SQL Editor
2. Copiar contenido de `backend/migrations/create-profiles-system.sql`
3. Ejecutar

### Paso 2: Compilar Backend

```bash
cd backend
npm run build
```

### Paso 3: Crear Módulo de Perfiles

Archivos pendientes de crear:
- `backend/src/profiles/profiles.controller.ts`
- `backend/src/profiles/profiles.module.ts`
- `backend/src/profiles/guards/permissions.guard.ts`
- `backend/src/profiles/decorators/require-permission.decorator.ts`

### Paso 4: Actualizar App Module

Agregar ProfilesModule a los imports en `app.module.ts`

### Paso 5: Crear Frontend

Páginas a crear:
- `frontend/src/pages/ProfilesPage.tsx` - Lista de perfiles
- `frontend/src/pages/CreateProfilePage.tsx` - Crear perfil
- `frontend/src/pages/EditProfilePage.tsx` - Editar perfil
- `frontend/src/components/PermissionSelector.tsx` - Selector de permisos

---

## 📝 API Endpoints

### Perfiles

```
GET    /api/profiles              - Listar perfiles
GET    /api/profiles/:id          - Obtener perfil
POST   /api/profiles              - Crear perfil
PATCH  /api/profiles/:id          - Actualizar perfil
DELETE /api/profiles/:id          - Eliminar perfil
POST   /api/profiles/assign       - Asignar perfil a usuario
POST   /api/profiles/revoke/:userId - Revocar perfil de usuario
GET    /api/profiles/:id/audit    - Auditoría de perfil
```

### Módulos

```
GET    /api/modules               - Listar módulos
GET    /api/modules/by-category   - Módulos por categoría
GET    /api/modules/:id/actions   - Acciones de módulo
```

### Permisos

```
POST   /api/permissions/check     - Verificar permiso
GET    /api/permissions/user/:id  - Permisos de usuario
```

---

## 🔒 Guards y Decorators

### @RequirePermission Decorator

```typescript
@RequirePermission('medical_records', 'create')
@Post()
async create(@Body() dto: CreateMedicalRecordDto) {
  // ...
}
```

### PermissionsGuard

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  // ...
}
```

---

## 💡 Ejemplos de Uso

### Crear Perfil Personalizado

```typescript
const profile = await profilesService.create({
  name: 'Médico Especialista',
  description: 'Médico con acceso a HC y consentimientos',
  tenantId: 'tenant-uuid',
  permissions: [
    {
      module: 'dashboard',
      actions: ['view']
    },
    {
      module: 'medical_records',
      actions: ['view', 'create', 'edit', 'print']
    },
    {
      module: 'consents',
      actions: ['view', 'sign']
    },
    {
      module: 'clients',
      actions: ['view']
    }
  ]
}, userId, ipAddress, userAgent);
```

### Asignar Perfil a Usuario

```typescript
await profilesService.assignToUser(
  profileId,
  userId,
  performedBy,
  ipAddress,
  userAgent
);
```

### Verificar Permiso

```typescript
const hasPermission = await profilesService.checkUserPermission(
  userId,
  'medical_records',
  'create'
);

if (!hasPermission) {
  throw new ForbiddenException('No tienes permiso para crear HC');
}
```

---

## 🎨 Frontend - Selector de Permisos

Componente visual para seleccionar permisos:

```tsx
<PermissionSelector
  modules={modules}
  selectedPermissions={permissions}
  onChange={setPermissions}
/>
```

Características:
- Agrupado por categoría
- Checkboxes para módulos y acciones
- Selección rápida (todos/ninguno)
- Vista previa de permisos seleccionados

---

## 📊 Ventajas del Sistema

### Flexibilidad
- ✅ Perfiles personalizados ilimitados
- ✅ Permisos granulares por módulo y acción
- ✅ Fácil de extender con nuevos módulos

### Seguridad
- ✅ Validación automática de permisos
- ✅ Auditoría completa de cambios
- ✅ Perfiles del sistema protegidos

### Escalabilidad
- ✅ Soporta múltiples tenants
- ✅ Perfiles globales y específicos
- ✅ Fácil agregar nuevos módulos

### Usabilidad
- ✅ Interfaz intuitiva
- ✅ Perfiles predeterminados
- ✅ Asignación simple

---

## 🔄 Migración de Roles a Perfiles

Para migrar usuarios existentes:

```sql
-- Crear perfiles basados en roles actuales
INSERT INTO profiles (name, description, is_system, permissions)
SELECT 
  r.name,
  r.description,
  TRUE,
  r.permissions
FROM roles r;

-- Asignar perfiles a usuarios
UPDATE users u
SET profile_id = (
  SELECT p.id 
  FROM profiles p 
  JOIN roles r ON r.name = p.name 
  WHERE r.id = u."roleId"
);
```

---

## 📝 Próximos Pasos

1. ✅ Migración SQL ejecutada
2. ✅ Entidades creadas
3. ✅ DTOs creados
4. ✅ Servicio creado
5. ⏳ Crear controller
6. ⏳ Crear guards y decorators
7. ⏳ Crear módulo
8. ⏳ Actualizar app.module
9. ⏳ Crear páginas frontend
10. ⏳ Probar sistema completo

---

## 🔗 Referencias

- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)
- [ABAC (Attribute-Based Access Control)](https://en.wikipedia.org/wiki/Attribute-based_access_control)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [TypeORM Relations](https://typeorm.io/relations)
