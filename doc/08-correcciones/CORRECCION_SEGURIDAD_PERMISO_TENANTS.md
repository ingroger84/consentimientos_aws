# Corrección de Seguridad: Permiso "Gestionar Tenants"

## Problema de Seguridad Identificado

**CRÍTICO:** Usuarios de tenants podían ver y potencialmente asignar el permiso `manage_tenants` (Gestionar tenants) en la interfaz de Roles y Permisos.

### Gravedad: ALTA

Este es un problema de seguridad grave porque:

1. **Exposición de información sensible** - Los usuarios de tenant veían un permiso que no deberían conocer
2. **Riesgo de escalación de privilegios** - Aunque el backend validaba, la UI permitía intentar asignarlo
3. **Confusión de usuarios** - Veían un permiso que decía "Solo Super Admin" pero estaba disponible
4. **Violación del principio de mínimo privilegio** - Información innecesaria expuesta

### Escenario del Problema

```
Usuario: Admin de Tenant "Demo Consultorio Medico"
Acción: Editar permisos de un rol
Resultado: Ve el permiso "Gestionar tenants (Solo Super Admin)"
Problema: Este permiso es EXCLUSIVO del Super Admin
```

## Solución Implementada

### 1. Filtrado de Permisos en el Backend

**Archivo:** `backend/src/roles/roles.controller.ts`

**Antes:**
```typescript
@Get('permissions')
getPermissions() {
  return {
    permissions: Object.values(PERMISSIONS),
    descriptions: PERMISSION_DESCRIPTIONS,
    categories: PERMISSION_CATEGORIES,
  };
}
```

**Después:**
```typescript
@Get('permissions')
getPermissions(@CurrentUser() user: User) {
  // SEGURIDAD CRÍTICA: Filtrar permisos según el tipo de usuario
  const isSuperAdmin = !user.tenant;
  
  let permissions = Object.values(PERMISSIONS);
  let descriptions = { ...PERMISSION_DESCRIPTIONS };
  let categories = { ...PERMISSION_CATEGORIES };
  
  // Si NO es Super Admin, excluir el permiso de gestionar tenants
  if (!isSuperAdmin) {
    // Filtrar el permiso manage_tenants
    permissions = permissions.filter(p => p !== PERMISSIONS.MANAGE_TENANTS);
    
    // Eliminar la descripción del permiso
    delete descriptions[PERMISSIONS.MANAGE_TENANTS];
    
    // Eliminar la categoría de tenants
    delete categories.tenants;
  }
  
  return {
    permissions,
    descriptions,
    categories,
  };
}
```

**Mejoras:**
- ✅ Detecta si el usuario es Super Admin (sin tenant)
- ✅ Filtra el permiso `manage_tenants` para usuarios de tenant
- ✅ Elimina la descripción del permiso
- ✅ Elimina toda la categoría "Tenants"

### 2. Validación Adicional en el Servicio

**Archivo:** `backend/src/roles/roles.service.ts`

**Agregado:**
```typescript
// SEGURIDAD CRÍTICA: Si el usuario tiene tenant, NO puede asignar el permiso manage_tenants
if (userTenantId && updateRoleDto.permissions) {
  const hasManageTenantsPermission = updateRoleDto.permissions.includes(PERMISSIONS.MANAGE_TENANTS);
  
  if (hasManageTenantsPermission) {
    throw new BadRequestException(
      'No tienes permisos para asignar el permiso "Gestionar tenants". ' +
      'Este permiso es exclusivo del Super Admin.'
    );
  }
}
```

**Protección:**
- ✅ Valida en el backend antes de guardar
- ✅ Previene asignación mediante API directa
- ✅ Mensaje de error claro y descriptivo
- ✅ Doble capa de seguridad (UI + Backend)

## Capas de Seguridad

### Capa 1: Filtrado en UI (Frontend)
```
Usuario de Tenant → Solicita permisos → Backend filtra → UI no muestra manage_tenants
```

### Capa 2: Validación en Backend
```
Usuario de Tenant → Intenta asignar manage_tenants → Backend rechaza → Error 400
```

### Capa 3: Validación de Rol
```
Usuario de Tenant → Intenta modificar rol Super Admin → Backend rechaza → Error 404
```

## Comportamiento por Tipo de Usuario

### Super Admin (sin tenant)

**Puede ver:**
- ✅ Todos los permisos incluyendo `manage_tenants`
- ✅ Categoría "Tenants"
- ✅ Todos los roles incluyendo "Super Administrador"

**Puede hacer:**
- ✅ Asignar cualquier permiso a cualquier rol
- ✅ Modificar el rol Super Admin
- ✅ Gestionar tenants

### Admin de Tenant (con tenant)

**Puede ver:**
- ✅ Todos los permisos EXCEPTO `manage_tenants`
- ❌ NO ve la categoría "Tenants"
- ✅ Roles de su tenant (NO ve "Super Administrador")

