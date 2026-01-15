# Guía de Implementación del Sistema de Pagos

## Estado Actual

### ✅ Completado

1. **Arquitectura documentada** - `ARQUITECTURA_SISTEMA_PAGOS.md`
2. **Entidades creadas**:
   - `Payment` - Pagos
   - `Invoice` - Facturas
   - `PaymentReminder` - Recordatorios
   - `BillingHistory` - Historial
3. **DTOs creados**:
   - `CreatePaymentDto`
   - `CreateInvoiceDto`
4. **Módulos base**:
   - `PaymentsModule` + Service + Controller
   - `InvoicesModule` (parcial)

### ⏳ Pendiente de Implementar

#### Backend

1. **InvoicesService** - Lógica de facturas
2. **InvoicesController** - Endpoints de facturas
3. **BillingModule** - Módulo principal de cobros
4. **BillingService** - Lógica de cobros
5. **BillingSchedulerService** - CRON jobs
6. **PaymentReminderService** - Envío de recordatorios
7. **Templates de email**:
   - `payment-reminder.hbs`
   - `invoice-generated.hbs`
   - `payment-received.hbs`
   - `tenant-suspended.hbs`
   - `tenant-activated.hbs`
8. **Migración de base de datos** - Crear tablas
9. **Actualizar AppModule** - Importar nuevos módulos

#### Frontend

1. **PaymentsPage.tsx** - Historial de pagos
2. **InvoicesPage.tsx** - Facturas del tenant
3. **BillingDashboardPage.tsx** - Dashboard Super Admin
4. **PaymentReminderBanner.tsx** - Banner de recordatorio
5. **InvoiceCard.tsx** - Tarjeta de factura
6. **Servicios**:
   - `payments.service.ts`
   - `invoices.service.ts`
   - `billing.service.ts`
7. **Rutas** - Agregar en App.tsx
8. **Menú** - Agregar en Layout.tsx

## Pasos de Implementación

### Fase 1: Backend Core (2-3 horas)

```bash
# 1. Crear servicios restantes
backend/src/invoices/invoices.service.ts
backend/src/invoices/invoices.controller.ts
backend/src/billing/billing.module.ts
backend/src/billing/billing.service.ts
backend/src/billing/billing.controller.ts

# 2. Crear scheduler
backend/src/billing/billing-scheduler.service.ts
backend/src/billing/payment-reminder.service.ts

# 3. Templates de email
backend/src/mail/templates/payment-reminder.hbs
backend/src/mail/templates/invoice-generated.hbs
backend/src/mail/templates/payment-received.hbs
backend/src/mail/templates/tenant-suspended.hbs
backend/src/mail/templates/tenant-activated.hbs

# 4. Actualizar MailService
backend/src/mail/mail.service.ts
```

### Fase 2: Migración de Base de Datos (30 min)

```bash
# Generar migración
npm run migration:generate -- -n AddBillingTables

# Ejecutar migración
npm run migration:run
```

### Fase 3: Frontend (3-4 horas)

```bash
# 1. Servicios
frontend/src/services/payments.service.ts
frontend/src/services/invoices.service.ts
frontend/src/services/billing.service.ts

# 2. Páginas
frontend/src/pages/PaymentsPage.tsx
frontend/src/pages/InvoicesPage.tsx
frontend/src/pages/BillingDashboardPage.tsx

# 3. Componentes
frontend/src/components/billing/PaymentReminderBanner.tsx
frontend/src/components/billing/InvoiceCard.tsx
frontend/src/components/billing/PaymentForm.tsx

# 4. Rutas y menú
frontend/src/App.tsx
frontend/src/components/Layout.tsx
```

### Fase 4: Testing (1-2 horas)

1. Crear tenant de prueba
2. Generar factura manualmente
3. Probar recordatorios
4. Probar suspensión
5. Registrar pago
6. Verificar activación
7. Revisar emails
8. Verificar historial

### Fase 5: CRON Jobs (1 hora)

1. Configurar horarios
2. Probar generación de facturas
3. Probar envío de recordatorios
4. Probar suspensión automática
5. Monitorear logs

