# Actualización Página "Mi Plan" - Nuevos Recursos

**Fecha:** 2026-01-27  
**Versión:** 15.1.0  
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen

Se actualizó la página "Mi Plan" para mostrar los nuevos recursos integrados en el sistema:
- **Historias Clínicas (HC)**
- **Plantillas de Historias Clínicas (Plantillas HC)**
- **Plantillas de Consentimientos (Plantillas CN)**

---

## 🎯 Objetivos Completados

### 1. ✅ Backend - Endpoint de Uso Actualizado

**Archivo:** `backend/src/tenants/tenants.service.ts`

**Cambios realizados:**

#### Método `getUsage()`:
- ✅ Agregado conteo de `medicalRecords` desde base de datos
- ✅ Agregado conteo de `consentTemplates` desde base de datos
- ✅ Agregado conteo de `mrConsentTemplates` desde base de datos
- ✅ Obtención de límites desde `getPlanConfig()`
- ✅ Soporte para valores ilimitados (-1)
- ✅ Cálculo de porcentajes de uso
- ✅ Determinación de estado (normal/warning/critical)

```typescript
// Contar nuevos recursos
const medicalRecordsCount = await this.dataSource
  .getRepository('MedicalRecord')
  .count({ where: { tenantId: id, deletedAt: null } });

const consentTemplatesCount = await this.dataSource
  .getRepository('ConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });

const mrConsentTemplatesCount = await this.dataSource
  .getRepository('MRConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });

// Obtener límites del plan
const planConfig = getPlanConfig(tenant.plan);
const medicalRecordsLimit = planConfig?.limits.medicalRecords || 999999;
const consentTemplatesLimit = planConfig?.limits.consentTemplates || 999999;
const mrConsentTemplatesLimit = planConfig?.limits.mrConsentTemplates || 999999;
```

#### Método `generateUsageAlerts()`:
- ✅ Agregadas alertas para Historias Clínicas
- ✅ Agregadas alertas para Plantillas CN
- ✅ Agregadas alertas para Plantillas HC
- ✅ Soporte para recursos ilimitados (no genera alertas si límite = -1)
- ✅ Alertas de advertencia al 80% de uso
- ✅ Alertas críticas al 100% de uso

```typescript
// Alertas para Historias Clínicas
const medicalRecordsLimit = planConfig?.limits.medicalRecords || 999999;
if (medicalRecordsLimit !== -1) {
  if (counts.medicalRecordsCount >= medicalRecordsLimit) {
    alerts.push({
      type: 'critical',
      resource: 'medicalRecords',
      message: `Has alcanzado el límite de historias clínicas (${counts.medicalRecordsCount}/${medicalRecordsLimit})`,
    });
  } else if (counts.medicalRecordsCount >= medicalRecordsLimit * 0.8) {
    alerts.push({
      type: 'warning',
      resource: 'medicalRecords',
      message: `Estás cerca del límite de historias clínicas (${counts.medicalRecordsCount}/${medicalRecordsLimit})`,
    });
  }
}
```

---

### 2. ✅ Frontend - Página "Mi Plan" Actualizada

**Archivo:** `frontend/src/pages/MyPlanPage.tsx`

**Cambios realizados:**

#### Función `getResourceLabel()`:
- ✅ Agregado label para `medicalRecords`: "Historias Clínicas (HC)"
- ✅ Agregado label para `consentTemplates`: "Plantillas CN"
- ✅ Agregado label para `mrConsentTemplates`: "Plantillas HC"

#### Función `getResourceIcon()`:
- ✅ Agregado icono `FileText` para los nuevos recursos

#### Visualización:
- ✅ Tarjetas de recursos con diseño mejorado
- ✅ Iconos grandes y coloridos
- ✅ Porcentaje de uso visible
- ✅ Barra de progreso con colores según estado:
  - Verde: 0-79% (normal)
  - Amarillo: 80-99% (warning)
  - Rojo: 100% (critical)
- ✅ Mensajes de alerta cuando se acerca o alcanza el límite
- ✅ Formato de números con separadores de miles

---

## 📊 Estructura de Datos

### Respuesta del Endpoint `/api/tenants/:id/usage`

```typescript
{
  plan: {
    id: string;
    name: string;
    billingCycle: string;
    status: string;
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
  };
  resources: {
    users: ResourceUsage;
    branches: ResourceUsage;
    services: ResourceUsage;
    consents: ResourceUsage;
    medicalRecords: ResourceUsage;      // ✅ NUEVO
    consentTemplates: ResourceUsage;    // ✅ NUEVO
    mrConsentTemplates: ResourceUsage;  // ✅ NUEVO
    questions: ResourceUsage;
    storage: ResourceUsage;
  };
  alerts: Alert[];
}

interface ResourceUsage {
  current: number;
  max: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  unit?: string;
}
```

---

## 🎨 Diseño Visual

### Tarjetas de Recursos

Cada recurso se muestra en una tarjeta con:

1. **Icono grande** (azul, 3xl)
2. **Label descriptivo** (gris, uppercase, tracking-wide)
3. **Contador actual/máximo** (texto grande, bold)
4. **Badge de porcentaje** con colores según estado:
   - Verde: normal (0-79%)
   - Amarillo: warning (80-99%)
   - Rojo: critical (100%)
