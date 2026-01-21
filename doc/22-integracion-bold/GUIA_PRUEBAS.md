# Guía de Pruebas - Integración Bold

## 🧪 Pruebas Backend

### 1. Verificar Compilación

```powershell
cd backend
npm run build
```

✅ Debe compilar sin errores

### 2. Verificar Configuración

Revisar que `.env` tenga todas las variables:

```env
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://sandbox-api.bold.co/v1
BOLD_WEBHOOK_SECRET=pendiente_configurar
BOLD_WEBHOOK_URL=pendiente_configurar
BOLD_SUCCESS_URL=http://localhost:5173/payment-success
```

### 3. Aplicar Migración de Base de Datos

```powershell
cd backend
node apply-bold-migration.js
```

Verificar que las columnas se agregaron:

```sql
-- Conectar a PostgreSQL
psql -U postgres -d consentimientos

-- Verificar columnas en invoices
\d invoices

-- Verificar columnas en payments
\d payments
```

### 4. Iniciar Backend

```powershell
cd backend
npm run start:dev
```

Verificar logs:
```
✅ Bold Service inicializado
   API URL: https://sandbox-api.bold.co/v1
   Merchant ID: 0fhPQYC
```

### 5. Probar Endpoint de Crear Link de Pago

**Usando Postman/Thunder Client:**

```http
POST http://localhost:3000/api/invoices/:invoiceId/create-payment-link
Authorization: Bearer {tu_token_jwt}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "paymentLink": "https://checkout.bold.co/payment/abc123",
  "message": "Link de pago creado exitosamente"
}
```

### 6. Verificar que el Link se Guardó

```http
GET http://localhost:3000/api/invoices/:invoiceId
Authorization: Bearer {tu_token_jwt}
```

**Verificar campos:**
```json
{
  "id": "...",
  "boldPaymentLink": "https://checkout.bold.co/payment/abc123",
  "boldPaymentReference": "INV-2026-001-1737331200000",
  ...
}
```

## 🌐 Configurar Webhook (Desarrollo)

### Opción 1: ngrok (Recomendado)

**1. Instalar ngrok:**

```powershell
# Con Chocolatey
choco install ngrok

# O descargar de https://ngrok.com/download
```

**2. Iniciar túnel:**

```powershell
# Iniciar backend primero
cd backend
npm run start:dev

# En otra terminal, iniciar ngrok
ngrok http 3000
```

**3. Copiar URL HTTPS:**

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**4. Configurar en Bold:**

- Ir a: https://dashboard.bold.co/webhooks
- Agregar webhook:
  - URL: `https://abc123.ngrok.io/webhooks/bold`
  - Eventos: `payment.succeeded`, `payment.failed`, `payment.pending`
  - Copiar el "Webhook Secret" generado

**5. Actualizar `.env`:**

```env
BOLD_WEBHOOK_SECRET=secret_copiado_de_bold
BOLD_WEBHOOK_URL=https://abc123.ngrok.io/webhooks/bold
```

**6. Reiniciar backend:**

```powershell
# Ctrl+C para detener
npm run start:dev
```

### Opción 2: Port Forwarding (Producción)

Ver `CONFIGURACION_LOCALHOST.md` para detalles completos.

## 🧪 Probar Flujo Completo

### 1. Crear Factura de Prueba

```http
POST http://localhost:3000/api/invoices
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "tenantId": "uuid-del-tenant",
  "amount": 50000,
  "currency": "COP",
  "status": "pending",
  "dueDate": "2026-02-20",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "items": [
    {
      "description": "Plan Básico - Mensual",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000
    }
  ],
  "notes": "Factura de prueba para Bold"
}
```

### 2. Crear Link de Pago

```http
POST http://localhost:3000/api/invoices/{invoiceId}/create-payment-link
Authorization: Bearer {token}
```

### 3. Abrir Link de Pago

Copiar el `paymentLink` de la respuesta y abrirlo en el navegador.

### 4. Realizar Pago de Prueba

**Tarjetas de prueba Bold:**

- **Visa Exitosa:** 4111 1111 1111 1111
- **Mastercard Exitosa:** 5500 0000 0000 0004
- **CVV:** 123
- **Fecha:** Cualquier fecha futura
- **Nombre:** Cualquier nombre

### 5. Verificar Webhook Recibido

**Ver logs del backend:**

```
📥 Webhook recibido de Bold
   Event: payment.succeeded
   Transaction ID: txn_abc123
   Reference: INV-2026-001-1737331200000
✅ Firma de webhook válida
💰 Procesando pago exitoso
✅ Factura encontrada: 2026-001
✅ Pago registrado: payment-uuid
✅ Factura marcada como pagada
✅ Tenant activado automáticamente
✅ Email de confirmación enviado
```

### 6. Verificar Factura Pagada

```http
GET http://localhost:3000/api/invoices/{invoiceId}
Authorization: Bearer {token}
```

