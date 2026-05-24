# Sistema de Notificaciones por Correo - v92.3.13

**Fecha:** Mayo 10, 2026  
**Versión:** 92.3.13  

---

## 📧 RESUMEN EJECUTIVO

El sistema envía **7 tipos de notificaciones por correo** relacionadas con facturación, pagos y suspensiones:

1. ✅ **Factura Generada** - Cuando se crea una nueva factura
2. ⏰ **Recordatorios de Pago** - 7, 5, 3 y 1 días antes del vencimiento
3. 💰 **Confirmación de Pago** - Cuando se recibe un pago
4. 🔴 **Cuenta Suspendida** - Cuando se suspende por falta de pago
5. ✅ **Cuenta Reactivada** - Cuando se reactiva después de pagar
6. 👤 **Bienvenida** - Cuando se crea un nuevo usuario
7. 🔑 **Restablecimiento de Contraseña** - Cuando se solicita cambio de contraseña

---

## 📊 NOTIFICACIONES DE FACTURACIÓN Y PAGOS

### 1. 📄 Factura Generada

**Cuándo se envía:**
- Automáticamente cuando se genera una nueva factura mensual
- Cuando se crea una factura manual

**Destinatario:**
- Email de contacto del tenant (`contactEmail`)

**Asunto:**
```
Nueva Factura INV-202605 - Termales Espiritu Santo
```

**Contenido:**
- Número de factura
- Monto total
- Fecha de vencimiento
- Detalles del plan
- Link para ver/descargar PDF
- Link para pagar

**Código:**
```typescript
// backend/src/mail/mail.service.ts
async sendInvoiceEmail(tenant: any, invoice: any): Promise<void>

// Se llama desde:
// - backend/src/invoices/invoices.service.ts (create)
// - backend/src/invoices/invoices.service.ts (resendEmail)
```

**Ejemplo de Contenido:**
```
Estimado/a [Nombre del Contacto],

Se ha generado una nueva factura para su suscripción de [Nombre del Tenant].

Detalles de la Factura:
- Número: INV-202605
- Monto: $119,900
- Fecha de Vencimiento: 11 de mayo de 2026
- Plan: Emprendedor - Mensual

[Botón: Ver Factura]
[Botón: Pagar Ahora]
```

---

### 2. ⏰ Recordatorios de Pago

**Cuándo se envía:**
- **7 días antes** del vencimiento
- **5 días antes** del vencimiento
- **3 días antes** del vencimiento
- **1 día antes** del vencimiento

**Destinatario:**
- Email de contacto del tenant (`contactEmail`)

**Asunto:**
```
Recordatorio: Pago pendiente - 5 días para el vencimiento
```

**Contenido:**
- Número de factura
- Monto total
- Fecha de vencimiento
- Días restantes
- Link para pagar
- Métodos de pago disponibles

**Código:**
```typescript
// backend/src/mail/mail.service.ts
async sendPaymentReminderEmail(tenant: any, invoice: any, daysBeforeDue: number): Promise<void>

// Se llama desde:
// - backend/src/billing/payment-reminder.service.ts (sendScheduledReminders)
```

**Configuración:**
```env
# .env
BILLING_REMINDER_DAYS=7,5,3,1
```

**Ejemplo de Contenido:**
```
⏰ Recordatorio de Pago
Faltan 5 días para el vencimiento

Estimado/a [Nombre del Contacto],

Le recordamos que tiene un pago pendiente para mantener activo su servicio.

Detalles de la Factura:
- Número: INV-202605
- Monto: $119,900
- Fecha de Vencimiento: 11 de mayo de 2026
- Días Restantes: 5 días

Para evitar la suspensión de su servicio, por favor realice el pago antes de la fecha de vencimiento.

[Botón: Pagar Ahora]
```

**Proceso Automático:**
1. Cuando se genera una factura, se crean 4 recordatorios programados
2. Un cron job diario verifica qué recordatorios deben enviarse hoy
3. Se envían los recordatorios correspondientes
4. Se marca cada recordatorio como "enviado"

---

### 3. 💰 Confirmación de Pago

**Cuándo se envía:**
- Inmediatamente después de recibir un pago exitoso
- Cuando se marca una factura como pagada manualmente

