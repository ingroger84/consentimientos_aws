# Análisis: Sistema de Límites de Recursos

## 📅 Fecha: 2026-04-01
## 🎯 Objetivo: Verificar y corregir implementación de límites

---

## 📊 TIPOS DE LÍMITES

### 🔄 Límite Mensual (Se reinicia cada mes)
- Contador se reinicia automáticamente el día 1 de cada mes
- Ejemplo: 100 consentimientos CN por mes
- Si se consumen antes de fin de mes, debe esperar al próximo mes

### 📦 Límite Total (NO se reinicia)
- Contador acumulado desde el inicio
- Ejemplo: 10 historias clínicas totales
- Una vez alcanzado, solo se puede aumentar actualizando el plan

---

## 📊 Estado Actual del Sistema

### ✅ Consentimientos CN - LÍMITE MENSUAL

**Ubicación:** `backend/src/consents/consents.service.ts` (líneas 510-530)

**Tipo:** 🔄 LÍMITE MENSUAL

**Implementación:**
```typescript
// Calcular inicio y fin del mes actual
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

// Contar consentimientos del mes actual
const currentMonthCount = await this.consentsRepository.count({
  where: {
    tenant: { id: tenantId },
    deletedAt: null,
    createdAt: Between(startOfMonth, endOfMonth),
  },
});

const maxLimit = tenant.maxConsents;

if (currentMonthCount >= maxLimit) {
  throw new ForbiddenException({
    message: `Has alcanzado el límite mensual de consentimientos (${currentMonthCount}/${maxLimit}). ` +
      `El límite se reiniciará el 1 de ${this.getNextMonthName()}. ` +
      `Para aumentar tu límite, actualiza tu plan.`,
    error: 'MONTHLY_RESOURCE_LIMIT_REACHED',
    resourceType: 'consents',
    current: currentMonthCount,
    max: maxLimit,
    resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  });
}
```

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

**Características:**
- ✅ Cuenta solo consentimientos del mes actual
- ✅ Se reinicia automáticamente el 1 de cada mes
- ✅ Valida antes de crear un nuevo consentimiento
- ✅ Mensaje claro indicando cuándo se reinicia el límite

---

### ✅ Historias Clínicas - LÍMITE TOTAL (CORREGIDO)

**Ubicación:** `backend/src/medical-records/medical-records.service.ts` (líneas 1430-1455)

**Tipo:** 📦 LÍMITE TOTAL (NO MENSUAL)

**Implementación CORREGIDA:**
```typescript
private async checkMedicalRecordsLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  
  // Contar TODAS las historias clínicas del tenant (no solo del mes actual)
  const totalCount = await this.medicalRecordsRepository.count({
    where: {
      tenantId,
    }
  });
  
  const maxLimit = tenant.maxMedicalRecords;
  
  if (totalCount >= maxLimit) {
    throw new ForbiddenException({
      message: `Has alcanzado el límite total de historias clínicas (${totalCount}/${maxLimit}). ` +
        `Para crear más historias clínicas, actualiza tu plan.`,
      error: 'RESOURCE_LIMIT_REACHED',
      resourceType: 'medical_records',
      current: totalCount,
      max: maxLimit,
    });
  }
}
```

**Estado:** ✅ **CORREGIDO**

**Cambios Realizados:**
- ❌ ANTES: Contaba solo HC del mes actual (límite mensual)
- ✅ AHORA: Cuenta TODAS las HC del tenant (límite total)
- ❌ ANTES: Mensaje indicaba reinicio mensual
- ✅ AHORA: Mensaje indica que debe actualizar plan
- ❌ ANTES: Incluía `resetDate`
- ✅ AHORA: No incluye `resetDate` (no se reinicia)

**Características:**
- ✅ Cuenta TODAS las HC del tenant (acumulado)
- ✅ NO se reinicia mensualmente
- ✅ Valida antes de crear una nueva HC
- ✅ Mensaje claro indicando que debe actualizar plan

---

### ❌ Consentimientos de HC - LÍMITE MENSUAL (FALTA IMPLEMENTAR)

**Ubicación:** `backend/src/medical-records/medical-records.service.ts` (método `createConsentFromMedicalRecord`)

**Tipo:** 🔄 LÍMITE MENSUAL (PENDIENTE)

**Estado:** ❌ **NO IMPLEMENTADO**

---

## 📋 Resumen de Implementación

| Recurso | Tipo de Límite | Reinicio | Estado |
|---------|----------------|----------|--------|
| **Consentimientos CN** | 🔄 Mensual | ✅ 1 de cada mes | ✅ CORRECTO |
| **Historias Clínicas** | 📦 Total | ❌ NO se reinicia | ✅ CORREGIDO |
| **Consentimientos de HC** | 🔄 Mensual | ✅ 1 de cada mes | ❌ FALTA |

---

