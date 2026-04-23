# Flujo de Facturación con Vencimiento de 3 Días

## 📅 Fecha: 2026-04-01
## 🎯 Versión: v85.1.0

---

## 🎯 Cambios Implementados

### Configuración Anterior:
- Vencimiento de facturas: 30 días
- Período de gracia: 3 días después del vencimiento
- Total: 33 días antes de suspensión

### Configuración Nueva (ESTRICTA):
- **Pre-aviso:** 5 días antes de generar factura
- **Vencimiento de facturas:** 3 días después de generación
- **Período de gracia:** 0 días (suspensión inmediata)
- **Total:** 3 días de servicio condicionado después de generar factura

---

## 📊 Flujo Completo Detallado

### Ejemplo: Tenant con billing_day = 1 (factura el 1 de cada mes)

```
MARZO                           ABRIL
27  28  29  30  31  |  1   2   3   4   5
🔵  🔵  🔵  🔵  🔵  |  🔄  🔴  🔴  🔴  🚫

🔵 = Banner Azul (Pre-Aviso)
🔄 = Factura Generada
🔴 = Banner Rojo (Servicio Condicionado)
🚫 = Cuenta Suspendida
```

---

## 🔵 FASE 1: Pre-Aviso (5 días antes)

### 27 de marzo (5 días antes del día 1):
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Próxima Fecha de Corte - 5 días restantes      [X] │
│                                                         │
│ Tu factura se generará el 1 de abril de 2026 por un   │
│ monto de $89,900. Tendrás 3 días para realizar el     │
│ pago (hasta el 4 de abril).                            │
│                                                         │
│ ℹ️ Importante: Después de generada la factura, tu     │
│   servicio estará condicionado por 3 días. Si no      │
│   pagas dentro de este período, tu cuenta será        │
│   suspendida automáticamente.                          │
└─────────────────────────────────────────────────────────┘
```

**Propósito:** Avisar con anticipación para que el cliente prepare el dinero.

**28, 29, 30, 31 de marzo:**
- Banner azul sigue apareciendo
- Contador: "4 días", "3 días", "2 días", "1 día"
- Cliente tiene tiempo para organizar fondos

---

## 🔄 FASE 2: Generación de Factura

### 1 de abril (Día 0 - Fecha de corte):
- **00:00 AM:** Sistema genera factura automáticamente
- **Número:** INV-202604-1234
- **Monto:** $89,900
- **Fecha de vencimiento:** 4 de abril (3 días después)
- **Email:** Se envía con link de pago
- **Banner:** Cambia de azul a rojo inmediatamente

---

## 🔴 FASE 3: Servicio Condicionado (3 días)

### 1 de abril (Día 1 - Factura generada):
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Factura Pendiente - Pago Urgente Requerido    [X] │
│                                                         │
│ Tu factura INV-202604-1234 vence el 4 de abril de     │
│ 2026 (3 días restantes). Monto a pagar: $89,900       │
│ Tu servicio está condicionado hasta que realices el   │
│ pago.                                                   │
│                                                         │
│ [Pagar Ahora]  [Ver Facturas]                         │
└─────────────────────────────────────────────────────────┘
```

**Estado del servicio:**
- ✅ Cliente puede usar el sistema
- ⚠️ Banner rojo visible en todo momento
- ⚠️ Servicio condicionado (puede ser suspendido en cualquier momento)

### 2 de abril (Día 2):
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Factura Pendiente - Pago Urgente Requerido    [X] │
│                                                         │
│ Tu factura INV-202604-1234 vence el 4 de abril de     │
│ 2026 (2 días restantes). Monto a pagar: $89,900       │
│ Tu servicio está condicionado hasta que realices el   │
│ pago.                                                   │
│                                                         │
│ [Pagar Ahora]  [Ver Facturas]                         │
└─────────────────────────────────────────────────────────┘
```

### 3 de abril (Día 3):
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Factura Pendiente - Pago Urgente Requerido    [X] │
│                                                         │
│ Tu factura INV-202604-1234 vence el 4 de abril de     │
│ 2026 (1 día restante). Monto a pagar: $89,900         │
│ Tu servicio está condicionado hasta que realices el   │
│ pago.                                                   │
│                                                         │
│ [Pagar Ahora]  [Ver Facturas]                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔴 FASE 4: Día de Vencimiento

### 4 de abril (Día del vencimiento):
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Factura Vencida - Acción Requerida            [X] │
│                                                         │
│ Tienes 1 factura(s) vencida(s). La factura            │
│ INV-202604-1234 venció hace 0 día(s). Tu cuenta será  │
│ suspendida si no realizas el pago inmediatamente.     │
│                                                         │
│ [Pagar Ahora]  [Ver Facturas]                         │
└─────────────────────────────────────────────────────────┘
```

**Estado:**
- ⚠️ Factura vencida
- ⚠️ Suspensión inminente
- ⚠️ Cliente aún puede acceder al sistema (último día)

---

## 🚫 FASE 5: Suspensión Automática

