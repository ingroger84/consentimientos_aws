# Arquitectura del Sistema de Pagos y Facturación

## Fecha
7 de enero de 2026

## Visión General

Sistema completo de gestión de pagos, facturación y cobros automáticos para el sistema multi-tenant de consentimientos digitales.

## Componentes Principales

### 1. Entidades de Base de Datos

#### Payment (Pagos)
```typescript
- id: UUID
- tenantId: UUID (FK)
- invoiceId: UUID (FK)
- amount: number
- currency: string (COP)
- status: pending | completed | failed | refunded
- paymentMethod: transfer | card | pse | cash
- paymentReference: string
- paymentDate: Date
- metadata: JSON
- createdAt: Date
- updatedAt: Date
```

#### Invoice (Facturas)
```typescript
- id: UUID
- tenantId: UUID (FK)
- invoiceNumber: string (auto-generado)
- amount: number
- tax: number
- total: number
- currency: string (COP)
- status: draft | pending | paid | overdue | cancelled
- dueDate: Date
- paidAt: Date
- periodStart: Date
- periodEnd: Date
- items: JSON (líneas de factura)
- notes: string
- createdAt: Date
- updatedAt: Date
```

#### PaymentReminder (Recordatorios)
```typescript
- id: UUID
- tenantId: UUID (FK)
- invoiceId: UUID (FK)
- reminderType: email | in_app | both
- daysBeforeDue: number (7, 5, 3, 1)
- sentAt: Date
- status: pending | sent | failed
- createdAt: Date
```

#### BillingHistory (Historial)
```typescript
- id: UUID
- tenantId: UUID (FK)
- action: invoice_created | payment_received | tenant_suspended | tenant_activated
- description: string
- metadata: JSON
- createdAt: Date
```

### 2. Módulos Backend

#### PaymentsModule
- `payments.controller.ts` - Endpoints REST
- `payments.service.ts` - Lógica de negocio
- `payments.entity.ts` - Entidad TypeORM
- `dto/create-payment.dto.ts` - DTOs

#### InvoicesModule
- `invoices.controller.ts` - Endpoints REST
- `invoices.service.ts` - Generación de facturas
- `invoices.entity.ts` - Entidad TypeORM
- `invoice-generator.service.ts` - Generación de PDF

#### BillingModule
- `billing.controller.ts` - Endpoints REST
- `billing.service.ts` - Lógica de cobros
- `billing-scheduler.service.ts` - Tareas programadas (CRON)
- `payment-reminder.service.ts` - Envío de recordatorios

### 3. Servicios de Soporte

#### InvoiceGeneratorService
- Generación de PDFs de facturas
- Plantillas personalizables
- Numeración automática
- Cálculo de impuestos

#### PaymentReminderService
- Envío de recordatorios por email
- Notificaciones in-app
- Programación de recordatorios

#### BillingSchedulerService
- CRON jobs para:
  - Generar facturas mensuales
  - Enviar recordatorios
  - Suspender tenants morosos
  - Activar tenants que pagaron

### 4. Frontend

#### Páginas
- `PaymentsPage.tsx` - Historial de pagos (Tenant)
- `InvoicesPage.tsx` - Facturas del tenant
- `BillingDashboardPage.tsx` - Dashboard financiero (Super Admin)
- `PaymentMethodsPage.tsx` - Métodos de pago del tenant

#### Componentes
- `PaymentReminderBanner.tsx` - Banner de recordatorio
- `InvoiceCard.tsx` - Tarjeta de factura
- `PaymentForm.tsx` - Formulario de pago
- `InvoiceViewer.tsx` - Visor de facturas PDF

## Flujos de Trabajo

### Flujo 1: Generación de Factura Mensual
```
1. CRON ejecuta cada día a las 00:00
2. Busca tenants con renovación próxima (próximos 30 días)
3. Genera factura para cada tenant
4. Envía email con factura adjunta
5. Programa recordatorios (7, 5, 3, 1 días antes)
6. Registra en historial
```

### Flujo 2: Envío de Recordatorios
```
1. CRON ejecuta cada día a las 09:00
2. Busca recordatorios pendientes para hoy
3. Para cada recordatorio:
   - Envía email al contacto del tenant
   - Crea notificación in-app
   - Marca recordatorio como enviado
4. Registra en historial
```

