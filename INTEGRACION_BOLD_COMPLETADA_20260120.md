# Integración Bold - Completada ✅

**Fecha:** 20 de enero de 2026  
**Estado:** Implementación Backend Completa

## 📋 Resumen

Se ha completado la implementación backend de la integración con Bold (pasarela de pagos colombiana). El sistema ahora puede:

1. ✅ Crear links de pago para facturas
2. ✅ Recibir y procesar webhooks de Bold
3. ✅ Activar automáticamente tenants después del pago
4. ✅ Suspender automáticamente tenants con facturas vencidas
5. ✅ Enviar emails de confirmación de pago

## 🔧 Componentes Implementados

### 1. BoldService (`backend/src/payments/bold.service.ts`)

Servicio principal para interactuar con la API de Bold:

- `createPaymentLink()` - Crear link de pago
- `getPaymentStatus()` - Consultar estado de transacción
- `validateWebhookSignature()` - Validar firma HMAC-SHA256
- `processWebhook()` - Procesar notificaciones de Bold
- `cancelPaymentLink()` - Cancelar link de pago
- `testConnection()` - Verificar conexión con Bold

### 2. WebhooksController (`backend/src/webhooks/webhooks.controller.ts`)

Controlador para recibir webhooks de Bold:

- `POST /webhooks/bold` - Endpoint para webhooks
- Validación de firma HMAC-SHA256
- Manejo de eventos:
  - `payment.succeeded` - Pago exitoso
  - `payment.failed` - Pago fallido
  - `payment.pending` - Pago pendiente

### 3. InvoicesService - Métodos Nuevos

**`findByReference(reference: string)`**
- Busca factura por referencia de pago Bold

**`createPaymentLink(invoiceId: string)`**
- Crea link de pago en Bold
- Guarda link y referencia en la factura
- Registra en historial de facturación

**`activateTenantAfterPayment(tenantId: string)`**
- Activa tenant suspendido después del pago
- Registra en historial de facturación

**`sendPaymentConfirmation(invoiceId: string)`**
- Envía email de confirmación de pago

**`markAsPaidWithPayment(id: string, paymentId: string)`**
- Marca factura como pagada con ID de pago
- Registra en historial

### 4. InvoicesController - Endpoint Nuevo

**`POST /api/invoices/:id/create-payment-link`**
- Crea link de pago Bold para una factura
- Requiere autenticación
- Permisos: Super Admin o dueño del tenant
- Retorna: `{ success: true, paymentLink: string, message: string }`

### 5. Entidades Actualizadas

**Invoice Entity:**
- `boldPaymentLink` - URL del link de pago
- `boldPaymentReference` - Referencia única para Bold
- `boldTransactionId` - ID de transacción de Bold

**Payment Entity:**
- `boldTransactionId` - ID de transacción
- `boldPaymentMethod` - Método de pago usado
- `boldPaymentData` - Datos completos del webhook

**BillingHistory Entity:**
- Nuevo enum: `PAYMENT_LINK_CREATED`

### 6. Migración de Base de Datos

**Archivo:** `backend/add-bold-integration-columns.sql`

```sql
-- Columnas agregadas a invoices
ALTER TABLE invoices ADD COLUMN bold_payment_link VARCHAR(500);
ALTER TABLE invoices ADD COLUMN bold_transaction_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN bold_payment_reference VARCHAR(100);

-- Columnas agregadas a payments
ALTER TABLE payments ADD COLUMN bold_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN bold_payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN bold_payment_data JSONB;
```

**Script de aplicación:** `backend/apply-bold-migration.js`

### 7. Cron Job para Suspensión Automática

Ya existe en `BillingSchedulerService`:

```typescript
@Cron('0 23 * * *') // Diario a las 23:00
async handleSuspendOverdue() {
  const result = await this.billingService.suspendOverdueTenants();
  this.logger.log(`Tenants suspendidos: ${result.suspended}`);
}
```

## 🔐 Configuración

### Variables de Entorno (`.env`)

```env
# Bold Payment Gateway
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://sandbox-api.bold.co/v1
BOLD_WEBHOOK_SECRET=tu_webhook_secret_aqui
BOLD_WEBHOOK_URL=https://tu-dominio.com/webhooks/bold
BOLD_SUCCESS_URL=https://tu-dominio.com/payment-success
```

## 🔄 Flujo de Pago

### 1. Crear Link de Pago

```
Usuario/Admin → POST /api/invoices/:id/create-payment-link
                ↓
         InvoicesService.createPaymentLink()
                ↓
         BoldService.createPaymentLink()
                ↓
         Bold API (crea link)
                ↓
         Guarda link en invoice.boldPaymentLink
                ↓
         Retorna URL del link de pago
```

### 2. Cliente Paga

```
Cliente → Abre link de pago → Paga en Bold
                                    ↓
                         Bold procesa el pago
                                    ↓
                         Bold envía webhook
```

### 3. Webhook de Pago Exitoso

