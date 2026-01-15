# Correcciones - Página "Mi Plan"

## Problema Reportado

Usuario no podía ver la página "Mi Plan" al iniciar sesión en un tenant. Mostraba el error: "No se pudo cargar la información del plan".

## Causa Raíz

Se identificaron 3 problemas:

### 1. Permiso Inexistente
**Problema**: El endpoint `/api/tenants/:id/usage` requería el permiso `VIEW_TENANT_USAGE` que no existía en el archivo de permisos.

**Archivo**: `backend/src/tenants/tenants.controller.ts`

**Solución**: Cambiar el permiso requerido a `VIEW_DASHBOARD` que todos los usuarios tienen.

```typescript
// ANTES
@Get(':id/usage')
@RequirePermissions(PERMISSIONS.VIEW_TENANT_USAGE)
getUsage(@Param('id') id: string) {
  return this.tenantsService.getUsage(id);
}

// DESPUÉS
@Get(':id/usage')
@RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
getUsage(@Param('id') id: string) {
  return this.tenantsService.getUsage(id);
}
```

### 2. Nombres de Propiedades Incorrectos
**Problema**: El método `getUsage()` usaba nombres de propiedades que no coincidían con la entidad Tenant.

**Archivo**: `backend/src/tenants/tenants.service.ts`

**Errores encontrados**:
- Usaba `tenant.maxStorageMb` pero la propiedad es `tenant.storageLimitMb`
- Usaba `tenant.watermark` pero está en `tenant.features.watermark`
- Usaba `tenant.customization` pero está en `tenant.features.customization`
- Y así con todas las features

**Solución**: Corregir los nombres de propiedades:

```typescript
// ANTES
storage: {
  current: storageUsedMb,
  max: tenant.maxStorageMb || 999999,
  percentage: calculatePercentage(storageUsedMb, tenant.maxStorageMb || 999999),
  status: this.getUsageStatus(storageUsedMb, tenant.maxStorageMb || 999999),
  unit: 'MB',
},
features: {
  watermark: tenant.watermark,
  customization: tenant.customization,
  advancedReports: tenant.advancedReports,
  apiAccess: tenant.apiAccess,
  prioritySupport: tenant.prioritySupport,
}

// DESPUÉS
storage: {
  current: storageUsedMb,
  max: tenant.storageLimitMb || 999999,
  percentage: calculatePercentage(storageUsedMb, tenant.storageLimitMb || 999999),
  status: this.getUsageStatus(storageUsedMb, tenant.storageLimitMb || 999999),
  unit: 'MB',
},
features: {
  watermark: tenant.features?.watermark ?? true,
  customization: tenant.features?.customization ?? false,
  advancedReports: tenant.features?.advancedReports ?? false,
  apiAccess: tenant.features?.apiAccess ?? false,
  prioritySupport: tenant.features?.prioritySupport ?? false,
}
```

### 3. Manejo de Errores en Frontend
**Problema**: El frontend no manejaba correctamente el caso cuando no había tenant ID.

**Archivo**: `frontend/src/pages/MyPlanPage.tsx`

**Solución**: Mejorar el manejo de errores y agregar más logs:

```typescript
// ANTES
const loadUsage = async () => {
  try {
    setLoading(true);
    const tenantId = user?.tenant?.id;
    if (!tenantId) {
      console.error('No tenant ID found');
      return; // ❌ No establecía loading = false
    }
    const response = await api.get(`/tenants/${tenantId}/usage`);
    setUsage(response.data);
  } catch (error) {
    console.error('Error loading usage:', error);
  } finally {
    setLoading(false);
  }
};

// DESPUÉS
const loadUsage = async () => {
  try {
    setLoading(true);
    const tenantId = user?.tenant?.id;
    if (!tenantId) {
      console.error('No tenant ID found', user);
      setLoading(false); // ✅ Establecer loading = false
      return;
    }
    console.log('Loading usage for tenant:', tenantId);
    const response = await api.get(`/tenants/${tenantId}/usage`);
    console.log('Usage data received:', response.data);
    setUsage(response.data);
  } catch (error: any) {
    console.error('Error loading usage:', error);
    console.error('Error response:', error.response?.data);
  } finally {
    setLoading(false);
  }
};
```

También se agregó un mensaje más claro cuando no hay tenant:

```typescript
if (!user?.tenant) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-800">
        Esta página solo está disponible para usuarios de tenants. 
        Si eres Super Admin, no tienes un plan asignado.
      </p>
    </div>
  );
}
```

## Scripts de Utilidad Creados

### 1. check-tenant-plan.ts
Script para verificar el estado de los planes de todos los tenants.

**Uso**:
```bash
cd backend
npx ts-node check-tenant-plan.ts
```

**Salida**:
- Lista todos los tenants con sus planes y límites
- Identifica tenants sin plan asignado
- Muestra estadísticas de uso

### 2. fix-tenant-plans.ts
Script para asignar plan Free a tenants que no tienen plan.

**Uso**:
```bash
cd backend
npx ts-node fix-tenant-plans.ts
```

**Acción**:
- Busca tenants sin plan
- Asigna plan Free con límites por defecto
- Actualiza todas las propiedades necesarias

## Verificación

Después de aplicar las correcciones:

1. ✅ Todos los tenants tienen plan asignado
2. ✅ El endpoint `/api/tenants/:id/usage` funciona correctamente
3. ✅ La página "Mi Plan" carga sin errores
4. ✅ Se muestran todos los recursos con sus límites
5. ✅ Las alertas funcionan correctamente

## Archivos Modificados

```
backend/
├── src/
│   └── tenants/
│       ├── tenants.controller.ts (MODIFICADO)
│       └── tenants.service.ts (MODIFICADO)
├── check-tenant-plan.ts (NUEVO)
└── fix-tenant-plans.ts (NUEVO)

frontend/
└── src/
    └── pages/
        └── MyPlanPage.tsx (MODIFICADO)

doc/
└── 05-limites/
    └── CORRECCIONES_MI_PLAN.md (NUEVO)
```

## Pruebas Realizadas

1. ✅ Verificar que todos los tenants tienen plan asignado
2. ✅ Acceder a "Mi Plan" desde un tenant
3. ✅ Verificar que se cargan todos los recursos
4. ✅ Verificar que los porcentajes son correctos
5. ✅ Verificar que las características se muestran correctamente

## Notas Importantes

### Estructura de la Entidad Tenant

Las propiedades relacionadas con features están en un objeto JSONB:

```typescript
@Column({ type: 'jsonb', nullable: true })
features: {
  watermark?: boolean;
  customization?: boolean;
  advancedReports?: boolean;
  apiAccess?: boolean;
  prioritySupport?: boolean;
};
```

Por lo tanto, siempre acceder como `tenant.features.watermark` no como `tenant.watermark`.

### Nombre de Columna de Storage

En la base de datos la columna se llama `storage_limit_mb`, pero en TypeScript se mapea como `storageLimitMb` (camelCase).

## Conclusión

El problema estaba en 3 áreas diferentes:
1. Backend: Permiso inexistente
2. Backend: Nombres de propiedades incorrectos
3. Frontend: Manejo de errores incompleto

Todas las correcciones han sido aplicadas y verificadas. La página "Mi Plan" ahora funciona correctamente para todos los usuarios de tenants.