### Flujo 3: Suspensión Automática
```
1. CRON ejecuta cada día a las 23:00
2. Busca facturas vencidas (dueDate < hoy)
3. Busca tenants con período de gracia expirado (3 días)
4. Para cada tenant:
   - Cambia status a 'suspended'
   - Envía email de suspensión
   - Crea notificación in-app
   - Registra en historial
```

### Flujo 4: Registro de Pago
```
1. Super Admin registra pago manualmente
2. Sistema valida datos del pago
3. Marca factura como 'paid'
4. Si tenant estaba suspendido:
   - Cambia status a 'active'
   - Actualiza planExpiresAt
   - Envía email de activación
5. Genera recibo de pago
6. Envía email con recibo
7. Registra en historial
```

### Flujo 5: Pago Automático (Futuro)
```
1. Tenant configura método de pago automático
2. Al vencer factura, sistema intenta cobro
3. Si exitoso: aplica flujo 4
4. Si falla: envía notificación y programa reintento
```

## Tareas CRON

```typescript
// Generar facturas mensuales
@Cron('0 0 * * *') // Diario a las 00:00
async generateMonthlyInvoices()

// Enviar recordatorios
@Cron('0 9 * * *') // Diario a las 09:00
async sendPaymentReminders()

// Suspender tenants morosos
@Cron('0 23 * * *') // Diario a las 23:00
async suspendOverdueTenants()

// Limpiar recordatorios antiguos
@Cron('0 2 * * 0') // Domingos a las 02:00
async cleanupOldReminders()
```

## Endpoints API

### Payments
```
POST   /api/payments              - Registrar pago
GET    /api/payments              - Listar pagos (filtros)
GET    /api/payments/:id          - Detalle de pago
GET    /api/payments/:id/receipt  - Descargar recibo PDF
```

### Invoices
```
POST   /api/invoices                    - Crear factura manual
GET    /api/invoices                    - Listar facturas
GET    /api/invoices/:id                - Detalle de factura
GET    /api/invoices/:id/pdf            - Descargar PDF
PATCH  /api/invoices/:id/mark-as-paid   - Marcar como pagada
POST   /api/invoices/:id/send-email     - Reenviar por email
```

### Billing
```
GET    /api/billing/dashboard           - Dashboard financiero
GET    /api/billing/overdue             - Tenants morosos
POST   /api/billing/generate-invoices   - Generar facturas manualmente
POST   /api/billing/send-reminders      - Enviar recordatorios manualmente
```

## Seguridad

1. **Autenticación** - JWT tokens
2. **Autorización** - Solo Super Admin puede ver todos los pagos
3. **Validación** - DTOs con class-validator
4. **Auditoría** - Logs de todas las operaciones
5. **Encriptación** - Datos sensibles de pago encriptados

## Notificaciones

### Email Templates
- `payment-reminder.hbs` - Recordatorio de pago
- `invoice-generated.hbs` - Nueva factura
- `payment-received.hbs` - Confirmación de pago
- `tenant-suspended.hbs` - Suspensión por falta de pago
- `tenant-activated.hbs` - Reactivación tras pago

### In-App Notifications
- Banner superior con cuenta regresiva
- Badge en menú "Mi Plan"
- Modal al iniciar sesión (si vencido)

## Métricas y Reportes

### Dashboard Super Admin
- Ingresos mensuales
- Tasa de cobro
- Tenants morosos
- Facturas pendientes
- Proyección de ingresos

### Dashboard Tenant
- Próximo pago
- Historial de pagos
- Facturas descargables
- Métodos de pago

## Tecnologías

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Scheduler**: @nestjs/schedule (CRON)
- **PDF**: pdfmake o puppeteer
- **Email**: Nodemailer
- **Frontend**: React, TailwindCSS
- **Notificaciones**: React Context API

## Fases de Implementación

### Fase 1: Base (Actual)
- ✅ Entidades de base de datos
- ✅ Módulos básicos
- ✅ Generación de facturas
- ✅ Recordatorios por email
- ✅ Suspensión automática

### Fase 2: Mejoras
- ⏳ Dashboard de pagos
- ⏳ Notificaciones in-app
- ⏳ Generación de PDF mejorada
- ⏳ Reportes financieros

### Fase 3: Automatización
- ⏳ Integración con pasarelas
- ⏳ Pagos automáticos
- ⏳ Webhooks
- ⏳ API pública

### Fase 4: Avanzado
- ⏳ Descuentos y cupones
- ⏳ Facturación electrónica DIAN
- ⏳ Multi-moneda
- ⏳ Suscripciones flexibles