## 🎯 Comportamiento Esperado

### Ejemplo 1: Consentimientos CN (Límite Mensual)
**Plan:** 100 consentimientos CN/mes

**Escenario:**
- Día 5 del mes: Cliente envía 100 consentimientos CN
- Día 6 del mes: Cliente intenta enviar otro consentimiento
- ❌ Sistema bloquea: "Has alcanzado el límite mensual (100/100). El límite se reiniciará el 1 de [próximo mes]"
- ✅ Día 1 del próximo mes: Límite se reinicia automáticamente a 0/100

### Ejemplo 2: Historias Clínicas (Límite Total)
**Plan:** 10 historias clínicas totales

**Escenario:**
- Mes 1: Cliente crea 5 HC (total: 5/10)
- Mes 2: Cliente crea 3 HC (total: 8/10)
- Mes 3: Cliente crea 2 HC (total: 10/10)
- Mes 4: Cliente intenta crear otra HC
- ❌ Sistema bloquea: "Has alcanzado el límite total de historias clínicas (10/10). Para crear más historias clínicas, actualiza tu plan"
- ❌ El límite NO se reinicia el próximo mes
- ✅ Cliente debe actualizar su plan para aumentar el límite

### Ejemplo 3: Consentimientos de HC (Límite Mensual - PENDIENTE)
**Plan:** 50 consentimientos de HC/mes

**Escenario:**
- Día 10 del mes: Cliente crea 50 consentimientos de HC
- Día 11 del mes: Cliente intenta crear otro consentimiento de HC
- ❌ Sistema debe bloquear: "Has alcanzado el límite mensual (50/50). El límite se reiniciará el 1 de [próximo mes]"
- ✅ Día 1 del próximo mes: Límite se reinicia automáticamente a 0/50

---

## 🔧 Cambios Realizados

### ✅ Historias Clínicas - Cambio de Mensual a Total

**ANTES (Incorrecto):**
```typescript
// ❌ Contaba solo HC del mes actual
const currentMonthCount = await this.medicalRecordsRepository.count({
  where: {
    tenantId,
    createdAt: Between(startOfMonth, endOfMonth), // ❌ Solo mes actual
  }
});

// ❌ Mensaje indicaba reinicio mensual
message: `Has alcanzado el límite mensual de historias clínicas (${currentMonthCount}/${maxLimit}). ` +
  `El límite se reiniciará el 1 de ${nextMonth}.`
```

**DESPUÉS (Correcto):**
```typescript
// ✅ Cuenta TODAS las HC del tenant
const totalCount = await this.medicalRecordsRepository.count({
  where: {
    tenantId, // ✅ Sin filtro de fecha
  }
});

// ✅ Mensaje indica que debe actualizar plan
message: `Has alcanzado el límite total de historias clínicas (${totalCount}/${maxLimit}). ` +
  `Para crear más historias clínicas, actualiza tu plan.`
```

---

## 🔧 Acción Pendiente

### ❌ FALTA IMPLEMENTAR: Límite Mensual para Consentimientos de HC

**Implementación Requerida:**
```typescript
private async checkMRConsentsLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  
  // Calcular inicio y fin del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Contar solo consentimientos de HC del mes actual
  const currentMonthCount = await this.medicalRecordConsentsRepository.count({
    where: {
      medicalRecord: { tenantId },
      createdAt: Between(startOfMonth, endOfMonth),
    }
  });
  
  const maxLimit = tenant.maxMRConsents;
  
  if (currentMonthCount >= maxLimit) {
    throw new ForbiddenException({
      message: `Has alcanzado el límite mensual de consentimientos de HC (${currentMonthCount}/${maxLimit}). ` +
        `El límite se reiniciará el 1 de ${this.getNextMonthName()}. ` +
        `Para aumentar tu límite, actualiza tu plan.`,
      error: 'MONTHLY_RESOURCE_LIMIT_REACHED',
      resourceType: 'mr_consents',
      current: currentMonthCount,
      max: maxLimit,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    });
  }
}
```

---

## ✅ Conclusión

**Cambios Realizados:**
- ✅ Historias Clínicas: Cambiado de límite mensual a límite total

**Estado Actual:**
- ✅ Consentimientos CN: Límite mensual - CORRECTO
- ✅ Historias Clínicas: Límite total - CORREGIDO
- ❌ Consentimientos de HC: Límite mensual - FALTA IMPLEMENTAR

**Próximos Pasos:**
1. Agregar campo `maxMRConsents` a la entidad Tenant
2. Crear migración para agregar la columna
3. Implementar método `checkMRConsentsLimit()` con límite mensual
4. Llamar validación en `createConsentFromMedicalRecord()`
5. Actualizar configuración de planes
6. Compilar y desplegar

---

**Fecha de Análisis:** 2026-04-01  
**Analista:** Kiro AI Assistant
