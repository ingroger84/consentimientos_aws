# Integración con Bold - Pasarela de Pagos

**Fecha**: 20 de Enero de 2026  
**Estado**: 🚧 EN IMPLEMENTACIÓN

---

## Objetivo

Integrar Bold como pasarela de pagos para:
1. Generar links de pago automáticos para facturas
2. Recibir notificaciones de pagos vía webhooks
3. Aplicar pagos automáticamente
4. Activar/suspender tenants según estado de pago

---

## Flujo de Pago

### 1. Generación de Factura
```
Sistema genera factura
↓
Crea link de pago en Bold
↓
Envía email al tenant con link de pago
↓
Guarda referencia de Bold en la factura
```

### 2. Cliente Paga
```
Cliente hace clic en link de pago
↓
Ingresa datos de tarjeta/PSE/Nequi
↓
Bold procesa el pago
↓
Bold envía webhook a nuestro sistema
```

### 3. Procesamiento de Webhook
```
Webhook recibido
↓
Validar firma HMAC
↓
Buscar factura por referencia
↓
Crear registro de pago
↓
Marcar factura como pagada
↓
Activar tenant automáticamente
```

### 4. Suspensión Automática
```
Cron job diario (00:00)
↓
Buscar facturas vencidas no pagadas
↓
Suspender tenants con facturas vencidas
↓
Enviar email de notificación
```

---

## Configuración Requerida

### Variables de Entorno (.env)

```env
# Bold Payment Gateway
BOLD_API_KEY=your_api_key_here
BOLD_SECRET_KEY=your_secret_key_here
BOLD_MERCHANT_ID=your_merchant_id_here
BOLD_API_URL=https://api.bold.co/v1
BOLD_WEBHOOK_SECRET=your_webhook_secret_here

# URLs para webhooks
BOLD_WEBHOOK_URL=https://yourdomain.com/api/webhooks/bold
BOLD_SUCCESS_URL=https://yourdomain.com/payment/success
BOLD_FAILURE_URL=https://yourdomain.com/payment/failure
```

---

## Estructura de Base de Datos

### Tabla: invoices (actualización)

```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_payment_link VARCHAR(500);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_transaction_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_payment_reference VARCHAR(100);
```

### Tabla: payments (actualización)

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_payment_data JSONB;
```

---

## Endpoints de API

### 1. Crear Link de Pago
```
POST /api/invoices/:id/create-payment-link
```

### 2. Webhook de Bold
```
POST /api/webhooks/bold
```

### 3. Verificar Estado de Pago
```
GET /api/invoices/:id/payment-status
```

---

## Métodos de Pago Soportados

- ✅ Tarjetas de crédito (Visa, Mastercard, Amex)
- ✅ Tarjetas de débito
- ✅ PSE (Pagos Seguros en Línea)
- ✅ Nequi
- ✅ Bancolombia Transfer Button

---

## Seguridad

### Validación de Webhooks

Bold envía un header `X-Bold-Signature` con cada webhook:

```typescript
const signature = req.headers['x-bold-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', BOLD_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new UnauthorizedException('Invalid webhook signature');
}
```

---

## Manejo de Errores

### Reintentos de Webhook

Bold reintenta el webhook hasta 5 veces con backoff exponencial:
- Intento 1: Inmediato
- Intento 2: 5 minutos
- Intento 3: 15 minutos
- Intento 4: 1 hora
- Intento 5: 3 horas

### Reconciliación Manual

Si un webhook falla, el sistema puede:
1. Consultar el estado del pago en Bold API
2. Aplicar el pago manualmente desde el dashboard
3. Ver logs de webhooks fallidos

---

## Testing

### Modo Sandbox

Bold proporciona un ambiente de pruebas:
- URL: `https://sandbox-api.bold.co/v1`
- Tarjetas de prueba disponibles

### Tarjetas de Prueba

```
Aprobada: 4242 4242 4242 4242
Rechazada: 4000 0000 0000 0002
Fondos insuficientes: 4000 0000 0000 9995
```

---

## Monitoreo

### Logs de Webhooks

Todos los webhooks se registran en la tabla `webhook_logs`:
- Timestamp
- Payload
- Signature
- Estado (procesado/fallido)
- Error (si aplica)

### Alertas

El sistema envía alertas cuando:
- Un webhook falla 3 veces consecutivas
- Un pago queda pendiente por más de 24 horas
- Un tenant es suspendido por falta de pago

---

## Próximos Pasos

1. ✅ Obtener credenciales de Bold
2. 🚧 Implementar servicio de Bold
3. 🚧 Crear endpoints de webhooks
4. 🚧 Implementar lógica de suspensión automática
5. 🚧 Crear interfaz de usuario para pagos
6. 🚧 Testing en sandbox
7. 🚧 Despliegue a producción

---

## Documentación de Referencia

- [Bold Colombia](https://bold.co)
- [Soporte Bold](https://ayuda.bold.co)
- [API Documentation](Solicitar a Bold)

