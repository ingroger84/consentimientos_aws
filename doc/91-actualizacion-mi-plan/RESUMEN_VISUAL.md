# Resumen Visual: Actualización "Mi Plan"

**Versión:** 15.1.1  
**Fecha:** 2026-01-27

---

## 🎯 Objetivo Completado

Actualizar la página "Mi Plan" para mostrar los nuevos recursos integrados en el sistema de planes.

---

## 📊 Antes vs Después

### ANTES (15.1.0)
```
┌─────────────────────────────────────┐
│  Mi Plan - Plan Emprendedor         │
├─────────────────────────────────────┤
│  ✓ Usuarios: 2/5                    │
│  ✓ Sedes: 1/3                       │
│  ✓ Servicios: 3/15                  │
│  ✓ Consentimientos: 45/300          │
│  ✓ Almacenamiento: 150/2000 MB      │
└─────────────────────────────────────┘
```

### DESPUÉS (15.1.1)
```
┌─────────────────────────────────────┐
│  Mi Plan - Plan Emprendedor         │
├─────────────────────────────────────┤
│  ✓ Usuarios: 2/5                    │
│  ✓ Sedes: 1/3                       │
│  ✓ Servicios: 3/15                  │
│  ✓ Consentimientos (CN): 45/300     │
│  📄 Historias Clínicas (HC): 25/100 │ ← NUEVO
│  📋 Plantillas CN: 8/20             │ ← NUEVO
│  📝 Plantillas HC: 5/10             │ ← NUEVO
│  ✓ Almacenamiento: 150/2000 MB      │
└─────────────────────────────────────┘
```

---

## 🎨 Diseño de Tarjetas

### Tarjeta Normal (0-79%)
```
┌─────────────────────────────────────────┐
│  📄  HISTORIAS CLÍNICAS (HC)      25%  │
│                                         │
│  25 / 100                               │
│  █████░░░░░░░░░░░░░░  (verde)          │
└─────────────────────────────────────────┘
```

### Tarjeta Warning (80-99%)
```
┌─────────────────────────────────────────┐
│  📋  PLANTILLAS CN                85%  │
│                                         │
│  17 / 20                                │
│  █████████████████░░░  (amarillo)       │
│  ⚠️ Cerca del límite - Considera       │
│     actualizar tu plan                  │
└─────────────────────────────────────────┘
```

### Tarjeta Critical (100%)
```
┌─────────────────────────────────────────┐
│  📝  PLANTILLAS HC               100%  │
│                                         │
│  10 / 10                                │
│  ████████████████████  (rojo)           │
│  ⚠️ Límite alcanzado - No puedes       │
│     crear más                           │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  MyPlanPage.tsx                                         │
│    ↓                                                    │
│  loadUsage()                                            │
│    ↓                                                    │
│  GET /api/tenants/:id/usage                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
│  TenantsController                                      │
│    ↓                                                    │
│  TenantsService.getUsage()                              │
│    ↓                                                    │
│  1. Contar recursos desde DB:                          │
│     - medicalRecords                                    │
│     - consentTemplates                                  │
│     - mrConsentTemplates                                │
│    ↓                                                    │
│  2. Obtener límites del plan:                          │
│     - getPlanConfig(tenant.plan)                        │
│    ↓                                                    │
│  3. Calcular porcentajes                               │
│    ↓                                                    │
│  4. Generar alertas:                                   │
│     - generateUsageAlerts()                             │
│    ↓                                                    │
│  5. Retornar JSON                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  RESPUESTA JSON                         │
│  {                                                      │
│    plan: { id, name, status, ... },                    │
│    resources: {                                         │
│      medicalRecords: {                                  │
│        current: 25,                                     │
│        max: 100,                                        │
│        percentage: 25,                                  │
│        status: 'normal'                                 │
│      },                                                 │
│      consentTemplates: { ... },                         │
│      mrConsentTemplates: { ... },                       │
│      ...                                                │
│    },                                                   │
│    alerts: [...]                                        │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  MyPlanPage.tsx                                         │
│    ↓                                                    │
│  Renderizar tarjetas con:                              │
│    - Iconos                                             │
│    - Labels                                             │
│    - Contadores                                         │
│    - Barras de progreso                                 │
│    - Alertas                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Límites por Plan

```
┌──────────────┬─────┬──────────────┬──────────────┐
│ Plan         │ HC  │ Plantillas HC│ Plantillas CN│
├──────────────┼─────┼──────────────┼──────────────┤
│ Gratuito     │   5 │      2       │      3       │
│ Básico       │  30 │      5       │     10       │
│ Emprendedor  │ 100 │     10       │     20       │
│ Plus         │ 300 │     20       │     30       │
│ Empresarial  │  ∞  │      ∞       │      ∞       │
└──────────────┴─────┴──────────────┴──────────────┘
```

---

## 🎨 Colores de Estado

```
┌─────────────┬────────────┬──────────────────────┐
│ Estado      │ Rango      │ Color                │
├─────────────┼────────────┼──────────────────────┤
│ Normal      │ 0-79%      │ 🟢 Verde (bg-green)  │
│ Warning     │ 80-99%     │ 🟡 Amarillo (bg-yellow)│
│ Critical    │ 100%       │ 🔴 Rojo (bg-red)     │
└─────────────┴────────────┴──────────────────────┘
```

---

## 🔔 Sistema de Alertas

### Alertas de Warning (80%)
```typescript
{
  type: 'warning',
  resource: 'medicalRecords',
  message: 'Estás cerca del límite de historias clínicas (80/100)'
}
```

### Alertas de Critical (100%)
```typescript
{
  type: 'critical',
  resource: 'medicalRecords',
  message: 'Has alcanzado el límite de historias clínicas (100/100)'
}
```

### Visualización en Frontend
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Estás cerca del límite de historias clínicas   │
│     (80/100)                                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🚨 Has alcanzado el límite de historias clínicas  │
│     (100/100)                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Código Clave

### Backend - Conteo de Recursos
```typescript
// Contar Historias Clínicas
const medicalRecordsCount = await this.dataSource
  .getRepository('MedicalRecord')
  .count({ where: { tenantId: id, deletedAt: null } });