**Puede hacer:**
- ✅ Asignar permisos a roles de su tenant
- ❌ NO puede asignar `manage_tenants`
- ❌ NO puede modificar el rol Super Admin
- ❌ NO puede gestionar tenants

## Permisos Filtrados

### Para Super Admin
```typescript
{
  dashboard: [...],
  consents: [...],
  users: [...],
  roles: [...],
  branches: [...],
  services: [...],
  questions: [...],
  settings: [...],
  tenants: [                    // ← VISIBLE
    'manage_tenants'
  ]
}
```

### Para Admin de Tenant
```typescript
{
  dashboard: [...],
  consents: [...],
  users: [...],
  roles: [...],
  branches: [...],
  services: [...],
  questions: [...],
  settings: [...]
  // tenants: NO EXISTE     // ← FILTRADO
}
```

## Pruebas de Seguridad

### Prueba 1: UI Filtrada
```
1. Login como Admin de Tenant
2. Ir a Roles y Permisos
3. Editar un rol
4. Verificar que NO aparece "Gestionar tenants"
5. Verificar que NO aparece la categoría "Tenants"
✅ PASS
```

### Prueba 2: API Directa
```
1. Login como Admin de Tenant
2. Obtener token JWT
3. Intentar asignar manage_tenants vía API:
   PATCH /api/roles/:id
   { permissions: [..., 'manage_tenants'] }
4. Verificar que retorna error 400
✅ PASS
```

### Prueba 3: Super Admin
```
1. Login como Super Admin
2. Ir a Roles y Permisos
3. Verificar que SÍ aparece "Gestionar tenants"
4. Verificar que SÍ aparece la categoría "Tenants"
✅ PASS
```

## Archivos Modificados

- `backend/src/roles/roles.controller.ts` - Filtrado de permisos por tipo de usuario
- `backend/src/roles/roles.service.ts` - Validación adicional en actualización

## Principios de Seguridad Aplicados

### 1. Principio de Mínimo Privilegio
- Los usuarios solo ven y acceden a lo que necesitan
- Información sensible oculta por defecto

### 2. Defensa en Profundidad
- Múltiples capas de validación
- UI + Backend + Base de datos

### 3. Separación de Privilegios
- Super Admin tiene acceso exclusivo a gestión de tenants
- Tenants no pueden ver ni acceder a funcionalidad multi-tenant

### 4. Fail-Safe Defaults
- Por defecto, se filtra el permiso sensible
- Solo se muestra si explícitamente es Super Admin

## Impacto

### Antes de la Corrección
- ⚠️ Usuarios de tenant veían permiso sensible
- ⚠️ Confusión en la interfaz
- ⚠️ Riesgo de intentos de escalación
- ⚠️ Violación de principios de seguridad

### Después de la Corrección
- ✅ Usuarios de tenant NO ven permiso sensible
- ✅ Interfaz limpia y clara
- ✅ Imposible asignar permiso prohibido
- ✅ Cumple con principios de seguridad

## Recomendaciones Adicionales

### Para Desarrollo
1. Siempre filtrar información sensible en el backend
2. No confiar solo en validaciones de frontend
3. Implementar múltiples capas de seguridad
4. Documentar permisos y restricciones

### Para Producción
1. Auditar regularmente los permisos asignados
2. Monitorear intentos de acceso no autorizado
3. Revisar logs de modificaciones de roles
4. Mantener el rol Super Admin con acceso restringido

### Para Testing
1. Probar con diferentes tipos de usuarios
2. Intentar bypass de validaciones
3. Verificar filtrado en todas las capas
4. Probar casos extremos

## Resultado Final

✅ Permiso `manage_tenants` oculto para usuarios de tenant
✅ Categoría "Tenants" no visible para usuarios de tenant
✅ Validación en backend previene asignación no autorizada
✅ Múltiples capas de seguridad implementadas
✅ Cumple con principios de seguridad
✅ Interfaz limpia y sin confusión
✅ Sistema más seguro y robusto

## Verificación

Para verificar la corrección:

1. **Como Admin de Tenant:**
   ```
   - Login en http://demo-medico.localhost:5173
   - Ir a Roles y Permisos
   - Editar cualquier rol
   - Verificar que NO aparece "Gestionar tenants"
   ```

2. **Como Super Admin:**
   ```
   - Login en http://admin.localhost:5173
   - Ir a Roles y Permisos
   - Editar cualquier rol
   - Verificar que SÍ aparece "Gestionar tenants"
   ```

3. **Prueba de API:**
   ```bash
   # Como Admin de Tenant, intentar asignar manage_tenants
   curl -X PATCH http://localhost:3000/api/roles/:id \
     -H "Authorization: Bearer TOKEN_DE_TENANT" \
     -H "Content-Type: application/json" \
     -d '{"permissions": ["manage_tenants"]}'
   
   # Debe retornar error 400
   ```
