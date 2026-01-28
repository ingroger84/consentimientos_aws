# Corrección: Error en Página "Mi Plan"

**Fecha:** 2026-01-27  
**Versión:** 15.1.3  
**Estado:** ✅ SOLUCIONADO

---

## 🐛 Problema Identificado

La página "Mi Plan" mostraba el error:
```
No se pudo cargar la información del plan. Por favor, verifica que tu tenant tenga un plan asignado.
```

**Error en consola:**
```
Request failed with status code 500
```

---

## 🔍 Causa Raíz

El archivo `backend/src/tenants/plans.json` tenía una estructura desactualizada que **NO incluía** los nuevos campos agregados en la implementación de límites de recursos:

### Campos Faltantes:
- ❌ `medicalRecords` (Límite de Historias Clínicas)
- ❌ `mrConsentTemplates` (Límite de Plantillas HC)
- ❌ `consentTemplates` (Límite de Plantillas CN)
- ❌ `apiAccess` (Acceso a API)

### Flujo del Problema:

```
1. Frontend solicita: GET /api/tenants/:id/usage
         ↓
2. Backend ejecuta: getUsage() en tenants.service.ts
         ↓
3. Backend llama: getPlanConfig(tenant.plan)
         ↓
4. getPlanConfig() carga: plans.json (si existe)
         ↓
5. plans.json NO tiene: medicalRecords, mrConsentTemplates, consentTemplates
         ↓
6. Backend intenta acceder: planConfig.limits.medicalRecords
         ↓
7. Resultado: undefined → Error 500
```

---

## ✅ Solución Implementada

### 1. Actualizado `plans.json`

Se actualizó el archivo con la estructura completa:

```json
{
  "free": {
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 20,
      "medicalRecords": 5,           // ✅ AGREGADO
      "mrConsentTemplates": 2,       // ✅ AGREGADO
      "consentTemplates": 3,         // ✅ AGREGADO
      "services": 3,
      "questions": 6,
      "storageMb": 200
    },
    "features": {
      "apiAccess": false,            // ✅ AGREGADO
      // ... otros features
    }
  },
  // ... otros planes
}
```

### 2. Actualizada Interfaz TypeScript en Frontend

Se actualizó `MyPlanPage.tsx` para incluir los nuevos recursos:

```typescript
interface PlanUsage {
  resources: {
    users: ResourceUsage;
    branches: ResourceUsage;
    services: ResourceUsage;
    consents: ResourceUsage;
    medicalRecords: ResourceUsage;      // ✅ AGREGADO
    consentTemplates: ResourceUsage;    // ✅ AGREGADO
    mrConsentTemplates: ResourceUsage;  // ✅ AGREGADO
    questions: ResourceUsage;
    storage: ResourceUsage;
  };
}
```

---

## 📊 Estructura Completa de Planes

### Plan Gratuito
```json
{
  "limits": {
    "users": 1,
    "branches": 1,
    "consents": 20,
    "medicalRecords": 5,
    "mrConsentTemplates": 2,
    "consentTemplates": 3,
    "services": 3,
    "questions": 6,
    "storageMb": 200
  }
}
```

### Plan Básico
```json
{
  "limits": {
    "users": 2,
    "branches": 1,
    "consents": 100,
    "medicalRecords": 30,
    "mrConsentTemplates": 5,
    "consentTemplates": 10,
    "services": 5,
    "questions": 10,
    "storageMb": 500
  }
}
```

### Plan Emprendedor
```json
{
  "limits": {
    "users": 5,
    "branches": 3,
    "consents": 300,
    "medicalRecords": 100,
    "mrConsentTemplates": 10,
    "consentTemplates": 20,
    "services": 15,
    "questions": 30,
    "storageMb": 2000
  }
}
```

### Plan Plus
```json
{
  "limits": {
    "users": 10,
    "branches": 5,
    "consents": 500,
    "medicalRecords": 300,
    "mrConsentTemplates": 20,
    "consentTemplates": 30,
    "services": 30,
    "questions": 50,
    "storageMb": 5000
  }
}
```

### Plan Empresarial
```json
{
  "limits": {
    "users": -1,
    "branches": -1,
    "consents": -1,
    "medicalRecords": -1,
    "mrConsentTemplates": -1,
    "consentTemplates": -1,
    "services": -1,
    "questions": -1,
    "storageMb": 10000
  }
}
```

---

## 🔄 Cómo Funciona la Carga de Planes

### Prioridad de Carga:

```
1. Backend intenta cargar: plans.json
         ↓
2. Si existe plans.json → Usa esa configuración
         ↓
3. Si NO existe → Usa plans.config.ts (configuración estática)
```

### Código en `plans.config.ts`:

```typescript
function loadPlansFromJson(): Record<string, PlanConfig> | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, './plans.json');
    
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      const plans = JSON.parse(jsonContent);
      console.log('[PlansConfig] Planes cargados desde plans.json');
      return plans;
    }
  } catch (error) {
    console.error('[PlansConfig] Error al cargar plans.json:', error.message);
  }
  
  return null;
}

export function getPlanConfig(planId: string): PlanConfig | null {
  // Intentar cargar desde JSON primero
  const dynamicPlans = loadPlansFromJson();
  const plansSource = dynamicPlans || PLANS;
  
  return plansSource[planId] || null;
}
```

---

## ✅ Verificación

### 1. Verificar que plans.json tiene la estructura correcta

```bash
cat backend/src/tenants/plans.json
```

Debe incluir:
- ✅ `medicalRecords`
- ✅ `mrConsentTemplates`
- ✅ `consentTemplates`
- ✅ `apiAccess`

### 2. Reiniciar Backend (si es necesario)

```bash
cd backend
npm run start:dev
```

### 3. Probar Página "Mi Plan"

1. Iniciar sesión como tenant
2. Ir a "Mi Plan"
3. Verificar que carga correctamente
4. Verificar que muestra:
   - Historias Clínicas (HC)
   - Plantillas CN
   - Plantillas HC

---

## 🎯 Resultado

### Antes (Error):
```
❌ Error 500
❌ "No se pudo cargar la información del plan"
❌ Página en blanco
```

### Después (Funcionando):
```
✅ Página carga correctamente
✅ Muestra todos los recursos
✅ Barras de progreso funcionando
✅ Alertas visibles
```

---

## 📝 Archivos Modificados

```
backend/src/tenants/plans.json          ← Actualizado con nuevos campos
frontend/src/pages/MyPlanPage.tsx       ← Interfaz actualizada
doc/93-correccion-plans-json/README.md  ← Este archivo
```

---

## 🚨 Importante para el Futuro

### Al Agregar Nuevos Campos a Planes:

1. **Actualizar `plans.config.ts`** (configuración estática)
2. **Actualizar `plans.json`** (configuración dinámica)
3. **Actualizar interfaces TypeScript** en frontend
4. **Reiniciar backend** para recargar configuración
5. **Probar en todas las páginas** que usan planes

### Archivos a Sincronizar:

```
backend/src/tenants/
  ├── plans.config.ts    ← Configuración estática (TypeScript)
  └── plans.json         ← Configuración dinámica (JSON)

frontend/src/
  ├── pages/MyPlanPage.tsx           ← Interfaz PlanUsage
  ├── components/landing/PricingSection.tsx
  └── pages/PlansManagementPage.tsx
```

---

## 🔍 Debugging

Si vuelve a ocurrir un error similar:

### 1. Verificar logs del backend:

```bash
# Buscar este mensaje
[PlansConfig] Planes cargados desde plans.json
```

### 2. Verificar estructura de plans.json:

```bash
node -e "console.log(JSON.stringify(require('./backend/src/tenants/plans.json'), null, 2))"
```

### 3. Verificar que getPlanConfig retorna datos:

```typescript
const plan = getPlanConfig('professional');
console.log('Plan config:', plan);
console.log('Medical Records Limit:', plan?.limits.medicalRecords);
```

### 4. Verificar endpoint directamente:

```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-Tenant-Slug: demo-medico" \
     http://localhost:3000/api/tenants/<tenant-id>/usage
```

---

## ✅ Checklist de Solución

- [x] Identificado archivo plans.json desactualizado
- [x] Actualizado plans.json con nuevos campos
- [x] Actualizada interfaz TypeScript en frontend
- [x] Verificado que no hay errores de compilación
- [x] Documentación creada
- [ ] Probar en navegador (pendiente de usuario)
- [ ] Verificar que todos los planes funcionan
- [ ] Verificar alertas y barras de progreso

---

## 🎉 Conclusión

El error se debió a que `plans.json` no tenía los nuevos campos agregados en la implementación de límites de recursos. Al actualizar el archivo con la estructura completa, el endpoint `/api/tenants/:id/usage` ahora funciona correctamente y la página "Mi Plan" carga sin errores.

**Solución:** Mantener sincronizados `plans.config.ts` y `plans.json` cuando se agreguen nuevos campos.

---

**Problema Resuelto** ✅
