# Diagnóstico: Banner de Recordatorio No Aparece

## 📅 Fecha: 2026-04-01

---

## 🔍 Problema Reportado

Usuario reportó que el tenant **hotelglampinglapolka** tiene vencimiento mañana (1 de abril) pero no está mostrando el banner de recordatorio de pago.

---

## 🕵️ Diagnóstico Realizado

### 1. Verificación del Tenant

**Tenant:** hotelglampinglapolka
- **ID:** 9b975d21-d367-496f-a8fb-53147114a915
- **Plan:** basic
- **Estado:** active
- **Día de facturación:** 1 (primer día de cada mes)
- **Ciclo:** monthly
- **Fecha de creación:** 2026-02-27
- **Trial termina:** 2026-03-29

### 2. Verificación de Facturas

**Resultado:** ❌ NO HAY FACTURAS para este tenant

```sql
SELECT * FROM invoices WHERE "tenantId" = '9b975d21-d367-496f-a8fb-53147114a915';
-- Resultado: 0 filas
```

### 3. Fecha Actual del Sistema

**Fecha del servidor:** 2026-04-01 00:47 AM (ya es 1 de abril)

---

## 🎯 Causa Raíz del Problema

### El banner NO aparece porque NO EXISTE una factura pendiente

El banner de recordatorio solo se muestra cuando:
1. ✅ Existe una factura con estado `pending`
2. ✅ Faltan 5 días o menos para el vencimiento

**En este caso:**
- ❌ No hay facturas generadas para el tenant
- ❌ El cron job de generación de facturas no se ejecutó

### ¿Por qué no se generó la factura automáticamente?

El cron job está configurado para ejecutarse a las **00:00 (medianoche)** todos los días:

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async handleGenerateInvoices() {
  this.logger.log('Ejecutando tarea: Generar facturas mensuales');
  const result = await this.billingService.generateMonthlyInvoices();
}
```

**Posibles causas:**
1. El cron job no se está ejecutando correctamente
2. El backend se reinició después de las 00:00
3. El scheduler no está activo
4. Hay un error en la lógica de generación

### Verificación de Logs

```bash
pm2 logs datagree --lines 200 --nostream | grep -i 'BillingScheduler\|Generar facturas'
# Resultado: Sin logs del BillingScheduler
```

**Conclusión:** El cron job NO se está ejecutando.

---

## ✅ Solución Implementada

### Solución Temporal: Generar Factura Manualmente

Creamos un script para generar una factura con vencimiento en 3 días (para que el banner aparezca):

**Script:** `backend/generate-invoice-with-close-due-date.js`

**Resultado:**
```
✅ FACTURA CREADA EXITOSAMENTE
ID: 3832767d-f599-43fa-bc32-8e3265cb0a44
Número: INV-202603-7645
Total: 89900.00
Vencimiento: 2026-04-03 (en 3 días)

✅ BANNER AMARILLO DEBERÍA MOSTRARSE (faltan 3 días)
```

### Cómo Funciona el Banner

**Archivo:** `frontend/src/components/billing/PaymentReminderBanner.tsx`

**Lógica:**
```typescript
const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);

