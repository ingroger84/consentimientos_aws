# Estandarización de Nombres de Planes

## Descripción

Se implementó un sistema centralizado para gestionar los nombres de los planes en toda la aplicación, asegurando que los nombres mostrados en el frontend coincidan exactamente con los definidos en la configuración del backend.

## Nombres de Planes Oficiales

Según la configuración en `backend/src/tenants/plans.config.ts`:

| ID | Nombre Oficial | Descripción |
|----|---------------|-------------|
| `free` | **Gratuito** | Ideal para probar el sistema |
| `basic` | **Básico** | Para pequeñas clínicas, consultorios, spa, estéticas, etc |
| `professional` | **Emprendedor** | Para clínicas medianas y centros médicos |
| `enterprise` | **Plus** | Para grandes clínicas y hospitales |
| `custom` | **Empresarial** | Solución personalizada para grandes organizaciones |

## Implementación

### 1. Archivo de Utilidades Centralizado

**Ubicación:** `frontend/src/utils/plan-names.ts`

```typescript
import { TenantPlan } from '@/types/tenant';

export const PLAN_NAMES: Record<TenantPlan, string> = {
  [TenantPlan.FREE]: 'Gratuito',
  [TenantPlan.BASIC]: 'Básico',
  [TenantPlan.PROFESSIONAL]: 'Emprendedor',
  [TenantPlan.ENTERPRISE]: 'Plus',
  [TenantPlan.CUSTOM]: 'Empresarial',
};

export function getPlanName(plan: TenantPlan | string): string {
  return PLAN_NAMES[plan as TenantPlan] || plan;
}

export function getPlanColor(plan: TenantPlan): string {
  // Retorna clases de Tailwind para el color del badge
}
```

### 2. Componentes Actualizados

#### TenantCard
- Usa `getPlanName()` para mostrar el nombre del plan
- Usa `getPlanColor()` para el color del badge

#### TenantsPage
- Filtro de planes usa nombres oficiales
- Importa y usa `getPlanName()`

#### TenantStatsModal
- Muestra el nombre oficial del plan en las estadísticas

#### MyPlanPage
- Muestra el nombre oficial del plan en el encabezado

## Uso

### Importar la Utilidad

```typescript
import { getPlanName, getPlanColor } from '@/utils/plan-names';
```

### Obtener Nombre del Plan

```typescript
// Desde un enum
const planName = getPlanName(TenantPlan.BASIC); // "Básico"

// Desde un string
const planName = getPlanName('professional'); // "Emprendedor"

// En JSX
<span>{getPlanName(tenant.plan)}</span>
```

### Obtener Color del Badge

```typescript
const colorClasses = getPlanColor(TenantPlan.ENTERPRISE);
// "bg-yellow-100 text-yellow-800"

// En JSX
<span className={getPlanColor(tenant.plan)}>
  {getPlanName(tenant.plan)}
</span>
```

## Colores de Badges por Plan

| Plan | Color | Clases Tailwind |
|------|-------|----------------|
| Gratuito | Gris | `bg-gray-100 text-gray-800` |
| Básico | Azul | `bg-blue-100 text-blue-800` |
| Emprendedor | Púrpura | `bg-purple-100 text-purple-800` |
| Plus | Amarillo | `bg-yellow-100 text-yellow-800` |
| Empresarial | Verde | `bg-green-100 text-green-800` |

## Archivos Modificados

### Frontend
- ✅ `frontend/src/utils/plan-names.ts` (nuevo)
- ✅ `frontend/src/components/TenantCard.tsx`
- ✅ `frontend/src/pages/TenantsPage.tsx`
- ✅ `frontend/src/components/TenantStatsModal.tsx`
- ✅ `frontend/src/pages/MyPlanPage.tsx`

### Backend
- ℹ️ `backend/src/tenants/plans.config.ts` (sin cambios - fuente de verdad)

## Beneficios

1. **Consistencia**: Todos los componentes usan los mismos nombres
2. **Mantenibilidad**: Un solo lugar para actualizar nombres
3. **Escalabilidad**: Fácil agregar nuevos planes
4. **Internacionalización**: Base para futura traducción
5. **Tipado**: TypeScript garantiza el uso correcto

## Cómo Actualizar Nombres de Planes

### 1. Actualizar Backend (Fuente de Verdad)

```typescript
// backend/src/tenants/plans.config.ts
export const PLANS: Record<string, PlanConfig> = {
  "basic": {
    "id": "basic",
    "name": "Básico", // ← Cambiar aquí
    // ...
  },
};
```

### 2. Actualizar Frontend

```typescript
// frontend/src/utils/plan-names.ts
export const PLAN_NAMES: Record<TenantPlan, string> = {
  [TenantPlan.BASIC]: 'Básico', // ← Cambiar aquí
  // ...
};
```

### 3. Verificar

```bash
# Buscar usos hardcodeados
grep -r "Basic\|Professional\|Enterprise" frontend/src/
```

## Validación

### Verificar Consistencia

```typescript
// En consola del navegador
import { getPlanName } from '@/utils/plan-names';
import { TenantPlan } from '@/types/tenant';

Object.values(TenantPlan).forEach(plan => {
  console.log(`${plan}: ${getPlanName(plan)}`);
});
```

**Salida esperada:**
```
free: Gratuito
basic: Básico
professional: Emprendedor
enterprise: Plus
custom: Empresarial
```

## Troubleshooting

### Problema: Nombres antiguos aún visibles

**Solución:**
1. Limpiar caché del navegador (Ctrl + Shift + R)
2. Verificar que el componente importe `getPlanName`
3. Verificar que use la función en lugar de hardcodear

### Problema: Error de TypeScript

**Solución:**
```typescript
// ❌ Incorrecto
const name = getPlanName(tenant.plan as string);

// ✅ Correcto
const name = getPlanName(tenant.plan);
```

### Problema: Color no se aplica

**Solución:**
```typescript
// ❌ Incorrecto
<span className={`badge ${getPlanColor(plan)}`}>

// ✅ Correcto
<span className={getPlanColor(plan)}>
```

## Mejoras Futuras

### Internacionalización (i18n)

```typescript
// Preparado para i18n
export const PLAN_NAMES: Record<string, Record<TenantPlan, string>> = {
  es: {
    [TenantPlan.BASIC]: 'Básico',
    // ...
  },
  en: {
    [TenantPlan.BASIC]: 'Basic',
    // ...
  },
};

export function getPlanName(plan: TenantPlan, locale = 'es'): string {
  return PLAN_NAMES[locale][plan] || plan;
}
```

### Sincronización Automática

Crear un script que valide que los nombres en frontend coincidan con backend:

```typescript
// scripts/validate-plan-names.ts
import { PLANS } from '../backend/src/tenants/plans.config';
import { PLAN_NAMES } from '../frontend/src/utils/plan-names';

// Validar que todos los planes del backend estén en el frontend
Object.entries(PLANS).forEach(([id, config]) => {
  const frontendName = PLAN_NAMES[id];
  const backendName = config.name;
  
  if (frontendName !== backendName) {
    console.error(`Mismatch: ${id} - Frontend: "${frontendName}", Backend: "${backendName}"`);
  }
});
```

## Conclusión

La estandarización de nombres de planes asegura una experiencia consistente para los usuarios y facilita el mantenimiento del código. Todos los componentes ahora usan los nombres oficiales definidos en la configuración del backend.