**Destinatario:**
- Email de contacto del tenant (`contactEmail`)

**Asunto:**
```
Pago Recibido - Factura INV-202605
```

**Contenido:**
- Confirmación de pago recibido
- Número de factura
- Monto pagado
- Fecha de pago
- Método de pago
- Número de transacción
- Próxima fecha de facturación

**Código:**
```typescript
// backend/src/mail/mail.service.ts
async sendPaymentConfirmationEmail(tenant: any, payment: any, invoice: any): Promise<void>

// Se llama desde:
// - backend/src/invoices/invoices.service.ts (sendPaymentConfirmation)
// - backend/src/payments/payments.service.ts (processPayment)
```

**Ejemplo de Contenido:**
```
✅ Pago Recibido

Estimado/a [Nombre del Contacto],

Hemos recibido su pago exitosamente.

Detalles del Pago:
- Factura: INV-202605
- Monto: $119,900
- Fecha de Pago: 10 de mayo de 2026
- Método: Tarjeta de crédito
- Transacción: TXN-123456

Su servicio continuará activo sin interrupciones.

Próxima Facturación: 8 de junio de 2026
```

---

### 4. 🔴 Cuenta Suspendida

**Cuándo se envía:**
- Cuando un tenant es suspendido por falta de pago
- Después de que una factura vence y no se paga

**Destinatario:**
- Email de contacto del tenant (`contactEmail`)

**Asunto:**
```
URGENTE: Cuenta Suspendida por Falta de Pago - Termales Espiritu Santo
```

**Contenido:**
- Notificación de suspensión
- Razón de la suspensión
- Factura(s) vencida(s)
- Monto total adeudado
- Instrucciones para reactivar
- Link para pagar

**Código:**
```typescript
// backend/src/mail/mail.service.ts
async sendTenantSuspendedEmail(tenant: any, invoice: any): Promise<void>

// Se llama desde:
// - backend/src/billing/billing.service.ts (suspendOverdueTenants)
```

**Ejemplo de Contenido:**
```
🔴 URGENTE: Cuenta Suspendida

Estimado/a [Nombre del Contacto],

Su cuenta ha sido suspendida debido a una factura vencida sin pagar.

Detalles:
- Factura Vencida: INV-202605
- Monto Adeudado: $119,900
- Fecha de Vencimiento: 11 de mayo de 2026
- Días de Mora: 3 días

Su servicio está temporalmente deshabilitado. Para reactivarlo:
1. Realice el pago de la factura vencida
2. Su cuenta se reactivará automáticamente

[Botón: Pagar Ahora]

IMPORTANTE: Si no realiza el pago, su cuenta permanecerá suspendida.
```

---

### 5. ✅ Cuenta Reactivada

**Cuándo se envía:**
- Cuando un tenant suspendido realiza el pago y se reactiva automáticamente

**Destinatario:**
- Email de contacto del tenant (`contactEmail`)

**Asunto:**
```
Cuenta Reactivada - Termales Espiritu Santo
```

**Contenido:**
- Confirmación de reactivación
- Detalles del pago recibido
- Fecha de reactivación
- Próxima fecha de facturación

**Código:**
```typescript
// backend/src/mail/mail.service.ts
async sendTenantActivatedEmail(tenant: any, payment: any): Promise<void>

// Se llama desde:
// - backend/src/invoices/invoices.service.ts (activateTenantAfterPayment)
```

**Ejemplo de Contenido:**
```
✅ Cuenta Reactivada

Estimado/a [Nombre del Contacto],

¡Buenas noticias! Su cuenta ha sido reactivada exitosamente.

Detalles:
- Pago Recibido: $119,900
- Fecha de Reactivación: 12 de mayo de 2026
- Estado: Activo

Su servicio está nuevamente disponible y puede acceder normalmente.

Próxima Facturación: 8 de junio de 2026

Gracias por su pago.
```

---

## 📧 NOTIFICACIONES AL SUPER ADMIN

### ⚠️ ESTADO ACTUAL: NO IMPLEMENTADAS

Actualmente, el sistema **NO envía notificaciones al super admin** sobre:
- ❌ Facturas generadas
- ❌ Pagos recibidos
- ❌ Tenants suspendidos
- ❌ Tenants reactivados
- ❌ Facturas vencidas
- ❌ Errores en el sistema de facturación