### 5 de abril (1 día después del vencimiento):
- **00:00 AM:** Sistema suspende la cuenta automáticamente
- **Estado:** SUSPENDED
- **Acceso:** Bloqueado
- **Email:** Notificación de suspensión enviada
- **Página:** Muestra SuspendedAccountPage

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🚫 Cuenta Suspendida                      │
│                                                         │
│  Tu cuenta ha sido suspendida por falta de pago.      │
│                                                         │
│  Factura pendiente: INV-202604-1234                    │
│  Monto: $89,900                                         │
│                                                         │
│  Para reactivar tu cuenta, realiza el pago de la      │
│  factura pendiente.                                     │
│                                                         │
│  [Ver Factura y Pagar]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación: Antes vs Después

### Sistema Anterior (Flexible):
```
Día -5 a -1: Pre-aviso
Día 0: Factura generada (vence en 30 días)
Día 1-25: Sin banner
Día 26-30: Banner amarillo
Día 31-33: Banner rojo (período de gracia)
Día 34: Suspensión

Total: 34 días desde generación hasta suspensión
```

### Sistema Nuevo (Estricto):
```
Día -5 a -1: Pre-aviso (banner azul)
Día 0: Factura generada (vence en 3 días)
Día 1-3: Banner rojo (servicio condicionado)
Día 4: Suspensión inmediata

Total: 3 días desde generación hasta suspensión
```

---

## 🎯 Beneficios del Sistema Estricto

### Para el Negocio:
1. ✅ **Flujo de caja más rápido:** Pagos en 3 días vs 30 días
2. ✅ **Menos morosidad:** Clientes pagan más rápido
3. ✅ **Claridad:** Expectativas claras desde el inicio
4. ✅ **Menos cuentas por cobrar:** Ciclo de cobro más corto

### Para el Cliente:
1. ✅ **Pre-aviso de 5 días:** Tiempo para preparar fondos
2. ✅ **Expectativas claras:** Sabe que tiene 3 días
3. ✅ **Recordatorios constantes:** Banner rojo visible
4. ✅ **Proceso transparente:** Sin sorpresas

---

## ⚙️ Configuración Técnica

### Backend:

**Vencimiento de facturas:**
```typescript
// backend/src/invoices/invoices.service.ts
// Fecha de vencimiento (3 días después de la emisión)
const dueDate = new Date(now);
dueDate.setDate(dueDate.getDate() + 3);
```

**Suspensión automática:**
```typescript
// backend/src/billing/billing.service.ts
// Período de gracia: 0 días (suspensión inmediata)
const gracePeriodDays = 0;
const overdueInvoices = await this.invoicesRepository.find({
  where: {
    status: InvoiceStatus.PENDING,
    dueDate: LessThan(now), // Cualquier factura vencida
  },
});
```

### Frontend:

**Banner de pre-aviso:**
```typescript
// frontend/src/components/billing/BillingCycleReminderBanner.tsx
// Mostrar 5 días antes del billing_day
if (daysUntilBilling > 5 || daysUntilBilling < 0) {
  return null;
}
```

**Banner de factura pendiente:**
```typescript
// frontend/src/components/billing/PaymentReminderBanner.tsx
// Mostrar banner rojo SIEMPRE que haya facturas pendientes
if (pendingInvoices.length > 0) {
  // Banner rojo con mensaje urgente
}
```

---

## 📅 Ejemplo Práctico Completo

### Tenant: Hotel Glamping La Polka
- **Plan:** Basic ($89,900/mes)
- **Billing Day:** 1 de cada mes
- **Ciclo:** Mensual

### Timeline:

| Fecha | Día | Evento | Banner | Estado |
|-------|-----|--------|--------|--------|
| 27 mar | -5 | Pre-aviso | 🔵 Azul | Active |
| 28 mar | -4 | Pre-aviso | 🔵 Azul | Active |
| 29 mar | -3 | Pre-aviso | 🔵 Azul | Active |
| 30 mar | -2 | Pre-aviso | 🔵 Azul | Active |
| 31 mar | -1 | Pre-aviso | 🔵 Azul | Active |
| 1 abr | 0 | Factura generada | 🔴 Rojo | Active (condicionado) |
| 2 abr | 1 | Servicio condicionado | 🔴 Rojo | Active (condicionado) |
| 3 abr | 2 | Servicio condicionado | 🔴 Rojo | Active (condicionado) |
| 4 abr | 3 | Último día | 🔴 Rojo | Active (condicionado) |
| 5 abr | 4 | Suspensión | 🚫 Suspendido | Suspended |

---

## 🔧 Cron Jobs

### Generación de Facturas:
- **Horario:** 00:00 diario
- **Acción:** Genera facturas para tenants con billing_day = hoy

### Suspensión de Cuentas:
- **Horario:** 00:00 diario
- **Acción:** Suspende tenants con facturas vencidas (sin período de gracia)

---

## ✅ Conclusión

El nuevo sistema de facturación es más estricto pero más claro:

1. ✅ **5 días de pre-aviso:** Cliente preparado
2. ✅ **3 días de servicio condicionado:** Tiempo justo para pagar
3. ✅ **Suspensión inmediata:** Sin período de gracia
4. ✅ **Comunicación constante:** Banners visibles en todo momento

**Estado:** ✅ IMPLEMENTADO  
**Versión:** v85.1.0  
**Fecha:** 2026-04-01