**Verificar:**
```json
{
  "status": "paid",
  "paidAt": "2026-01-20T...",
  "boldTransactionId": "txn_abc123",
  "payments": [
    {
      "amount": 50000,
      "boldTransactionId": "txn_abc123",
      "boldPaymentMethod": "card",
      ...
    }
  ]
}
```

### 7. Verificar Tenant Activado

```http
GET http://localhost:3000/api/tenants/{tenantId}
Authorization: Bearer {super_admin_token}
```

**Verificar:**
```json
{
  "status": "active",
  ...
}
```

### 8. Verificar Email Enviado

Revisar bandeja de entrada del tenant para:
- Email de confirmación de pago
- Email de activación de cuenta (si estaba suspendido)

## 🐛 Troubleshooting

### Webhook no se recibe

**1. Verificar ngrok está corriendo:**
```powershell
# Ver túneles activos
ngrok http 3000
```

**2. Verificar URL en Bold:**
- Debe ser HTTPS
- Debe terminar en `/webhooks/bold`
- Ejemplo: `https://abc123.ngrok.io/webhooks/bold`

**3. Ver logs de ngrok:**
```
# Abrir en navegador
http://localhost:4040
```

### Firma de webhook inválida

**1. Verificar BOLD_WEBHOOK_SECRET:**
```powershell
# Ver variable
echo $env:BOLD_WEBHOOK_SECRET
```

**2. Copiar secret correcto de Bold panel**

**3. Reiniciar backend**

### Error al crear link de pago

**1. Verificar credenciales:**
```env
BOLD_API_KEY=correcto
BOLD_SECRET_KEY=correcto
BOLD_MERCHANT_ID=correcto
```

**2. Verificar API URL:**
```env
# Sandbox
BOLD_API_URL=https://sandbox-api.bold.co/v1

# Producción
BOLD_API_URL=https://api.bold.co/v1
```

**3. Ver logs del backend para detalles del error**

### Tenant no se activa

**1. Verificar que tenant estaba suspendido:**
```sql
SELECT id, name, status FROM tenants WHERE id = 'tenant-uuid';
```

**2. Ver logs del webhook:**
```
✅ Tenant activado automáticamente
```

**3. Verificar historial de facturación:**
```sql
SELECT * FROM billing_history 
WHERE tenant_id = 'tenant-uuid' 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📊 Verificar Datos en Base de Datos

### Facturas con Bold

```sql
SELECT 
  id,
  invoice_number,
  status,
  total,
  bold_payment_link,
  bold_payment_reference,
  bold_transaction_id,
  paid_at
FROM invoices
WHERE bold_payment_link IS NOT NULL
ORDER BY created_at DESC;
```

### Pagos de Bold

```sql
SELECT 
  p.id,
  p.amount,
  p.payment_method,
  p.bold_transaction_id,
  p.bold_payment_method,
  i.invoice_number,
  t.name as tenant_name
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
JOIN tenants t ON p.tenant_id = t.id
WHERE p.bold_transaction_id IS NOT NULL
ORDER BY p.created_at DESC;
```

### Historial de Facturación

```sql
SELECT 
  bh.action,
  bh.description,
  bh.metadata,
  bh.created_at,
  t.name as tenant_name
FROM billing_history bh
JOIN tenants t ON bh.tenant_id = t.id
WHERE bh.action IN ('payment_link_created', 'payment_received', 'tenant_activated')
ORDER BY bh.created_at DESC
LIMIT 20;
```

## ✅ Checklist de Pruebas

### Backend
- [ ] Compilación exitosa
- [ ] Variables de entorno configuradas
- [ ] Migración aplicada
- [ ] Backend inicia sin errores
- [ ] Logs de Bold Service visibles

### Endpoints
- [ ] POST /api/invoices/:id/create-payment-link funciona
- [ ] Link de pago se guarda en factura
- [ ] Link de pago abre en navegador

### Webhooks
- [ ] ngrok configurado y corriendo
- [ ] Webhook configurado en Bold
- [ ] Webhook se recibe en backend
- [ ] Firma de webhook válida
- [ ] Pago se procesa correctamente

### Flujo Completo
- [ ] Factura se crea
- [ ] Link de pago se genera
- [ ] Pago se realiza en Bold
- [ ] Webhook se recibe
- [ ] Pago se registra
- [ ] Factura se marca como pagada
- [ ] Tenant se activa (si estaba suspendido)
- [ ] Email de confirmación se envía

### Base de Datos
- [ ] Columnas Bold existen en invoices
- [ ] Columnas Bold existen en payments
- [ ] Datos se guardan correctamente
- [ ] Historial de facturación se registra

## 📝 Notas

- **Sandbox:** Usar tarjetas de prueba, no se cobran
- **Producción:** Usar credenciales de producción y probar con monto pequeño
- **Webhooks:** Bold reintenta hasta 3 veces si falla
- **Timeout:** Bold espera respuesta en 30 segundos
- **Logs:** Revisar siempre los logs para debugging

---

**Última actualización:** 20 de enero de 2026