// Contar Plantillas CN
const consentTemplatesCount = await this.dataSource
  .getRepository('ConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });

// Contar Plantillas HC
const mrConsentTemplatesCount = await this.dataSource
  .getRepository('MRConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });
```

### Backend - Obtener Límites
```typescript
// Obtener configuración del plan
const planConfig = getPlanConfig(tenant.plan);

// Extraer límites
const medicalRecordsLimit = planConfig?.limits.medicalRecords || 999999;
const consentTemplatesLimit = planConfig?.limits.consentTemplates || 999999;
const mrConsentTemplatesLimit = planConfig?.limits.mrConsentTemplates || 999999;

// Manejar ilimitados (-1)
if (medicalRecordsLimit === -1) {
  // No generar alertas
  // Mostrar como ilimitado en frontend
}
```

### Frontend - Labels
```typescript
const getResourceLabel = (resource: string): string => {
  const labels: Record<string, string> = {
    medicalRecords: 'Historias Clínicas (HC)',
    consentTemplates: 'Plantillas CN',
    mrConsentTemplates: 'Plantillas HC',
    // ...
  };
  return labels[resource] || resource;
};
```

### Frontend - Colores Dinámicos
```typescript
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-blue-500';
};
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Conteo de medicalRecords
- [x] Conteo de consentTemplates
- [x] Conteo de mrConsentTemplates
- [x] Obtención de límites desde plans.config
- [x] Cálculo de porcentajes
- [x] Determinación de estados
- [x] Generación de alertas
- [x] Soporte para ilimitados (-1)
- [x] Sin errores de compilación

### Frontend
- [x] Labels descriptivos
- [x] Iconos apropiados
- [x] Tarjetas con diseño mejorado
- [x] Barras de progreso
- [x] Colores dinámicos
- [x] Mensajes de alerta
- [x] Formato de números
- [x] Manejo de estados de carga
- [x] Manejo de errores

---

## 🚀 Próximos Pasos

### 1. Validaciones en Creación
```typescript
// medical-records.service.ts
async create(data) {
  const usage = await this.tenantsService.getUsage(tenantId);
  if (usage.resources.medicalRecords.status === 'critical') {
    throw new BadRequestException(
      `Has alcanzado el límite de historias clínicas de tu plan ${usage.plan.name}`
    );
  }
  // ... crear HC
}
```

### 2. Notificaciones por Email
```typescript
// Enviar email cuando se alcance 80%
if (usage.resources.medicalRecords.percentage >= 80) {
  await this.mailService.sendUsageWarning(tenant, 'medicalRecords');
}
```

### 3. Sugerencias de Upgrade
```typescript
// Mostrar sugerencia de plan superior
if (usage.resources.medicalRecords.status === 'warning') {
  return {
    ...usage,
    suggestedPlan: 'enterprise', // Plan superior
    upgradeMessage: 'Considera actualizar a Plan Plus para más recursos'
  };
}
```

---

## 📚 Archivos Modificados

```
backend/
  src/tenants/
    tenants.service.ts          ← getUsage() y generateUsageAlerts()
    plans.config.ts             ← Límites definidos

frontend/
  src/pages/
    MyPlanPage.tsx              ← Visualización actualizada

doc/
  91-actualizacion-mi-plan/
    README.md                   ← Documentación completa
    RESUMEN_VISUAL.md           ← Este archivo
  SESION_2026-01-27_MI_PLAN_ACTUALIZADO.md  ← Resumen de sesión

VERSION.md                      ← Actualizado a 15.1.1
```

---

## 🎉 Resultado Final

Los tenants ahora pueden ver claramente:
- ✅ Cuántas Historias Clínicas han creado
- ✅ Cuántas Plantillas CN tienen
- ✅ Cuántas Plantillas HC tienen
- ✅ Qué tan cerca están de sus límites
- ✅ Alertas visuales cuando se acercan o alcanzan límites
- ✅ Información clara para decidir si necesitan actualizar su plan

---

**Implementación Completada** ✅
