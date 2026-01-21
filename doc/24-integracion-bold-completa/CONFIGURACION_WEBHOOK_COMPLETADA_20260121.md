# ✅ Configuración de Webhook Bold Completada

**Fecha:** 2026-01-21 06:30 UTC  
**Estado:** ✅ Configurado y Listo para Pruebas

---

## 📋 Resumen

Se ha completado la configuración del webhook de Bold en el servidor de producción. El sistema ahora está listo para recibir notificaciones de pagos.

---

## 🔧 Configuración Aplicada

### Variables de Entorno Actualizadas

```env
# Bold Payment Gateway - SANDBOX
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://sandbox-api.bold.co/v1

# Webhook Configuration
BOLD_WEBHOOK_SECRET=KWpgscWMWny3apOYs0Wvg
BOLD_WEBHOOK_URL=https://datagree.net/api/webhooks/bold

# Redirect URLs
BOLD_SUCCESS_URL=https://datagree.net/payment/success
BOLD_FAILURE_URL=https://datagree.net/payment/failure
```

### Webhook en Bold Panel

- **URL:** `https://datagree.net/api/webhooks/bold`
- **Método:** POST
- **Autenticación:** HMAC-SHA256 signature
- **Secret Key:** Configurado ✅

---

## ✅ Verificación

### Backend
- ✅ Variables de entorno actualizadas
- ✅ Backend reiniciado con `--update-env`
- ✅ Aplicación iniciada correctamente
- ✅ Endpoint `/api/webhooks/bold` disponible

### Webhook
- ✅ URL configurada en Bold
- ✅ Secret key configurada
- ✅ Validación HMAC-SHA256 implementada

---

## 🔄 Flujo Completo de Pago

### 1. Usuario Solicita Pagar Factura

```
Usuario → Click "Pagar Ahora"
         ↓
Frontend → POST /api/invoices/:id/create-payment-link
         ↓
Backend → BoldService.createPaymentLink()
         ↓
Bold API → Crea link de pago
         ↓
Backend → Guarda link en invoice.boldPaymentLink
         ↓
Frontend → Abre link en nueva ventana
```

### 2. Usuario Completa el Pago

```
Usuario → Ingresa datos de pago en Bold
         ↓
Bold → Procesa el pago
         ↓
Bold → Envía webhook a https://datagree.net/api/webhooks/bold
```

### 3. Sistema Procesa el Webhook

```
Bold → POST /api/webhooks/bold
      (con header x-bold-signature)
         ↓
WebhooksController → Valida firma HMAC-SHA256
         ↓
         ✅ Firma válida
         ↓
WebhooksController → Procesa evento (payment.succeeded)
         ↓
1. Busca factura por referencia
2. Verifica monto
3. Crea registro de pago
4. Marca factura como pagada
5. Activa tenant (si estaba suspendido)
6. Envía email de confirmación
         ↓
         ✅ Pago procesado exitosamente
```

---

## 🧪 Próximos Pasos para Pruebas

### 1. Crear Factura de Prueba

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Acceder a la aplicación
# https://admin.datagree.net

# Crear factura manual para un tenant
```

### 2. Generar Link de Pago

Desde la interfaz de facturas:
1. Ir a la factura creada
2. Click en "Pagar Ahora"
3. Se genera el link de pago en Bold
4. Se abre en nueva ventana

### 3. Realizar Pago de Prueba

**Tarjetas de Prueba Bold (Sandbox):**

```
Visa Exitosa:
- Número: 4111 1111 1111 1111
- CVV: 123
- Fecha: Cualquier fecha futura
- Resultado: Pago exitoso

Mastercard Exitosa:
- Número: 5500 0000 0000 0004
- CVV: 123
- Fecha: Cualquier fecha futura
- Resultado: Pago exitoso

Visa Rechazada:
- Número: 4000 0000 0000 0002
- CVV: 123
- Fecha: Cualquier fecha futura
- Resultado: Pago rechazado
```

### 4. Verificar Webhook

```bash
# Ver logs del backend en tiempo real
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree-backend

# Buscar mensajes de webhook
# Deberías ver:
# - "📥 Webhook recibido de Bold"
# - "✅ Firma de webhook válida"
# - "💰 Procesando pago exitoso"
# - "✅ Factura marcada como pagada"
# - "✅ Tenant activado automáticamente"
# - "✅ Email de confirmación enviado"
```

### 5. Verificar en la Base de Datos

```bash
# Conectar a PostgreSQL
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
sudo -u postgres psql consentimientos

# Verificar factura pagada
SELECT invoice_number, status, paid_at, bold_transaction_id 
FROM invoices 
WHERE bold_payment_link IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

