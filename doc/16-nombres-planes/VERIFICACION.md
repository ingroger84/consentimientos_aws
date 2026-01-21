# Verificación de Nombres de Planes

## Checklist de Verificación

### ✅ Componentes del Frontend

#### 1. TenantCard
**Ubicación:** Tarjetas de tenants en la página de Tenants

**Qué verificar:**
- [ ] El badge del plan muestra el nombre correcto
- [ ] Los colores de los badges son correctos

**Nombres esperados:**
- Gratuito (gris)
- Básico (azul)
- Emprendedor (púrpura)
- Plus (amarillo)
- Empresarial (verde)

**Cómo probar:**
1. Ir a http://admin.localhost:5173/tenants
2. Ver las tarjetas de tenants
3. Verificar que los badges muestren los nombres correctos

---

#### 2. TenantsPage - Filtro de Planes
**Ubicación:** Dropdown de filtro en la página de Tenants

**Qué verificar:**
- [ ] El dropdown muestra los nombres correctos
- [ ] El filtro funciona correctamente

**Nombres esperados en el dropdown:**
- Todos los planes
- Gratuito
- Básico
- Emprendedor
- Plus
- Empresarial

**Cómo probar:**
1. Ir a http://admin.localhost:5173/tenants
2. Abrir el dropdown "Todos los planes"
3. Verificar que las opciones muestren los nombres correctos
4. Seleccionar un plan y verificar que filtre correctamente

---

#### 3. TenantStatsModal
**Ubicación:** Modal de estadísticas al hacer clic en "Ver Estadísticas"

**Qué verificar:**
- [ ] La sección "Información del Plan" muestra el nombre correcto

**Cómo probar:**
1. Ir a http://admin.localhost:5173/tenants
2. Hacer clic en el menú (⋮) de un tenant
3. Seleccionar "Ver Estadísticas"
4. Verificar que el campo "Plan:" muestre el nombre correcto

---

#### 4. MyPlanPage
**Ubicación:** Página "Mi Plan" para usuarios de tenant

**Qué verificar:**
- [ ] El encabezado muestra "Plan [Nombre]" correctamente

**Cómo probar:**
1. Iniciar sesión como usuario de un tenant
2. Ir a "Mi Plan"
3. Verificar que el encabezado muestre el nombre correcto del plan

---

### ✅ Backend

#### 1. Configuración de Planes
**Archivo:** `backend/src/tenants/plans.config.ts`

**Qué verificar:**
- [ ] Los nombres en el archivo coinciden con los del frontend

**Nombres en el backend:**
```typescript
"free": { name: "Gratuito" }
"basic": { name: "Básico" }
"professional": { name: "Emprendedor" }
"enterprise": { name: "Plus" }
"custom": { name: "Empresarial" }
```

---

## Pruebas Automatizadas

### Script de Consola del Navegador

Ejecutar en la consola del navegador para verificar los nombres:

```javascript
// Verificar que getPlanName funciona correctamente
const plans = ['free', 'basic', 'professional', 'enterprise', 'custom'];
const expectedNames = ['Gratuito', 'Básico', 'Emprendedor', 'Plus', 'Empresarial'];

plans.forEach((plan, index) => {
  const name = getPlanName(plan);
  const expected = expectedNames[index];
  const status = name === expected ? '✅' : '❌';
  console.log(`${status} ${plan}: ${name} (esperado: ${expected})`);
});
```

**Salida esperada:**
```
✅ free: Gratuito (esperado: Gratuito)
✅ basic: Básico (esperado: Básico)
✅ professional: Emprendedor (esperado: Emprendedor)
✅ enterprise: Plus (esperado: Plus)
✅ custom: Empresarial (esperado: Empresarial)
```

---

## Casos de Prueba

### Caso 1: Crear Nuevo Tenant
1. Ir a Tenants
2. Hacer clic en "Nuevo Tenant"
3. Verificar que los planes muestren los nombres correctos
4. Crear un tenant con plan "Básico"
5. Verificar que la tarjeta muestre "Básico"

### Caso 2: Filtrar por Plan
1. Ir a Tenants
2. Seleccionar "Emprendedor" en el filtro
3. Verificar que solo se muestren tenants con plan "Emprendedor"
4. Verificar que las tarjetas muestren "Emprendedor"

### Caso 3: Ver Estadísticas
1. Ir a Tenants
2. Abrir estadísticas de un tenant
3. Verificar que el plan se muestre con el nombre correcto

### Caso 4: Mi Plan (Usuario Tenant)
1. Iniciar sesión como usuario de tenant
2. Ir a "Mi Plan"
3. Verificar que el encabezado muestre el nombre correcto

---

## Problemas Comunes y Soluciones

### Problema: Nombres antiguos aún visibles

**Síntomas:**
- Se muestran "Free", "Basic", "Professional", "Enterprise" en lugar de los nombres en español

**Solución:**
1. Limpiar caché del navegador (Ctrl + Shift + R)
2. Verificar que el componente importe `getPlanName`
3. Verificar que use la función en lugar de hardcodear

**Verificar en código:**
```typescript
// ❌ Incorrecto
<span>{tenant.plan}</span>

// ✅ Correcto
import { getPlanName } from '@/utils/plan-names';
<span>{getPlanName(tenant.plan)}</span>
```

---

### Problema: Error de TypeScript

**Síntomas:**
- Error: "Property 'plan' does not exist on type..."

**Solución:**
```typescript
// ❌ Incorrecto
const name = getPlanName(tenant.plan as string);

// ✅ Correcto
const name = getPlanName(tenant.plan);
```

---

### Problema: Colores incorrectos

**Síntomas:**
- Los badges tienen colores incorrectos o no tienen color

**Solución:**
```typescript
// ❌ Incorrecto
<span className={`badge ${getPlanColor(plan)}`}>

// ✅ Correcto
<span className={getPlanColor(plan)}>
```

---

## Registro de Verificación

### Fecha: _______________
### Verificado por: _______________

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| TenantCard | ⬜ | |
| TenantsPage - Filtro | ⬜ | |
| TenantStatsModal | ⬜ | |
| MyPlanPage | ⬜ | |
| Backend Config | ⬜ | |

**Leyenda:**
- ✅ Verificado y correcto
- ⚠️ Verificado con observaciones
- ❌ Error encontrado
- ⬜ Pendiente de verificación

---

## Comandos Útiles

### Buscar usos hardcodeados
```bash
# En el directorio del proyecto
grep -r "Free\|Basic\|Professional\|Enterprise" frontend/src/ --include="*.tsx" --include="*.ts"
```

### Verificar imports de getPlanName
```bash
grep -r "getPlanName" frontend/src/ --include="*.tsx" --include="*.ts"
```

### Verificar que todos los componentes usen la función
```bash
# Buscar componentes que muestren tenant.plan directamente
grep -r "tenant\.plan" frontend/src/ --include="*.tsx" -A 2 -B 2
```

---

## Conclusión

Una vez completada esta verificación, todos los nombres de planes deben mostrarse consistentemente en toda la aplicación usando los nombres oficiales definidos en la configuración del backend.

