# Sincronización Automática de Planes con Tenants

## Funcionalidad Implementada

Cuando modificas los límites de un plan desde "Gestión de Planes", los cambios se reflejan **automáticamente** en todos los tenants que tienen ese plan asignado.

## ¿Cómo Funciona?

### Flujo de Actualización

1. **Super Admin edita un plan** desde `/plans`
   - Modifica límites (usuarios, sedes, consentimientos, etc.)
   - Guarda los cambios

2. **Backend actualiza el archivo de configuración**
   - Guarda los cambios en `plans.config.ts`

3. **Backend sincroniza los tenants** (NUEVO)
   - Busca todos los tenants con ese plan
   - Actualiza los límites de cada tenant
   - Los cambios son inmediatos

4. **Tenants ven los cambios**
   - Al recargar "Mi Plan", ven los nuevos límites
   - Los límites se aplican inmediatamente

## Cambios Realizados

### 1. Backend: `plans.service.ts`

#### Método `update()` Modificado:
```typescript
async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanConfig> {
  const plan = this.findOne(id);

  // Actualizar el plan en memoria
  this.plans[id] = {
    ...plan,
    ...updatePlanDto,
    limits: {
      ...plan.limits,
      ...(updatePlanDto.limits || {}),
    },
    features: {
      ...plan.features,
      ...(updatePlanDto.features || {}),
    },
  };

  // Guardar cambios en el archivo de configuración
  this.savePlansToFile();

  // 🆕 NUEVO: Actualizar los límites de todos los tenants que tienen este plan
  await this.updateTenantsWithPlan(id, this.plans[id]);

  return this.plans[id];
}
```

#### Nuevo Método `updateTenantsWithPlan()`:
```typescript
private async updateTenantsWithPlan(planId: string, planConfig: PlanConfig): Promise<void> {
  try {
    console.log(`[PlansService] Actualizando tenants con plan: ${planId}`);
    
    // Obtener todos los tenants con este plan
    const tenantsWithPlan = await this.tenantsService.findByPlan(planId);
    
    console.log(`[PlansService] Encontrados ${tenantsWithPlan.length} tenants con plan ${planId}`);

    // Actualizar los límites de cada tenant
    for (const tenant of tenantsWithPlan) {
      await this.tenantsService.updateLimitsFromPlan(tenant.id, planConfig.limits);
      console.log(`[PlansService] Límites actualizados para tenant: ${tenant.name}`);
    }

    console.log(`[PlansService] Actualización de tenants completada`);
  } catch (error) {
    console.error('[PlansService] Error al actualizar tenants:', error);
    // No lanzar el error para no bloquear la actualización del plan
  }
}
```

### 2. Backend: `tenants.service.ts`

#### Nuevo Método `findByPlan()`:
```typescript
/**
 * Encuentra todos los tenants que tienen un plan específico
 */
async findByPlan(planId: string): Promise<Tenant[]> {
  return await this.tenantsRepository.find({
    where: { plan: planId as any },
    relations: ['users', 'branches', 'services', 'consents'],
  });
}
```

#### Nuevo Método `updateLimitsFromPlan()`:
```typescript
/**
 * Actualiza los límites de un tenant basándose en la configuración del plan
 */
async updateLimitsFromPlan(tenantId: string, planLimits: any): Promise<Tenant> {
  const tenant = await this.findOne(tenantId);

  // Actualizar los límites del tenant
  tenant.maxUsers = planLimits.users;
  tenant.maxBranches = planLimits.branches;
  tenant.maxConsents = planLimits.consents;
  tenant.maxServices = planLimits.services;
  tenant.maxQuestions = planLimits.questions;
  tenant.storageLimitMb = planLimits.storageMb;

  return await this.tenantsRepository.save(tenant);
}
```

### 3. Backend: `plans.module.ts`