## Comandos Útiles

### Desarrollo

```bash
# Backend
cd backend
npm run start:dev

# Ver logs de CRON
tail -f backend/logs/billing.log

# Ejecutar CRON manualmente (para testing)
curl -X POST http://localhost:3000/api/billing/generate-invoices
curl -X POST http://localhost:3000/api/billing/send-reminders
curl -X POST http://localhost:3000/api/billing/suspend-overdue
```

### Base de Datos

```bash
# Ver facturas
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;

# Ver pagos
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

# Ver recordatorios
SELECT * FROM payment_reminders WHERE status = 'pending';

# Ver historial
SELECT * FROM billing_history ORDER BY created_at DESC LIMIT 20;
```

## Configuración Requerida

### Variables de Entorno (.env)

```env
# Billing Configuration
BILLING_GRACE_PERIOD_DAYS=3
BILLING_REMINDER_DAYS=7,5,3,1
BILLING_TAX_RATE=0.19
BILLING_CURRENCY=COP

# CRON Configuration
CRON_GENERATE_INVOICES=0 0 * * *
CRON_SEND_REMINDERS=0 9 * * *
CRON_SUSPEND_TENANTS=0 23 * * *

# Email Configuration (ya existente)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password
SMTP_FROM=noreply@tudominio.com
```

## Estructura de Archivos Final

```
backend/src/
├── payments/
│   ├── entities/
│   │   └── payment.entity.ts ✅
│   ├── dto/
│   │   └── create-payment.dto.ts ✅
│   ├── payments.controller.ts ✅
│   ├── payments.service.ts ✅
│   └── payments.module.ts ✅
├── invoices/
│   ├── entities/
│   │   └── invoice.entity.ts ✅
│   ├── dto/
│   │   └── create-invoice.dto.ts ✅
│   ├── invoices.controller.ts ⏳
│   ├── invoices.service.ts ⏳
│   └── invoices.module.ts ✅
├── billing/
│   ├── entities/
│   │   ├── payment-reminder.entity.ts ✅
│   │   └── billing-history.entity.ts ✅
│   ├── billing.controller.ts ⏳
│   ├── billing.service.ts ⏳
│   ├── billing-scheduler.service.ts ⏳
│   ├── payment-reminder.service.ts ⏳
│   └── billing.module.ts ⏳
└── mail/
    ├── templates/
    │   ├── payment-reminder.hbs ⏳
    │   ├── invoice-generated.hbs ⏳
    │   ├── payment-received.hbs ⏳
    │   ├── tenant-suspended.hbs ⏳
    │   └── tenant-activated.hbs ⏳
    └── mail.service.ts (actualizar) ⏳

frontend/src/
├── services/
│   ├── payments.service.ts ⏳
│   ├── invoices.service.ts ⏳
│   └── billing.service.ts ⏳
├── pages/
│   ├── PaymentsPage.tsx ⏳
│   ├── InvoicesPage.tsx ⏳
│   └── BillingDashboardPage.tsx ⏳
└── components/
    └── billing/
        ├── PaymentReminderBanner.tsx ⏳
        ├── InvoiceCard.tsx ⏳
        └── PaymentForm.tsx ⏳
```

## Próximos Pasos Inmediatos

1. ✅ Crear entidades y DTOs
2. ✅ Crear PaymentsModule completo
3. ⏳ Crear InvoicesService y Controller
4. ⏳ Crear BillingModule completo
5. ⏳ Implementar CRON jobs
6. ⏳ Crear templates de email
7. ⏳ Migración de base de datos
8. ⏳ Frontend completo
9. ⏳ Testing end-to-end

## Notas Importantes

- El sistema usa **soft deletes** para mantener historial
- Los CRON jobs deben ejecutarse en **un solo servidor** (usar locks si hay múltiples instancias)
- Las facturas tienen **numeración automática** secuencial
- Los recordatorios se envían **solo una vez** por cada período
- El período de gracia es **configurable** (default: 3 días)
- Los emails usan **plantillas Handlebars**
- El sistema soporta **múltiples métodos de pago**
- Las facturas incluyen **IVA del 19%** (configurable)