# Verificar pago registrado
SELECT id, amount, payment_method, bold_transaction_id, created_at 
FROM payments 
ORDER BY created_at DESC 
LIMIT 5;

# Verificar tenant activado
SELECT name, slug, status, suspended_at 
FROM tenants 
WHERE id = 'tenant_id_aqui';
```

---

## 🔍 Debugging

### Ver Logs de Webhooks

```bash
# Logs en tiempo real
pm2 logs datagree-backend | grep -E "(Webhook|Bold|payment)"

# Logs históricos
pm2 logs datagree-backend --lines 200 --nostream | grep -E "(Webhook|Bold)"
```

### Verificar Firma del Webhook

Si el webhook falla por firma inválida:

1. **Verificar Secret Key:**
   ```bash
   cat /home/ubuntu/consentimientos_aws/backend/.env | grep BOLD_WEBHOOK_SECRET
   ```

2. **Verificar que coincida con Bold Panel**

3. **Ver logs de validación:**
   ```bash
   pm2 logs datagree-backend | grep "firma"
   ```

### Probar Endpoint Manualmente

```bash
# Desde el servidor
curl -X POST https://datagree.net/api/webhooks/bold \
  -H "Content-Type: application/json" \
  -H "x-bold-signature: test" \
  -d '{
    "event": "payment.succeeded",
    "transaction": {
      "id": "test123",
      "reference": "INV-001",
      "amount": 10000,
      "currency": "COP",
      "status": "approved",
      "paymentMethod": "card",
      "createdAt": "2026-01-21T06:00:00Z"
    },
    "customer": {
      "email": "test@test.com",
      "name": "Test User"
    }
  }'
```

---

## ⚠️ Notas Importantes

### Eventos de Bold

Los eventos que Bold puede enviar son:
- `payment.succeeded` - Pago exitoso ✅ Implementado
- `payment.failed` - Pago fallido ✅ Implementado
- `payment.pending` - Pago pendiente ✅ Implementado

### Validación de Firma

El webhook valida la firma usando HMAC-SHA256:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', BOLD_WEBHOOK_SECRET)
  .update(payloadString)
  .digest('hex');
```

Si la firma no coincide, el webhook retorna `401 Unauthorized`.

### Reintentos de Bold

Si el webhook falla (retorna error 5xx), Bold reintentará:
- Primer reintento: 1 minuto después
- Segundo reintento: 5 minutos después
- Tercer reintento: 15 minutos después
- Cuarto reintento: 1 hora después

### Ambiente Sandbox

Actualmente configurado en **SANDBOX** (pruebas):
- URL: `https://sandbox-api.bold.co/v1`
- Usar tarjetas de prueba
- No se procesan pagos reales

Para **PRODUCCIÓN**, cambiar:
```env
BOLD_API_URL=https://api.bold.co/v1
BOLD_API_KEY=produccion_api_key
BOLD_SECRET_KEY=produccion_secret_key
BOLD_MERCHANT_ID=produccion_merchant_id
```

---

## 📊 Checklist de Verificación

### Configuración
- [x] Webhook URL configurada en Bold
- [x] Secret key configurada en Bold
- [x] Variables de entorno actualizadas en servidor
- [x] Backend reiniciado con nuevas variables
- [x] Endpoint `/api/webhooks/bold` disponible

### Pruebas Pendientes
- [ ] Crear factura de prueba
- [ ] Generar link de pago
- [ ] Realizar pago con tarjeta de prueba
- [ ] Verificar que webhook se recibe
- [ ] Verificar que factura se marca como pagada
- [ ] Verificar que tenant se activa
- [ ] Verificar que se envía email de confirmación

### Producción
- [ ] Obtener credenciales de producción de Bold
- [ ] Actualizar variables de entorno
- [ ] Configurar webhook en panel de producción
- [ ] Probar con transacción real pequeña

---

## 🎯 Estado Actual

```
✅ Webhook Configurado
✅ Backend Actualizado
✅ Variables de Entorno Correctas
✅ Sistema Listo para Pruebas

⏳ Pendiente: Realizar Pruebas de Pago
```

---

## 📞 Soporte

### Documentación
- **Integración Bold:** `doc/24-integracion-bold-completa/`
- **Guía de pruebas:** `doc/22-integracion-bold/GUIA_PRUEBAS.md`
- **Configuración Bold:** `doc/22-integracion-bold/CONFIGURACION_BOLD.md`

### Logs
```bash
# Ver logs del backend
pm2 logs datagree-backend

# Ver logs de webhooks
pm2 logs datagree-backend | grep "Webhook"

# Ver estado del backend
pm2 status
```

---

**Configurado por:** Kiro AI Assistant  
**Fecha:** 2026-01-21 06:30 UTC  
**Servidor:** 100.28.198.249 (datagree.net)
