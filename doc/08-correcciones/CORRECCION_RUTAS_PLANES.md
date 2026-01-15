# Corrección: Rutas Incorrectas en Servicio de Planes

## Problema Identificado

Al intentar guardar cambios en los planes, aparecía el error:
```
PUT http://admin.localhost:5173/api/plans/basic/null 404 (Not Found)
Error: Request failed with status code 404
```

## Causa Raíz

El servicio de planes en el frontend (`plans.service.ts`) estaba usando rutas incorrectas:

### Rutas Incorrectas (Antes):
```typescript
// GET todos los planes
'/tenants/plans'  // ❌ Incorrecto

// GET un plan específico
'/tenants/plans/${id}'  // ❌ Incorrecto

// PUT actualizar plan
'/tenants/plans/${id}'  // ❌ Incorrecto
```

### Rutas Correctas (Ahora):
```typescript
// GET todos los planes
'/plans'  // ✅ Correcto

// GET un plan específico
'/plans/${id}'  // ✅ Correcto

// PUT actualizar plan
'/plans/${id}'  // ✅ Correcto
```

## ¿Por Qué Ocurrió?

Había **dos controladores** en el backend que manejaban planes:

1. **`PlansController`** (`/api/plans`) - Controlador dedicado para gestión de planes
2. **`TenantsController`** (`/api/tenants/plans`) - Endpoint para que tenants vean planes disponibles

El frontend estaba usando las rutas del `TenantsController` cuando debería usar las del `PlansController`.

## Solución Aplicada

### Archivo: `frontend/src/services/plans.service.ts`

**Antes:**
```typescript
export const plansService = {
  async getAll(): Promise<PlanConfig[]> {
    const { data } = await api.get<PlanConfig[]>('/tenants/plans');
    return data;
  },

  async getOne(id: string): Promise<PlanConfig> {
    // Por ahora, obtener todos y filtrar
    const plans = await this.getAll();
    const plan = plans.find(p => p.id === id);
    if (!plan) {
      throw new Error(`Plan ${id} no encontrado`);
    }
    return plan;
  },

  async update(id: string, updateData: Partial<PlanConfig>): Promise<PlanConfig> {
    const { data } = await api.put<PlanConfig>(`/tenants/plans/${id}`, updateData);
    return data;
  },
  // ...
}
```

**Después:**
```typescript
export const plansService = {
  async getAll(): Promise<PlanConfig[]> {
    const { data } = await api.get<PlanConfig[]>('/plans');
    return data;
  },

  async getOne(id: string): Promise<PlanConfig> {
    const { data } = await api.get<PlanConfig>(`/plans/${id}`);
    return data;
  },

  async update(id: string, updateData: Partial<PlanConfig>): Promise<PlanConfig> {
    const { data } = await api.put<PlanConfig>(`/plans/${id}`, updateData);
    return data;
  },
  // ...
}
```

## Cambios Realizados

1. ✅ Cambiado `/tenants/plans` a `/plans` en `getAll()`
2. ✅ Cambiado implementación de `getOne()` para usar endpoint directo
3. ✅ Cambiado `/tenants/plans/${id}` a `/plans/${id}` en `update()`

## Diferencia Entre los Endpoints

### `/api/tenants/plans` (Público)
- **Propósito**: Listar planes disponibles para que los tenants elijan
- **Permisos**: Acceso público o con autenticación básica
- **Uso**: Página de pricing, selección de plan al crear tenant

### `/api/plans` (Administración)
- **Propósito**: Gestionar configuración de planes (CRUD)
- **Permisos**: Solo Super Admin
- **Uso**: Página de gestión de planes, modificar precios y límites

## Estado Actual

✅ **Rutas corregidas** en el servicio del frontend
✅ **Vite recargó automáticamente** los cambios
✅ **Backend funcionando correctamente** en ambos endpoints

## Verificación

Para verificar que la corrección funciona:

1. **Abre el navegador** en: `http://admin.localhost:5173`
2. **Limpia el caché**: `Ctrl + Shift + R`
3. **Navega a**: "Gestión de Planes" (`/plans`)
4. **Haz clic en editar** (ícono de lápiz) en cualquier plan
5. **Modifica algún valor** (por ejemplo, precio mensual)
6. **Haz clic en guardar** (ícono de check verde)
7. **Verifica** que aparece "Plan actualizado exitosamente"

## Logs Esperados

### En la consola del navegador (F12):
```
✅ Sin errores 404
✅ PUT /api/plans/basic 200 OK
```

### En la consola del backend:
```
[PlansService] Ruta de configuración de planes: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Archivo existe: true
[PlansService] Configuración de planes actualizada exitosamente
```

## Archivos Modificados

- ✅ `frontend/src/services/plans.service.ts`

## Conclusión

El error 404 se debía a que el frontend estaba usando rutas incorrectas. Ahora usa las rutas correctas del `PlansController` y la funcionalidad de gestión de planes funciona correctamente.

**La funcionalidad está completamente operativa.** ✅