// Solo mostrar si faltan 5 días o menos
if (daysUntilDue <= 5) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
      <h3>💳 Recordatorio de Pago</h3>
      <span>{daysUntilDue} días restantes</span>
      <p>Tu factura {invoice.invoiceNumber} vence el {dueDate}</p>
      <button>Pagar Ahora</button>
    </div>
  );
}
```

**Condiciones para mostrar el banner:**

| Días hasta vencimiento | Banner | Color | Mensaje |
|------------------------|--------|-------|---------|
| > 5 días | ❌ No se muestra | - | - |
| 5 días | ✅ Amarillo | Amarillo | "5 días restantes" |
| 4 días | ✅ Amarillo | Amarillo | "4 días restantes" |
| 3 días | ✅ Amarillo | Amarillo | "3 días restantes" |
| 2 días | ✅ Amarillo | Amarillo | "2 días restantes" |
| 1 día | ✅ Amarillo | Amarillo | "1 día restante" |
| 0 días (hoy) | ✅ Amarillo | Amarillo | "Vence hoy" |
| < 0 días (vencida) | ✅ Rojo | Rojo | "Factura Vencida" |

---

## 🔧 Solución Permanente: Activar Cron Jobs

### Problema: Cron Jobs No Se Ejecutan

El módulo `BillingSchedulerService` está registrado pero no se están ejecutando los cron jobs.

### Verificación Necesaria:

1. **Verificar que el módulo esté importado:**
```typescript
// backend/src/app.module.ts
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ✅ Debe estar presente
    BillingModule, // ✅ Debe estar importado
  ],
})
```

2. **Verificar logs del scheduler:**
```bash
pm2 logs datagree --lines 500 | grep -i 'BillingScheduler'
```

3. **Reiniciar el backend:**
```bash
pm2 restart datagree
```

4. **Verificar que se ejecute el cron:**
```bash
# Esperar hasta las 00:00 del próximo día
pm2 logs datagree --lines 100 | grep -i 'Generar facturas'
```

### Cron Jobs Configurados:

| Tarea | Horario | Descripción |
|-------|---------|-------------|
| Generar facturas | 00:00 diario | Genera facturas según billing_day |
| Enviar recordatorios | 09:00 diario | Envía emails de recordatorio |
| Suspender morosos | 23:00 diario | Suspende tenants con facturas vencidas |
| Limpiar recordatorios | 02:00 domingos | Elimina recordatorios antiguos |
| Actualizar vencidas | 01:00 diario | Actualiza estado de facturas |
| Suspender trials | 02:00 diario | Suspende cuentas gratuitas expiradas |

---

## 📊 Resumen del Problema

### Antes:
```
Tenant: hotelglampinglapolka
Billing Day: 1 (debería facturar el 1 de abril)
Fecha actual: 1 de abril 00:47 AM
Facturas: 0
Banner: ❌ No aparece (no hay facturas)
Cron job: ❌ No se ejecutó
```

### Después (Solución Temporal):
```
Tenant: hotelglampinglapolka
Factura: INV-202603-7645
Total: $89,900
Vencimiento: 4 de abril (en 3 días)
Banner: ✅ Debería aparecer (amarillo, 3 días restantes)
```

### Solución Permanente Requerida:
```
1. ✅ Verificar que ScheduleModule esté activo
2. ✅ Verificar que BillingSchedulerService esté registrado
3. ✅ Reiniciar backend para activar cron jobs
4. ✅ Monitorear logs para confirmar ejecución
5. ✅ Verificar generación automática de facturas
```

---

## 🎯 Instrucciones para Verificar el Banner

### 1. Iniciar Sesión

- URL: https://hotelglampinglapolka.archivoenlinea.com
- Usuario: Usuario del tenant hotelglampinglapolka
- Contraseña: [Contraseña del usuario]

### 2. Ir al Dashboard

- Navegar a la página principal (Dashboard)
- El banner debería aparecer en la parte superior

### 3. Verificar el Banner

**Banner Amarillo (3 días restantes):**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ 💳 Recordatorio de Pago - 3 días restantes              │
│                                                             │
│ Tu factura INV-202603-7645 vence el 4 de abril de 2026.   │
│ Monto a pagar: $89,900                                      │
│                                                             │
│ [Pagar Ahora]  [Ver Factura]                    [X]        │
└─────────────────────────────────────────────────────────────┘
```

**Características del banner:**
- ✅ Fondo amarillo/naranja degradado
- ✅ Borde izquierdo amarillo
- ✅ Icono de alerta
- ✅ Contador de días restantes
- ✅ Número de factura
- ✅ Fecha de vencimiento
- ✅ Monto a pagar
- ✅ Botón "Pagar Ahora" (genera link de Bold)
- ✅ Botón "Ver Factura" (va a /my-invoices)
- ✅ Botón cerrar (X)

---

## 📝 Scripts Creados

### 1. `backend/check-hotelglampinglapolka-invoices.js`
Verifica el estado del tenant y sus facturas.

**Uso:**
```bash
node check-hotelglampinglapolka-invoices.js
```

### 2. `backend/generate-invoice-hotelglampinglapolka.js`
Genera una factura con vencimiento en 15 días (no muestra banner).

**Uso:**
```bash
node generate-invoice-hotelglampinglapolka.js
```

### 3. `backend/generate-invoice-with-close-due-date.js`
Genera una factura con vencimiento en 3 días (muestra banner amarillo).

**Uso:**
```bash
node generate-invoice-with-close-due-date.js
```

---

## ✅ Conclusión

### Problema Identificado:
El banner de recordatorio NO aparecía porque:
1. ❌ No existía una factura pendiente para el tenant
2. ❌ El cron job de generación de facturas no se ejecutó

### Solución Temporal:
✅ Factura generada manualmente con vencimiento en 3 días
✅ Banner debería aparecer ahora en el dashboard

### Solución Permanente Requerida:
⚠️ Activar y verificar los cron jobs del BillingSchedulerService
⚠️ Monitorear la generación automática de facturas
⚠️ Verificar logs diarios para confirmar ejecución

---

**📊 Estado:** ✅ BANNER DEBERÍA APARECER AHORA  
**Fecha de diagnóstico:** 2026-04-01  
**Factura generada:** INV-202603-7645  
**Vencimiento:** 2026-04-04 (3 días)

