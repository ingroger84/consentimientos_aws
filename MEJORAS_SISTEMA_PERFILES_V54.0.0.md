# 🚀 Mejoras Sistema de Perfiles y Permisos v54.0.0

## 📋 Análisis del Estado Actual

### ✅ Lo que funciona bien:
1. Sistema de perfiles con permisos granulares por módulo
2. Guard de permisos con caché en memoria
3. Decorador `@RequirePermission` para proteger endpoints
4. CRUD completo de perfiles (backend y frontend)
5. Auditoría de cambios en perfiles
6. Perfiles del sistema protegidos contra edición/eliminación

### ⚠️ Áreas de mejora identificadas:

#### 1. Control de Acceso al Módulo de Perfiles
**Problema**: Actualmente cualquier usuario autenticado puede ver perfiles
**Solución**: Solo Super Admin debe tener acceso completo

#### 2. Visibilidad en el Frontend
**Problema**: El menú de perfiles puede ser visible para usuarios sin permisos
**Solución**: Ocultar opciones del menú basado en permisos del usuario

#### 3. Asignación de Perfiles a Usuarios
**Problema**: No hay interfaz clara para asignar perfiles a usuarios
**Solución**: Agregar sección en gestión de usuarios para asignar perfiles

#### 4. Validación de Permisos en Frontend
**Problema**: El frontend no valida permisos antes de mostrar componentes
**Solución**: Crear hook `usePermissions` para validar permisos en componentes

#### 5. Feedback Visual de Permisos
**Problema**: Los usuarios no saben qué permisos tienen
**Solución**: Mostrar permisos actuales en perfil de usuario

## 🎯 Plan de Implementación

### Fase 1: Restricción de Acceso Backend ✅
- [x] Agregar decorador `@RequireSuperAdmin()` 
- [x] Proteger todos los endpoints de perfiles con super admin
- [x] Proteger endpoints de módulos con super admin
- [x] Validar que solo super admin puede crear/editar/eliminar perfiles

### Fase 2: Restricción de Acceso Frontend
- [ ] Crear hook `usePermissions()` para validar permisos
- [ ] Crear componente `<ProtectedRoute>` para rutas protegidas
- [ ] Crear componente `<PermissionGate>` para ocultar elementos
- [ ] Ocultar menú de perfiles si no es super admin
- [ ] Agregar validación en todas las páginas de perfiles

### Fase 3: Gestión de Usuarios con Perfiles
- [ ] Agregar selector de perfil en formulario de crear usuario
- [ ] Agregar selector de perfil en formulario de editar usuario
- [ ] Mostrar perfil actual en lista de usuarios
- [ ] Agregar filtro por perfil en lista de usuarios

### Fase 4: Mejoras de UX
- [ ] Mostrar permisos del usuario en su perfil
- [ ] Agregar tooltip explicativo en cada permiso
- [ ] Mejorar selector de permisos con búsqueda
- [ ] Agregar vista previa de permisos antes de asignar perfil

### Fase 5: Testing y Validación
- [ ] Probar acceso con super admin
- [ ] Probar acceso con usuarios normales (debe denegar)
- [ ] Probar asignación de perfiles a usuarios
- [ ] Probar que permisos se aplican correctamente

## 🔧 Implementación Técnica

### 1. Decorador RequireSuperAdmin (Backend)

```typescript
// backend/src/profiles/decorators/require-super-admin.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'require_super_admin';
export const RequireSuperAdmin = () => SetMetadata(SUPER_ADMIN_KEY, true);
```

### 2. Hook usePermissions (Frontend)

```typescript
// frontend/src/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuthStore();
  
  const hasPermission = (module: string, action: string): boolean => {
    if (!user?.profile) return false;
    
    // Super admin tiene todos los permisos
    if (user.profile.code === 'super_admin') return true;
    
    // Verificar permiso específico
    const permission = user.profile.permissions.find(p => p.module === module);
    if (!permission) return false;
    
    return permission.actions.includes('*') || permission.actions.includes(action);
  };
  
  const isSuperAdmin = (): boolean => {
    return user?.profile?.code === 'super_admin' || user?.role?.code === 'super_admin';
  };
  
  return { hasPermission, isSuperAdmin };
}
```

### 3. Componente ProtectedRoute (Frontend)

```typescript
// frontend/src/components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  module, 
  action,
  requireSuperAdmin = false 
}) {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (requireSuperAdmin && !isSuperAdmin()) {
      navigate('/unauthorized');
    } else if (module && action && !hasPermission(module, action)) {
      navigate('/unauthorized');
    }
  }, []);
  
  if (requireSuperAdmin && !isSuperAdmin()) return null;
  if (module && action && !hasPermission(module, action)) return null;
  
  return <>{children}</>;
}
```

### 4. Componente PermissionGate (Frontend)

