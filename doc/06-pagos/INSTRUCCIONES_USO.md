# Instrucciones de Uso - Sistema de Pagos y Facturación

## Inicio Rápido

### 1. Verificar Instalación

```bash
cd backend
npm install
npm run build
```

### 2. Configurar Variables de Entorno

Agregar al archivo `backend/.env`:

```env
# Billing Configuration
BILLING_GRACE_PERIOD_DAYS=3
BILLING_REMINDER_DAYS=7,5,3,1
BILLING_TAX_RATE=0.19
BILLING_CURRENCY=COP

# Email Configuration (si aún no está configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@tudominio.com
SMTP_FROM_NAME=Sistema de Consentimientos
```

### 3. Iniciar el Backend

```bash
cd backend
npm run start:dev
```

### 4. Probar el Sistema

```bash
# Ejecutar script de prueba
npx ts-node test-billing-system.ts
```

## Uso del Sistema

### Para Super Admin

#### 1. Ver Dashboard Financiero

**Endpoint:** `GET /api/billing/dashboard`

**Respuesta:**
```json
{
  "monthlyRevenue": 450000,
  "pendingInvoices": 5,
  "overdueInvoices": 2,
  "suspendedTenants": 1,
  "upcomingDue": 3,
  "projectedRevenue": 890000,
  "revenueHistory": [...]
}
```

#### 2. Generar Facturas Manualmente

**Endpoint:** `POST /api/billing/generate-invoices`

**Respuesta:**
```json
{
  "generated": 5,
  "errors": []
}
```

#### 3. Enviar Recordatorios Manualmente

**Endpoint:** `POST /api/billing/send-reminders`

**Respuesta:**
```json
{
  "sent": 3,
  "errors": []
}
```

#### 4. Suspender Tenants Morosos Manualmente

**Endpoint:** `POST /api/billing/suspend-overdue`

**Respuesta:**
```json
{
  "suspended": 2,
  "errors": []
}
```

#### 5. Registrar un Pago

**Endpoint:** `POST /api/payments`

**Body:**
```json
{
  "tenantId": "uuid-del-tenant",
  "invoiceId": "uuid-de-la-factura",
  "amount": 89900,
  "paymentMethod": "transfer",
  "paymentReference": "REF-12345",
  "notes": "Pago recibido por transferencia bancaria"
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-pago",
  "tenantId": "uuid-del-tenant",
  "invoiceId": "uuid-de-la-factura",
  "amount": 89900,
  "status": "completed",
  "paymentMethod": "transfer",
  "paymentDate": "2026-01-07T...",
  "createdAt": "2026-01-07T..."
}
```

**Acciones Automáticas:**
- ✅ Marca la factura como pagada
- ✅ Si el tenant estaba suspendido, lo activa
- ✅ Extiende la suscripción del tenant
- ✅ Envía email de confirmación
- ✅ Registra en historial de auditoría

#### 6. Listar Facturas

**Endpoint:** `GET /api/invoices?status=pending&tenantId=uuid`

**Parámetros opcionales:**
- `status`: pending, paid, overdue, cancelled
- `tenantId`: UUID del tenant
- `startDate`: Fecha inicio (YYYY-MM-DD)
- `endDate`: Fecha fin (YYYY-MM-DD)

#### 7. Ver Facturas Vencidas

**Endpoint:** `GET /api/invoices/overdue`

#### 8. Marcar Factura como Pagada

**Endpoint:** `PATCH /api/invoices/:id/mark-as-paid`

#### 9. Cancelar Factura

**Endpoint:** `PATCH /api/invoices/:id/cancel`

**Body:**
```json
{
  "reason": "Factura duplicada"
}
```

#### 10. Ver Historial de Billing

**Endpoint:** `GET /api/billing/history?tenantId=uuid&limit=50`

### Para Tenants

#### 1. Ver Mis Facturas

**Endpoint:** `GET /api/invoices`

El sistema automáticamente filtra por el tenant del usuario autenticado.

#### 2. Ver Detalle de Factura

**Endpoint:** `GET /api/invoices/:id`

#### 3. Reenviar Factura por Email

**Endpoint:** `POST /api/invoices/:id/resend-email`

#### 4. Ver Mis Pagos

**Endpoint:** `GET /api/payments`

#### 5. Ver Detalle de Pago

**Endpoint:** `GET /api/payments/:id`

## CRON Jobs Automáticos

### 1. Generación de Facturas
**Horario:** Diario a las 00:00

**Qué hace:**
- Busca tenants con renovación próxima (próximos 30 días)
- Genera factura automáticamente
- Calcula impuestos (19% IVA)
- Envía email con la factura
- Programa recordatorios (7, 5, 3, 1 días antes)

### 2. Envío de Recordatorios
**Horario:** Diario a las 09:00

**Qué hace:**
- Busca recordatorios programados para hoy
- Envía email de recordatorio
- Crea notificación in-app (pendiente frontend)
- Marca recordatorio como enviado

### 3. Suspensión de Morosos
**Horario:** Diario a las 23:00

**Qué hace:**
- Busca facturas vencidas con período de gracia expirado
- Suspende el tenant automáticamente
- Envía email de suspensión
- Registra en historial

### 4. Limpieza de Datos
**Horario:** Domingos a las 02:00

**Qué hace:**
- Elimina recordatorios de hace más de 90 días
- Mantiene la base de datos limpia

### 5. Actualización de Facturas
**Horario:** Diario a las 01:00

**Qué hace:**
- Marca facturas pendientes como vencidas
- Actualiza estados automáticamente