### 📊 Información Disponible para Super Admin

El super admin puede ver toda la información en el dashboard:
- Total de facturas pendientes
- Total de facturas vencidas
- Total de tenants suspendidos
- Ingresos del mes
- Historial de facturación

**Pero NO recibe notificaciones por correo.**

---

## 🔧 CONFIGURACIÓN ACTUAL

### Variables de Entorno

```env
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-app
SMTP_FROM=noreply@archivoenlinea.com
SMTP_FROM_NAME=Archivo en Línea

# Configuración de Recordatorios
BILLING_REMINDER_DAYS=7,5,3,1

# Configuración de Facturación
BILLING_TAX_RATE=0.19
```

### Cron Jobs

```javascript
// Ejecutados diariamente a las 00:00

1. Generar facturas mensuales
   - Busca tenants con billingDay = hoy
   - Genera facturas automáticamente
   - Envía email de factura generada

2. Enviar recordatorios de pago
   - Busca recordatorios programados para hoy
   - Envía emails de recordatorio
   - Marca recordatorios como enviados

3. Suspender tenants morosos
   - Busca facturas vencidas (>3 días)
   - Suspende tenants automáticamente
   - Envía email de suspensión

4. Actualizar estado de facturas vencidas
   - Marca facturas como "overdue"
```

---

## 📋 FLUJO COMPLETO DE NOTIFICACIONES

### Escenario: Factura de Termales Espiritu Santo

```
DÍA 8 DE MAYO (Día de Facturación)
├─ 00:00 - Cron job genera factura INV-202605
├─ 00:01 - ✅ Email: "Nueva Factura INV-202605"
├─ 00:02 - Se crean 4 recordatorios programados:
│          • 11 mayo (1 día antes)
│          • 9 mayo (3 días antes)
│          • 7 mayo (5 días antes)
│          • 5 mayo (7 días antes)
└─ Estado: Factura PENDING, Tenant ACTIVE

DÍA 5 DE MAYO (7 días antes)
├─ 00:00 - Cron job envía recordatorios
└─ 00:01 - ⏰ Email: "Recordatorio: 7 días para el vencimiento"

DÍA 7 DE MAYO (5 días antes)
├─ 00:00 - Cron job envía recordatorios
└─ 00:01 - ⏰ Email: "Recordatorio: 5 días para el vencimiento"

DÍA 9 DE MAYO (3 días antes)
├─ 00:00 - Cron job envía recordatorios
└─ 00:01 - ⏰ Email: "Recordatorio: 3 días para el vencimiento"

DÍA 10 DE MAYO (1 día antes)
├─ 00:00 - Cron job envía recordatorios
└─ 00:01 - ⏰ Email: "Recordatorio: 1 día para el vencimiento"

DÍA 11 DE MAYO (Día de Vencimiento)
└─ 23:59 - Factura vence pero NO se suspende aún

DÍA 12 DE MAYO (1 día después del vencimiento)
├─ 00:00 - Cron job suspende tenants morosos
├─ 00:01 - Estado: Factura OVERDUE, Tenant SUSPENDED
└─ 00:02 - 🔴 Email: "URGENTE: Cuenta Suspendida"

SI EL USUARIO PAGA:
├─ Inmediato - Estado: Factura PAID, Tenant ACTIVE
├─ +1 seg - 💰 Email: "Pago Recibido"
└─ +2 seg - ✅ Email: "Cuenta Reactivada"
```

---

## 🎯 RECOMENDACIONES

### 1. Implementar Notificaciones al Super Admin

**Correos que deberían enviarse al super admin:**

```typescript
// Nuevo servicio: backend/src/mail/admin-notifications.service.ts

1. Resumen Diario de Facturación
   - Total de facturas generadas hoy
   - Total de pagos recibidos hoy
   - Total de tenants suspendidos hoy
   - Total de facturas vencidas
   - Ingresos del día

2. Alerta de Tenant Suspendido
   - Nombre del tenant
   - Factura vencida
   - Días de mora
   - Monto adeudado

3. Notificación de Pago Recibido
   - Nombre del tenant
   - Monto pagado
   - Factura pagada
   - Método de pago

4. Alerta de Error en Facturación
   - Tenant afectado
   - Tipo de error
   - Detalles del error

5. Resumen Semanal
   - Ingresos de la semana
   - Nuevos tenants
   - Tenants suspendidos
   - Facturas pendientes
```