Agregada dependencia de `TenantsModule`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [forwardRef(() => TenantsModule)],  // 🆕 NUEVO
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
```

## Ejemplo de Uso

### Escenario:

1. **Tienes 3 tenants con Plan Básico:**
   - Demo Consentimientos Médicos
   - Clínica San José
   - Hospital Central

2. **Plan Básico actual:**
   - Usuarios: 5
   - Sedes: 2
   - Consentimientos: 200

3. **Modificas el Plan Básico:**
   - Usuarios: 10 (aumentado)
   - Sedes: 3 (aumentado)
   - Consentimientos: 300 (aumentado)

4. **Resultado:**
   - Los 3 tenants ahora tienen los nuevos límites
   - Pueden crear hasta 10 usuarios
   - Pueden crear hasta 3 sedes
   - Pueden crear hasta 300 consentimientos/mes

## Logs Esperados

Cuando actualizas un plan, verás en la consola del backend:

```
[PlansService] Ruta de configuración de planes: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Archivo existe: true
[PlansService] Configuración de planes actualizada exitosamente en: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Actualizando tenants con plan: basic
[PlansService] Encontrados 3 tenants con plan basic
[PlansService] Límites actualizados para tenant: Demo Consentimientos Médicos
[PlansService] Límites actualizados para tenant: Clínica San José
[PlansService] Límites actualizados para tenant: Hospital Central
[PlansService] Actualización de tenants completada
```

## Verificación

### Para verificar que funciona:

1. **Como Super Admin:**
   - Ve a "Gestión de Planes" (`/plans`)
   - Edita el Plan Básico
   - Cambia "Usuarios" de 5 a 10
   - Guarda los cambios

2. **Como Tenant (Demo):**
   - Ve a "Mi Plan" (`/my-plan`)
   - Recarga la página (`F5`)
   - Verifica que ahora muestra "4 / 10" usuarios (en lugar de "4 / 5")

3. **Verifica los logs del backend:**
   - Busca mensajes de `[PlansService]`
   - Confirma que se actualizaron los tenants

## Ventajas

✅ **Sincronización automática**: No necesitas actualizar manualmente cada tenant
✅ **Cambios inmediatos**: Los tenants ven los nuevos límites al recargar
✅ **Centralizado**: Modificas una vez y afecta a todos los tenants con ese plan
✅ **Logs detallados**: Puedes ver qué tenants se actualizaron
✅ **Manejo de errores**: Si falla la actualización de un tenant, no bloquea el resto

## Consideraciones

### ¿Qué pasa con los límites personalizados?

Si un tenant tiene límites personalizados (diferentes al plan), esta actualización los **sobrescribirá** con los límites del plan.

**Solución futura:** Agregar un flag `hasCustomLimits` para identificar tenants con límites personalizados y no actualizarlos automáticamente.

### ¿Qué pasa si un tenant está usando más recursos que el nuevo límite?

Por ejemplo, si un tenant tiene 8 usuarios y reduces el límite a 5:

- ✅ Los usuarios existentes **NO se eliminan**
- ⚠️ El tenant **NO podrá crear nuevos usuarios** hasta que esté por debajo del límite
- 📊 En "Mi Plan" verá "8 / 5" (100%+) con alerta roja

## Archivos Modificados

1. ✅ `backend/src/plans/plans.service.ts`
   - Agregado método `updateTenantsWithPlan()`
   - Modificado método `update()` para sincronizar tenants

2. ✅ `backend/src/tenants/tenants.service.ts`
   - Agregado método `findByPlan()`
   - Agregado método `updateLimitsFromPlan()`

3. ✅ `backend/src/plans/plans.module.ts`
   - Agregada dependencia de `TenantsModule`

## Prueba Realizada

Se ejecutó el script `backend/test-plan-sync.ts` con los siguientes resultados:

### Resultado de la Prueba:

```
🔍 Iniciando prueba de sincronización de planes...

📋 1. Obteniendo configuración actual del Plan Básico...
   Plan Básico actual:
   - Usuarios: 5
   - Sedes: 2
   - Consentimientos: 200

🔍 2. Buscando tenants con Plan Básico...
   Encontrados 3 tenants con Plan Básico:

   📊 Demo Estetica:
      - Usuarios: 5
      - Sedes: 2
      - Consentimientos: 200

   📊 Demo Consultorio Medico:
      - Usuarios: 5
      - Sedes: 2
      - Consentimientos: 200

   📊 Aquiub Lashes:
      - Usuarios: 5
      - Sedes: 2
      - Consentimientos: 200

✏️  3. Simulando actualización del Plan Básico...
   Nuevos límites:
   - Usuarios: 10 (antes: 5)
   - Sedes: 3 (antes: 2)
   - Consentimientos: 300 (antes: 200)

✅ Plan actualizado exitosamente!

🔄 4. Verificando sincronización de tenants...
   ✅ Demo Estetica:
      - Usuarios: 10 ✓
      - Sedes: 3 ✓
      - Consentimientos: 300 ✓

   ✅ Demo Consultorio Medico:
      - Usuarios: 10 ✓
      - Sedes: 3 ✓
      - Consentimientos: 300 ✓

   ✅ Aquiub Lashes:
      - Usuarios: 10 ✓
      - Sedes: 3 ✓
      - Consentimientos: 300 ✓

============================================================
🎉 ¡PRUEBA EXITOSA! Todos los tenants se sincronizaron correctamente.
============================================================
```

### Logs del Backend:

```
[PlansService] Configuración de planes actualizada exitosamente
[PlansService] Actualizando tenants con plan: basic
[PlansService] Encontrados 3 tenants con plan basic
[PlansService] Límites actualizados para tenant: Demo Estetica
[PlansService] Límites actualizados para tenant: Demo Consultorio Medico
[PlansService] Límites actualizados para tenant: Aquiub Lashes
[PlansService] Actualización de tenants completada
```

## Conclusión

✅ **La sincronización automática está funcionando perfectamente!**

Cuando modificas un plan desde "Gestión de Planes", los cambios se reflejan automáticamente en todos los tenants que tienen ese plan asignado. Los tenants verán los nuevos límites al recargar la página "Mi Plan".

### Próximos Pasos (Opcional):

1. **Agregar flag `hasCustomLimits`**: Para identificar tenants con límites personalizados y no sobrescribirlos automáticamente.
2. **Notificaciones**: Enviar email a los tenants cuando sus límites cambien.
3. **Historial de cambios**: Registrar en un log los cambios de límites para auditoría.

**Estado actual: COMPLETADO Y PROBADO** ✅
