# Cambio de Regla de Suspensión por Falta de Pago - v92.3.15

**Fecha:** 11 de mayo de 2026  
**Versión:** 92.3.15

---

## 📋 CAMBIO IMPLEMENTADO

### Regla ANTERIOR (v92.3.14)

**Período de gracia:** 3 días después de `dueDate`

```
Día 0: Factura generada (dueDate = día de generación)
Día 1: Día de gracia
Día 2: Día de gracia
Día 3: Día de gracia
Día 4: SUSPENSIÓN AUTOMÁTICA (a las 23:00)
```

**Ejemplo:**
- 10 mayo: Factura generada
- 11 mayo: Vence (dueDate)
- 12-14 mayo: Período de gracia (3 días)
- 15 mayo 23:00: SUSPENSIÓN

---

### Regla NUEVA (v92.3.15)

**Período de gracia:** 1 día después de creación de factura

```
Día 0: Factura generada (createdAt)
Día 1: Día de gracia
Día 2: SUSPENSIÓN AUTOMÁTICA (a las 01:00)
```

**Ejemplo:**
- 10 mayo: Factura generada
- 11 mayo: Día de gracia
- 12 mayo 01:00: SUSPENSIÓN si no hay pago

---

## 🔧 CAMBIOS EN EL CÓDIGO

### 1. BillingService.suspendOverdueTenants()

**Antes:**
```typescript
// Buscar facturas vencidas (más de 3 días después de dueDate)
const overdueDate = new Date(now);
overdueDate.setDate(overdueDate.getDate() - 3);

const overdueInvoices = await this.invoicesRepository.find({
  where: {
    status: InvoiceStatus.PENDING,
    dueDate: LessThanOrEqual(overdueDate),
  },
  relations: ['tenant'],
});
```

**Ahora:**
```typescript
// NUEVA REGLA: Buscar facturas con más de 1 día después de creación
// Día 0: Factura generada
// Día 1: Día de gracia
// Día 2: Suspensión si no hay pago
const oneDayAgo = new Date(now);
oneDayAgo.setDate(oneDayAgo.getDate() - 1);
oneDayAgo.setHours(0, 0, 0, 0); // Inicio del día de ayer

const overdueInvoices = await this.invoicesRepository.find({
  where: {
    status: InvoiceStatus.PENDING,
    createdAt: LessThanOrEqual(oneDayAgo),
  },
  relations: ['tenant'],
});
```

**Cambios clave:**
- ✅ Cambió de `dueDate` a `createdAt`
- ✅ Cambió de 3 días a 1 día
- ✅ Usa `setHours(0, 0, 0, 0)` para comparar desde el inicio del día

### 2. Cálculo de días de mora

**Antes:**
```typescript
const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
```

**Ahora:**
```typescript
const daysOverdue = Math.floor((now.getTime() - new Date(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24));
```

### 3. Horario del Cron Job

**Antes:**
```typescript
// Suspender tenants morosos - Diario a las 23:00
@Cron('0 23 * * *')
```

**Ahora:**
```typescript
// Suspender tenants morosos - Diario a las 01:00
@Cron('0 1 * * *')
```

---

## 📊 IMPACTO EN TENANTS ACTUALES

### Caso: Termales Espiritu Santo

**Factura actual:**
- Creada: 10 de mayo de 2026
- Vence: 11 de mayo de 2026

**Con regla ANTERIOR:**
- Suspensión: 15 de mayo a las 23:00

**Con regla NUEVA:**
- Suspensión: 12 de mayo a las 01:00 ⚠️ **MAÑANA**

### Tenants ya suspendidos

Los tenants que ya están suspendidos (hotelglampinglapolka, Demo Estetica) no se ven afectados por este cambio.

---

## ⚙️ CONFIGURACIÓN DEL SISTEMA

### Cron Jobs Actualizados

| Tarea | Horario | Descripción |
|-------|---------|-------------|
| Generación de facturas | 00:00 | Genera facturas mensuales según día de corte |
| **Suspensión de morosos** | **01:00** | **Suspende tenants con facturas >1 día sin pagar** |
| Recordatorios de pago | 09:00 | Envía recordatorios de facturas próximas a vencer |

---

## 🎯 VENTAJAS DE LA NUEVA REGLA

1. **Más rápida:** Suspensión en 2 días en lugar de 5 días
2. **Más clara:** Basada en fecha de creación, no en fecha de vencimiento
3. **Más efectiva:** Incentiva el pago inmediato
4. **Más simple:** Menos días de gracia = menos confusión

---

## 📝 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Factura generada el 10 de mayo

```
10 mayo 00:00 → Factura generada (createdAt)
11 mayo 00:00 → Día de gracia (1 día completo)
12 mayo 01:00 → SUSPENSIÓN si no hay pago
```

### Ejemplo 2: Factura generada el 8 de cada mes

```
8 de mes 00:00 → Factura generada
9 de mes 00:00 → Día de gracia
10 de mes 01:00 → SUSPENSIÓN si no hay pago
```

---

## 🚀 DESPLIEGUE

### Archivos Modificados
- `backend/src/billing/billing.service.ts`
- `backend/src/billing/billing-scheduler.service.ts`

### Comandos Ejecutados
```bash
cd backend
npm run build
scp -r -i ../AWS-ISSABEL.pem dist/billing/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/billing/
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

### Estado del Despliegue
- ✅ Compilación exitosa
- ✅ Archivos desplegados
- ✅ PM2 reiniciado (PID: 1776047)
- ✅ Sistema operativo

---

## ⚠️ IMPORTANTE

**Próxima ejecución del cron job:** 12 de mayo de 2026 a las 01:00

**Tenants que serán evaluados:**
- Termales Espiritu Santo (factura del 10 de mayo) → **SERÁ SUSPENDIDO** si no paga antes del 12 de mayo 01:00

---

**Versión:** 92.3.15  
**Desplegado:** 11 de mayo de 2026 - 09:50 AM  
**Estado:** ✅ ACTIVO
