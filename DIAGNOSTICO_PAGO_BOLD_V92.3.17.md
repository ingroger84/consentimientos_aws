# Diagnóstico Pago Bold - v92.3.17

**Fecha:** 11 de mayo de 2026  
**Transaction ID:** TXIPFT28GK5CUS:299432039  
**Estado:** ❌ PAGO NO PROCESADO

## Problema Reportado

Usuario reporta que realizó un pago exitoso a través de Bold pero:
1. El banner rojo de pago pendiente sigue apareciendo
2. El pago no se aplicó a la factura
3. El tenant no se activó automáticamente

## Investigación

### 1. Webhook de Bold Recibido

**Evidencia en logs PM2:**
```
[Nest] 1776047  - 05/11/2026, 12:54:59 PM   ERROR [WebhooksController] Error al procesar webhook de Bold:
QueryFailedError: null value in column "event" of relation "webhook_logs" violates not-null constraint
```

**Payload recibido:**
```json
{
  "id": "6eaa8e73-9184-4607-b173-bd033f52321d",
  "type": "SALE_APPROVED",
  "subject": "TXIPFT28GK5",
  "data": {
    "amount": {
      "total": 119900,
      "currency": "COP"
    },
    "metadata": {
      "reference": "INV-INV-202605-1778520833929-A1"
    },
    "payment_method": "PSE",
    "payer_email": "krolina707@gmail.com",
    "payment_id": "TXIPFT28GK5"
  }
}
```

### 2. Causa Raíz

**Problema:** El código esperaba el formato antiguo de Bold con `payload.event` y `payload.transaction`, pero Bold envía:
- `payload.type` (en lugar de `event`)
- `payload.data` (en lugar de `transaction`)

**Error específico:**
```javascript
// Código antiguo (INCORRECTO):
event: payload.event,  // ❌ Bold no envía "event", envía "type"
transactionId: payload.transaction?.id,  // ❌ Bold no envía "transaction", envía "data"
```

**Resultado:** El webhook falló al intentar guardar en `webhook_logs` porque `event` era `null`.

### 3. Solución Implementada

**Cambios en `webhooks.controller.ts`:**

1. **Extracción de datos compatible con formato Bold:**
```typescript
// Nuevo código (CORRECTO):
const eventType = payload.type || payload.event;
const transactionId = payload.data?.payment_id || payload.transaction?.id;
const reference = payload.data?.metadata?.reference || payload.transaction?.reference;
```

2. **Mapeo de tipos de Bold a eventos internos:**
```typescript
const eventMapping: Record<string, string> = {
  'SALE_APPROVED': 'payment.succeeded',
  'SALE_REJECTED': 'payment.failed',
  'SALE_PENDING': 'payment.pending',
};
```

3. **Procesamiento de pago con formato Bold:**
```typescript
const amount = payload.data?.amount?.total || payload.transaction?.amount;
const paymentMethod = payload.data?.payment_method || payload.transaction?.paymentMethod;
```

### 4. Despliegue

**Backend compilado y desplegado:**
- ✅ Código corregido en `backend/src/webhooks/webhooks.controller.ts`
- ✅ Compilación exitosa
- ✅ Archivos subidos a `/home/ubuntu/consentimientos_aws/backend/dist/`
- ✅ PM2 reiniciado (PID: 1778647)

### 5. Próximos Pasos

**Opción 1: Esperar reintento automático de Bold**
- Bold reintenta webhooks fallidos automáticamente
- Puede tomar varios minutos u horas

**Opción 2: Procesar pago manualmente**
- Crear script para simular webhook con datos correctos
- Requiere firma válida o desactivar validación temporalmente

**Opción 3: Contactar soporte de Bold**
- Solicitar reenvío manual del webhook
- Proporcionar Transaction ID: TXIPFT28GK5CUS:299432039

## Datos del Pago

- **Transaction ID:** TXIPFT28GK5
- **Reference:** INV-INV-202605-1778520833929-A1
- **Amount:** $119,900 COP
- **Payment Method:** PSE
- **Payer Email:** krolina707@gmail.com
- **Status:** SALE_APPROVED (Aprobado por Bold)
- **Fecha:** 11 de mayo de 2026, 12:35:46

## Recomendación

**INMEDIATA:** Procesar el pago manualmente para activar el tenant y quitar el banner rojo.

**LARGO PLAZO:** Monitorear que los próximos webhooks de Bold se procesen correctamente con el código corregido.