```typescript
// frontend/src/components/PermissionGate.tsx
export function PermissionGate({ 
  children, 
  module, 
  action,
  requireSuperAdmin = false,
  fallback = null 
}) {
  const { hasPermission, isSuperAdmin } = usePermissions();
  
  if (requireSuperAdmin && !isSuperAdmin()) return fallback;
  if (module && action && !hasPermission(module, action)) return fallback;
  
  return <>{children}</>;
}
```

## 📊 Estructura de Permisos Mejorada

### Módulos del Sistema

```typescript
const SYSTEM_MODULES = [
  // Gestión de Usuarios y Accesos (Solo Super Admin)
  { code: 'profiles', name: 'Perfiles y Permisos', superAdminOnly: true },
  { code: 'users', name: 'Usuarios', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'roles', name: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
  
  // Gestión de Clientes
  { code: 'clients', name: 'Clientes', actions: ['view', 'create', 'edit', 'delete'] },
  
  // Historias Clínicas
  { code: 'medical-records', name: 'Historias Clínicas', actions: ['view', 'create', 'edit', 'delete', 'reopen'] },
  { code: 'consents', name: 'Consentimientos', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'templates', name: 'Plantillas', actions: ['view', 'create', 'edit', 'delete'] },
  
  // Configuración (Requiere permisos especiales)
  { code: 'tenants', name: 'Tenants', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'branches', name: 'Sedes', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'services', name: 'Servicios', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'questions', name: 'Preguntas', actions: ['view', 'create', 'edit', 'delete'] },
  
  // Facturación y Pagos
  { code: 'plans', name: 'Planes', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'payments', name: 'Pagos', actions: ['view', 'create', 'edit', 'delete'] },
  { code: 'invoices', name: 'Facturas', actions: ['view', 'create', 'edit', 'delete'] },
  
  // Configuración General
  { code: 'settings', name: 'Configuración', actions: ['view', 'edit'] },
  { code: 'email-config', name: 'Config. Email', actions: ['view', 'edit', 'preview'] },
  
  // Reportes y Auditoría
  { code: 'reports', name: 'Reportes', actions: ['view', 'export'] },
  { code: 'audit', name: 'Auditoría', actions: ['view'] },
  { code: 'health', name: 'Estado del Sistema', actions: ['view'] },
  { code: 'logs', name: 'Logs', actions: ['view'] },
];
```

## 🔒 Reglas de Seguridad

### 1. Acceso al Módulo de Perfiles
- ✅ Solo Super Admin puede ver, crear, editar y eliminar perfiles
- ✅ Solo Super Admin puede asignar perfiles a usuarios
- ✅ Solo Super Admin puede ver la lista de módulos y acciones
- ❌ Usuarios normales no pueden acceder a `/profiles`

### 2. Creación de Perfiles
- ✅ Solo Super Admin puede crear perfiles
- ✅ No se pueden crear perfiles con permisos globales (*:*) excepto super admin
- ✅ No se pueden crear perfiles con acceso al módulo de perfiles
- ✅ Validar que módulos y acciones existan

### 3. Edición de Perfiles
- ✅ Solo Super Admin puede editar perfiles
- ❌ No se pueden editar perfiles del sistema
- ✅ No se pueden agregar permisos de super admin a perfiles normales
- ✅ Invalidar caché de permisos al editar

### 4. Eliminación de Perfiles
- ✅ Solo Super Admin puede eliminar perfiles
- ❌ No se pueden eliminar perfiles del sistema
- ❌ No se pueden eliminar perfiles con usuarios asignados
- ✅ Soft delete para mantener auditoría

### 5. Asignación de Perfiles
- ✅ Solo Super Admin puede asignar perfiles
- ✅ Validar que perfil sea compatible con tenant del usuario
- ✅ Invalidar caché de permisos al asignar
- ✅ Auditar todas las asignaciones

## 📈 Beneficios de las Mejoras

1. **Seguridad Mejorada**: Solo super admin gestiona perfiles
2. **UX Mejorada**: Usuarios solo ven lo que pueden usar
3. **Gestión Simplificada**: Asignar perfiles desde gestión de usuarios
4. **Transparencia**: Usuarios saben qué permisos tienen
5. **Auditoría Completa**: Registro de todos los cambios
6. **Performance**: Caché de permisos para consultas rápidas
7. **Escalabilidad**: Fácil agregar nuevos módulos y permisos

## 🚀 Próximos Pasos

1. Implementar decorador `@RequireSuperAdmin()`
2. Proteger todos los endpoints de perfiles
3. Crear hooks y componentes de permisos en frontend
4. Actualizar rutas para usar `<ProtectedRoute>`
5. Agregar gestión de perfiles en usuarios
6. Probar exhaustivamente con diferentes perfiles
7. Desplegar a producción
8. Documentar para el equipo

## 📝 Notas Importantes

- Los perfiles del sistema NO se pueden modificar
- Solo Super Admin tiene acceso al módulo de perfiles
- Los permisos se validan tanto en backend como frontend
- El caché de permisos se invalida automáticamente al hacer cambios
- Todas las operaciones quedan registradas en auditoría