5. **Barra de progreso** con animación
6. **Mensaje de alerta** (si aplica)

### Ejemplo Visual:

```
┌─────────────────────────────────────────┐
│  📄  HISTORIAS CLÍNICAS (HC)      85%  │
│                                         │
│  25 / 30                                │
│  ████████████████░░░░  (amarillo)       │
│  ⚠️ Cerca del límite - Considera       │
│     actualizar tu plan                  │
└─────────────────────────────────────────┘
```

---

## 🔍 Validaciones Implementadas

### Backend:
- ✅ Conteo solo de recursos NO eliminados (`deletedAt: null`)
- ✅ Manejo de valores ilimitados (-1)
- ✅ Cálculo correcto de porcentajes
- ✅ Generación de alertas según umbrales (80% y 100%)

### Frontend:
- ✅ Manejo de estados de carga
- ✅ Manejo de errores
- ✅ Formato de números con separadores
- ✅ Colores dinámicos según estado
- ✅ Mensajes claros y descriptivos

---

## 📝 Configuración de Planes

Los límites de los nuevos recursos están definidos en `backend/src/tenants/plans.config.ts`:

| Plan | HC | Plantillas HC | Plantillas CN |
|------|----|--------------:|---------------|
| **Gratuito** | 5 | 2 | 3 |
| **Básico** | 30 | 5 | 10 |
| **Emprendedor** | 100 | 10 | 20 |
| **Plus** | 300 | 20 | 30 |
| **Empresarial** | -1 (ilimitado) | -1 (ilimitado) | -1 (ilimitado) |

---

## ✅ Estado de Compilación

- ✅ Backend compilando sin errores
- ✅ Frontend sin errores de TypeScript
- ✅ Endpoint `/api/tenants/:id/usage` funcionando
- ✅ Proceso backend corriendo en puerto 3000

---

## 🧪 Pruebas Recomendadas

### 1. Verificar Conteo de Recursos

```bash
# Probar endpoint de uso (requiere autenticación)
curl -H "Authorization: Bearer <token>" \
     -H "X-Tenant-Slug: demo-medico" \
     http://localhost:3000/api/tenants/<tenant-id>/usage
```

### 2. Verificar Página "Mi Plan"

1. Iniciar sesión como tenant (no Super Admin)
2. Ir a "Mi Plan" en el menú
3. Verificar que se muestran los nuevos recursos:
   - Historias Clínicas (HC)
   - Plantillas CN
   - Plantillas HC
4. Verificar que los contadores son correctos
5. Verificar que las barras de progreso funcionan
6. Verificar que las alertas aparecen cuando corresponde

### 3. Probar Límites

1. Crear recursos hasta acercarse al límite (80%)
2. Verificar que aparece alerta amarilla
3. Crear recursos hasta alcanzar el límite (100%)
4. Verificar que aparece alerta roja
5. Intentar crear más recursos (debe fallar)

---

## 🚀 Próximos Pasos

### Validaciones en Creación de Recursos

Ahora que "Mi Plan" muestra los límites correctamente, el siguiente paso es implementar las validaciones en los endpoints de creación:

1. **Historias Clínicas:**
   - Validar límite antes de crear HC
   - Mensaje: "Has alcanzado el límite de historias clínicas de tu plan X"

2. **Plantillas CN:**
   - Validar límite antes de crear plantilla CN
   - Mensaje: "Has alcanzado el límite de plantillas CN de tu plan X"

3. **Plantillas HC:**
   - Validar límite antes de crear plantilla HC
   - Mensaje: "Has alcanzado el límite de plantillas HC de tu plan X"

---

## 📚 Archivos Modificados

```
backend/src/tenants/tenants.service.ts
  - Método getUsage() actualizado
  - Método generateUsageAlerts() actualizado

frontend/src/pages/MyPlanPage.tsx
  - Función getResourceLabel() actualizada
  - Función getResourceIcon() actualizada
  - Visualización de nuevos recursos

backend/src/tenants/plans.config.ts
  - Límites de nuevos recursos definidos
```

---

## ✅ Checklist de Completitud

- [x] Backend: Conteo de medicalRecords
- [x] Backend: Conteo de consentTemplates
- [x] Backend: Conteo de mrConsentTemplates
- [x] Backend: Obtención de límites desde plans.config
- [x] Backend: Alertas para nuevos recursos
- [x] Frontend: Labels para nuevos recursos
- [x] Frontend: Iconos para nuevos recursos
- [x] Frontend: Visualización de tarjetas
- [x] Frontend: Barras de progreso
- [x] Frontend: Mensajes de alerta
- [x] Sin errores de compilación
- [x] Backend corriendo correctamente

---

## 🎉 Conclusión

La página "Mi Plan" ha sido actualizada exitosamente para mostrar los nuevos recursos integrados en el sistema. Los tenants ahora pueden ver claramente:

- Cuántas Historias Clínicas han creado
- Cuántas Plantillas CN tienen
- Cuántas Plantillas HC tienen
- Qué tan cerca están de sus límites
- Alertas cuando se acercan o alcanzan los límites

El siguiente paso es implementar las validaciones en los endpoints de creación para prevenir que los tenants excedan sus límites.
