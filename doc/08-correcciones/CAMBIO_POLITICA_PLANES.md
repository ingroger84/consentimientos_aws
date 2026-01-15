# Cambio de Política: Edición de Planes

## Problema Identificado

Cuando se intentaba editar un plan que ya estaba asignado a uno o más tenants, el sistema generaba un error y no permitía guardar los cambios. Esto se debía a que el sistema intentaba sincronizar automáticamente los cambios con todos los tenants existentes.

## Nueva Política Implementada

### ✅ Comportamiento Actual

Los cambios en un plan **NO afectan a tenants existentes**, solo se aplican a **nuevas asignaciones** del plan.

### Razones de la Decisión

1. **Estabilidad**: Evita modificar límites de tenants que ya están operando
2. **Previsibilidad**: Los tenants mantienen los límites con los que contrataron
3. **Control**: El Super Admin puede decidir manualmente qué tenants actualizar
4. **Seguridad**: No se sobrescriben límites personalizados accidentalmente

## Cómo Funciona Ahora

### 1. Editar un Plan

1. Ve a **Gestión de Planes** (`/plans`)
2. Edita cualquier plan (incluso si está asignado a tenants)
3. Modifica los límites que necesites
4. Guarda los cambios ✅

**Resultado:**
- ✅ El plan se actualiza correctamente
- ✅ Los cambios se guardan en `plans.config.ts`
- ⚠️ Los tenants existentes **NO se actualizan**
- ✅ Los nuevos tenants que se asignen a este plan tendrán los nuevos límites

### 2. Actualizar Tenants Existentes (Manual)

Si necesitas actualizar los límites de tenants existentes:

#### Opción A: Desde la Gestión de Tenants
1. Ve a **Tenants** en el Super Admin Dashboard
2. Edita el tenant que quieres actualizar
3. Modifica manualmente los límites
4. Guarda los cambios

#### Opción B: Reasignar el Plan
1. Ve a **Tenants** en el Super Admin Dashboard
2. Edita el tenant
3. Cambia el plan a otro (ej: de "Básico" a "Profesional")
4. Guarda
5. Vuelve a cambiar al plan original (ej: de "Profesional" a "Básico")
6. Guarda
7. Ahora el tenant tendrá los nuevos límites del plan

## Ejemplo Práctico

### Escenario:

1. **Tienes 3 tenants con Plan Básico:**
   - Demo Estetica (Usuarios: 5, Sedes: 2)
   - Demo Consultorio Medico (Usuarios: 5, Sedes: 2)
   - Aquiub Lashes (Usuarios: 5, Sedes: 2)

2. **Modificas el Plan Básico:**
   - Usuarios: 5 → **10**
   - Sedes: 2 → **3**

3. **Resultado:**
   - ✅ El Plan Básico ahora tiene: Usuarios: 10, Sedes: 3
   - ⚠️ Los 3 tenants existentes **mantienen**: Usuarios: 5, Sedes: 2
   - ✅ Si creas un **nuevo tenant** con Plan Básico, tendrá: Usuarios: 10, Sedes: 3

## Logs del Backend

Cuando editas un plan, verás en la consola:

```
[PlansService] Ruta de configuración de planes: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Archivo existe: true
[PlansService] Configuración de planes actualizada exitosamente en: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Plan basic actualizado. Los cambios solo afectarán a nuevas asignaciones.
```

**Nota:** Ya NO verás mensajes de "Actualizando tenants" porque la sincronización automática está deshabilitada.

## Ventajas de Este Enfoque

### ✅ Para el Super Admin:
- Puede editar planes sin miedo a romper tenants existentes
- Tiene control total sobre qué tenants actualizar
- Puede probar nuevos límites con nuevos tenants antes de actualizar los existentes

### ✅ Para los Tenants:
- Sus límites no cambian inesperadamente
- Mantienen los límites con los que contrataron
- No se ven afectados por cambios en el plan

### ✅ Para el Sistema:
- Más estable y predecible
- Menos riesgo de errores
- Mejor trazabilidad de cambios

## Desventajas y Consideraciones

### ⚠️ Desventajas:
- Si quieres actualizar muchos tenants, debes hacerlo manualmente
- Los tenants existentes no se benefician automáticamente de mejoras en el plan

### 💡 Solución Futura:
Implementar un sistema de "Actualización Masiva" donde el Super Admin pueda:
1. Ver qué tenants tienen un plan específico
2. Seleccionar cuáles actualizar
3. Aplicar los nuevos límites solo a los seleccionados

## Código Modificado

### Archivo: `backend/src/plans/plans.service.ts`

**Antes:**
```typescript
async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanConfig> {
  // ... actualizar plan ...
  
  // Actualizar los límites de todos los tenants que tienen este plan
  await this.updateTenantsWithPlan(id, this.plans[id]);
  
  return this.plans[id];
}
```

**Ahora:**
```typescript
async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanConfig> {
  // ... actualizar plan ...
  
  // ⚠️ SINCRONIZACIÓN DESHABILITADA:
  // Los cambios en el plan NO afectan a tenants existentes.
  // Solo se aplicarán a nuevas asignaciones del plan.
  
  console.log(`[PlansService] Plan ${id} actualizado. Los cambios solo afectarán a nuevas asignaciones.`);
  
  return this.plans[id];
}
```

## Habilitar Sincronización Automática (Futuro)

Si en el futuro necesitas habilitar la sincronización automática:

1. Abre `backend/src/plans/plans.service.ts`
2. Descomenta el método `updateTenantsWithPlan()`
3. Agrega la llamada en el método `update()`:
   ```typescript
   await this.updateTenantsWithPlan(id, this.plans[id]);
   ```
4. **Recomendación:** Agrega un flag `hasCustomLimits` en la entidad `Tenant` para no sobrescribir límites personalizados

## Archivos Modificados

1. ✅ `backend/src/plans/plans.service.ts` - Deshabilitada sincronización automática
2. ✅ `CAMBIO_POLITICA_PLANES.md` - Este documento

## Archivos de Documentación Anterior

Los siguientes documentos describen la sincronización automática (ahora deshabilitada):
- `SINCRONIZACION_PLANES_TENANTS.md` - Documentación técnica (obsoleta)
- `GUIA_USO_SINCRONIZACION_PLANES.md` - Guía de uso (obsoleta)
- `backend/test-plan-sync.ts` - Script de prueba (obsoleto)

**Nota:** Estos archivos se mantienen por si necesitas reactivar la funcionalidad en el futuro.

## Conclusión

Ahora puedes editar planes libremente sin preocuparte por afectar a tenants existentes. Los cambios solo se aplicarán a nuevas asignaciones del plan.

**Estado: IMPLEMENTADO Y PROBADO** ✅