```
Bold → POST /webhooks/bold (con firma HMAC-SHA256)
              ↓
       Valida firma
              ↓
       Busca factura por referencia
              ↓
       Verifica monto
              ↓
       Crea registro de pago
              ↓
       Marca factura como pagada
              ↓
       Activa tenant (si estaba suspendido)
              ↓
       Envía email de confirmación
```

## 📧 Emails Automáticos

1. **Confirmación de Pago** - Cuando se recibe el pago
2. **Tenant Activado** - Cuando se reactiva un tenant suspendido
3. **Factura Creada** - Cuando se genera una factura (ya existía)

## 🔒 Seguridad

### Validación de Webhooks

Los webhooks de Bold se validan usando HMAC-SHA256:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new UnauthorizedException('Invalid webhook signature');
}
```

### Verificación de Montos

Antes de marcar una factura como pagada, se verifica que el monto coincida:

```typescript
if (Math.abs(invoice.total - webhookData.amount) > 0.01) {
  throw new BadRequestException('Amount mismatch');
}
```

## 📝 Próximos Pasos

### 1. Configurar Webhook en Bold

**Opción A: Desarrollo con ngrok (Recomendado)**
```powershell
# Instalar ngrok
choco install ngrok

# Iniciar túnel
ngrok http 3000

# Copiar URL HTTPS generada
# Ejemplo: https://abc123.ngrok.io

# Configurar en Bold Panel:
# Webhook URL: https://abc123.ngrok.io/webhooks/bold
```

**Opción B: Port Forwarding con IP Pública**
1. Configurar port forwarding en router (puerto 3000 → servidor)
2. Configurar SSL/TLS (Bold requiere HTTPS)
3. Usar dominio o IP pública con certificado SSL

### 2. Actualizar Variables de Entorno

Después de configurar el webhook en Bold:

```env
BOLD_WEBHOOK_SECRET=secret_generado_por_bold
BOLD_WEBHOOK_URL=https://tu-url/webhooks/bold
```

### 3. Implementar Frontend

**Componentes a crear:**

1. **Botón "Pagar Ahora" en Facturas**
   - Llama a `POST /api/invoices/:id/create-payment-link`
   - Abre link de pago en nueva ventana

2. **Página de Confirmación de Pago**
   - Ruta: `/invoices/:id/payment-success`
   - Muestra mensaje de éxito
   - Actualiza estado de factura

3. **Indicador de Link de Pago**
   - Mostrar si factura tiene link de pago activo
   - Permitir copiar link

### 4. Testing

**Probar en Sandbox:**

1. Crear factura de prueba
2. Generar link de pago
3. Realizar pago de prueba en Bold
4. Verificar que webhook se recibe
5. Verificar que factura se marca como pagada
6. Verificar que tenant se activa
7. Verificar que se envía email

**Tarjetas de Prueba Bold:**
- Visa: 4111 1111 1111 1111
- Mastercard: 5500 0000 0000 0004
- CVV: 123
- Fecha: Cualquier fecha futura

### 5. Migración a Producción

Cuando esté listo para producción:

1. Obtener credenciales de producción de Bold
2. Actualizar variables de entorno:
   ```env
   BOLD_API_KEY=produccion_api_key
   BOLD_SECRET_KEY=produccion_secret_key
   BOLD_MERCHANT_ID=produccion_merchant_id
   BOLD_API_URL=https://api.bold.co/v1
   ```
3. Configurar webhook en panel de producción de Bold
4. Probar con transacción real pequeña

## 🐛 Debugging

### Ver Logs de Webhooks

```bash
# Backend logs
tail -f logs/application.log | grep "Bold"
```

### Probar Conexión con Bold

Crear endpoint de prueba:

```typescript
@Get('test-bold')
async testBold() {
  return await this.boldService.testConnection();
}
```

### Verificar Webhook Signature

Si los webhooks fallan por firma inválida:

1. Verificar que `BOLD_WEBHOOK_SECRET` sea correcto
2. Verificar que el payload no se modifique antes de validar
3. Verificar que se use el mismo algoritmo (HMAC-SHA256)

## 📚 Documentación Adicional

- **Bold API Docs:** https://docs.bold.co
- **Configuración Localhost:** `PASOS_CONFIGURAR_BOLD_LOCALHOST.md`
- **Configuración Bold Panel:** `doc/22-integracion-bold/CONFIGURACION_BOLD.md`
- **Script ngrok:** `start-dev-with-ngrok.ps1`

## ✅ Checklist de Implementación

- [x] BoldService creado
- [x] WebhooksController creado
- [x] Métodos en InvoicesService
- [x] Endpoint crear link de pago
- [x] Entidades actualizadas
- [x] Migración de base de datos
- [x] Validación de webhooks
- [x] Activación automática de tenants
- [x] Emails de confirmación
- [x] Cron job para suspensión
- [x] Documentación completa
- [ ] Configurar webhook en Bold
- [ ] Implementar frontend
- [ ] Testing completo
- [ ] Migración a producción

## 🎯 Estado Actual

**Backend:** ✅ 100% Completo  
**Frontend:** ⏳ Pendiente  
**Testing:** ⏳ Pendiente  
**Producción:** ⏳ Pendiente

---

**Última actualización:** 20 de enero de 2026