### 2. Mejorar Recordatorios

**Agregar:**
- Recordatorio el mismo día del vencimiento (a las 12:00)
- Recordatorio 1 día después del vencimiento (antes de suspender)
- Recordatorio 2 días después del vencimiento (última oportunidad)

### 3. Notificaciones In-App

**Implementar notificaciones dentro del sistema:**
- Badge en el menú con número de facturas pendientes
- Notificación emergente al iniciar sesión
- Centro de notificaciones en el dashboard

### 4. Notificaciones por WhatsApp (Opcional)

**Para recordatorios críticos:**
- 1 día antes del vencimiento
- Día del vencimiento
- Cuenta suspendida

---

## 📊 ESTADÍSTICAS DE NOTIFICACIONES

### Notificaciones por Tenant (Mensual)

```
Por cada tenant activo con plan de pago:

Facturación Normal (sin mora):
├─ 1 email de factura generada
├─ 4 emails de recordatorio (7, 5, 3, 1 días antes)
└─ 1 email de confirmación de pago
   TOTAL: 6 emails/mes

Facturación con Mora:
├─ 1 email de factura generada
├─ 4 emails de recordatorio
├─ 1 email de cuenta suspendida
├─ 1 email de confirmación de pago
└─ 1 email de cuenta reactivada
   TOTAL: 8 emails/mes
```

### Notificaciones al Super Admin (Actual)

```
TOTAL: 0 emails/mes ❌
```

---

## 🔍 VERIFICACIÓN DE NOTIFICACIONES

### Cómo Verificar que se Envían

**1. Revisar logs del servidor:**
```bash
pm2 logs datagree | grep "email sent"
```

**2. Revisar historial de facturación:**
```sql
SELECT * FROM billing_history 
WHERE action IN ('REMINDER_SENT', 'INVOICE_CREATED', 'PAYMENT_RECEIVED')
ORDER BY created_at DESC;
```

**3. Revisar tabla de recordatorios:**
```sql
SELECT * FROM payment_reminders 
WHERE status = 'sent'
ORDER BY sent_at DESC;
```

---

## 📝 RESUMEN EJECUTIVO

### Notificaciones Implementadas ✅

| Tipo | Destinatario | Frecuencia | Estado |
|------|--------------|------------|--------|
| Factura Generada | Tenant | 1x/mes | ✅ Activo |
| Recordatorios (7d) | Tenant | 1x/factura | ✅ Activo |
| Recordatorios (5d) | Tenant | 1x/factura | ✅ Activo |
| Recordatorios (3d) | Tenant | 1x/factura | ✅ Activo |
| Recordatorios (1d) | Tenant | 1x/factura | ✅ Activo |
| Confirmación Pago | Tenant | Al pagar | ✅ Activo |
| Cuenta Suspendida | Tenant | Al suspender | ✅ Activo |
| Cuenta Reactivada | Tenant | Al reactivar | ✅ Activo |

### Notificaciones NO Implementadas ❌

| Tipo | Destinatario | Frecuencia | Estado |
|------|--------------|------------|--------|
| Resumen Diario | Super Admin | 1x/día | ❌ No implementado |
| Alerta Suspensión | Super Admin | Al suspender | ❌ No implementado |
| Notificación Pago | Super Admin | Al pagar | ❌ No implementado |
| Alerta Error | Super Admin | Al error | ❌ No implementado |
| Resumen Semanal | Super Admin | 1x/semana | ❌ No implementado |

---

## 💡 PRÓXIMOS PASOS RECOMENDADOS

1. **Implementar notificaciones al super admin** (Alta prioridad)
2. **Agregar notificaciones in-app** (Media prioridad)
3. **Mejorar recordatorios** con más frecuencias (Baja prioridad)
4. **Implementar WhatsApp** para casos críticos (Opcional)

---

**Fecha de análisis:** Mayo 10, 2026  
**Estado:** Sistema de notificaciones funcionando para tenants  
**Pendiente:** Notificaciones al super admin