## Flujos de Trabajo

### Flujo 1: Nuevo Tenant

1. **Creación del Tenant**
   - Se crea con plan seleccionado
   - Se establece `planStartedAt` y `planExpiresAt`
   - Estado: ACTIVE o TRIAL

2. **30 Días Antes de Vencimiento**
   - CRON genera factura automáticamente
   - Se envía email con la factura
   - Se programan recordatorios

3. **7 Días Antes**
   - CRON envía primer recordatorio
   - Email: "Faltan 7 días para el vencimiento"

4. **5 Días Antes**
   - CRON envía segundo recordatorio

5. **3 Días Antes**
   - CRON envía tercer recordatorio

6. **1 Día Antes**
   - CRON envía recordatorio final

7. **Día de Vencimiento**
   - Si no hay pago, factura se marca como vencida
   - Inicia período de gracia (3 días)

8. **3 Días Después del Vencimiento**
   - CRON suspende el tenant automáticamente
   - Se envía email de suspensión
   - Estado cambia a SUSPENDED

### Flujo 2: Pago Recibido

1. **Super Admin Registra Pago**
   - POST /api/payments con datos del pago

2. **Sistema Procesa Pago**
   - Valida tenant y factura
   - Marca factura como pagada
   - Registra fecha de pago

3. **Si Tenant Suspendido**
   - Cambia estado a ACTIVE
   - Extiende suscripción (1 mes o 1 año)
   - Envía email de reactivación

4. **Si Tenant Activo**
   - Extiende suscripción desde fecha actual

5. **Confirmación**
   - Envía email de confirmación de pago
   - Registra en historial de auditoría

### Flujo 3: Factura Manual

1. **Super Admin Crea Factura**
   - POST /api/invoices con datos

2. **Sistema Genera Factura**
   - Asigna número automático
   - Calcula impuestos
   - Envía por email

3. **Programación de Recordatorios**
   - Crea recordatorios automáticos
   - Según días configurados

## Métodos de Pago Soportados

- **transfer** - Transferencia Bancaria
- **card** - Tarjeta de Crédito/Débito
- **pse** - PSE (Pagos Seguros en Línea)
- **cash** - Efectivo
- **other** - Otro método

## Estados de Factura

- **draft** - Borrador (no usado actualmente)
- **pending** - Pendiente de pago
- **paid** - Pagada
- **overdue** - Vencida
- **cancelled** - Cancelada

## Estados de Pago

- **pending** - Pendiente de confirmación
- **completed** - Completado
- **failed** - Fallido
- **refunded** - Reembolsado

## Estados de Recordatorio

- **pending** - Pendiente de envío
- **sent** - Enviado
- **failed** - Falló el envío

## Acciones de Historial

- **invoice_created** - Factura creada
- **payment_received** - Pago recibido
- **payment_failed** - Pago fallido
- **reminder_sent** - Recordatorio enviado
- **tenant_suspended** - Tenant suspendido
- **tenant_activated** - Tenant activado
- **invoice_cancelled** - Factura cancelada
- **refund_issued** - Reembolso emitido

## Troubleshooting

### Problema: CRON jobs no se ejecutan

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar logs en consola
3. Verificar que `@nestjs/schedule` esté instalado

### Problema: Emails no se envían

**Solución:**
1. Verificar configuración SMTP en `.env`
2. Verificar que el email y password sean correctos
3. Para Gmail, usar "App Password" en lugar de password normal
4. Verificar logs de error en consola

### Problema: Tenant no se activa tras pago

**Solución:**
1. Verificar que el pago tenga `status: completed`
2. Verificar que el `invoiceId` sea correcto
3. Verificar logs en consola
4. Revisar historial de billing

### Problema: Facturas no se generan automáticamente

**Solución:**
1. Verificar que el tenant tenga `planExpiresAt` configurado
2. Verificar que falten menos de 30 días para el vencimiento
3. Verificar que no exista ya una factura pendiente
4. Ejecutar manualmente: `POST /api/billing/generate-invoices`

## Monitoreo

### Ver Logs de CRON Jobs

Los CRON jobs escriben logs en consola:

```
[BillingSchedulerService] Ejecutando tarea: Generar facturas mensuales
[BillingService] Encontrados 5 tenants para facturar
[BillingService] Factura generada para tenant Demo Clinic
[BillingService] Generación completada: 5 facturas generadas, 0 errores
```

### Ver Historial de Auditoría

```bash
curl http://localhost:3000/api/billing/history?limit=20 \
  -H "Authorization: Bearer TOKEN"
```

### Ver Dashboard en Tiempo Real

```bash
curl http://localhost:3000/api/billing/dashboard \
  -H "Authorization: Bearer TOKEN"
```

## Próximos Pasos

1. **Implementar Frontend**
   - Páginas de pagos y facturas
   - Dashboard financiero
   - Banner de recordatorios

2. **Generación de PDFs**
   - Facturas en PDF
   - Recibos de pago en PDF

3. **Integración con Pasarelas**
   - Mercado Pago
   - PayU
   - Stripe

4. **Notificaciones In-App**
   - Sistema de notificaciones en tiempo real
   - Badge en menú

5. **Reportes Avanzados**
   - Exportación a Excel
   - Gráficos de ingresos
   - Proyecciones financieras

## Soporte

Para más información, consultar:
- `doc/06-pagos/ARQUITECTURA_SISTEMA_PAGOS.md`
- `doc/06-pagos/SISTEMA_COMPLETADO.md`
- `doc/06-pagos/GUIA_IMPLEMENTACION.md`
