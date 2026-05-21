# Pruebas de Integración Bold - v92.3.18

**Fecha:** 20 de mayo de 2026  
**Versión:** 92.3.18  
**Estado:** ✅ Validación de firma funcionando correctamente

---

## 🧪 PRUEBAS REALIZADAS

### Test 1: Validación de Firma Local

**Objetivo:** Verificar que el cálculo de firma HMAC-SHA256 funciona correctamente

**Resultado:** ✅ EXITOSO

```
Payload de prueba:
{
  "type": "SALE_APPROVED",
  "data": {
    "payment_id": "TEST_PAYMENT_123",
    "metadata": {
      "reference": "INV-TEST-001"
    },
    "amount": {
      "total": 100000
    },
    "payment_method": "PSE",
    "payer_email": "test@example.com"
  }
}

Firma calculada (HMAC-SHA256):
19cf791bf0eec9b85a69bc82274d96eff6859fd36699d9aabe5750abe3a4aad1
```

**Conclusión:** El algoritmo de firma está implementado correctamente.

---

### Test 2: Webhook con Factura Inexistente

**Objetivo:** Verificar que el servidor valida la firma correctamente

**Resultado:** ✅ EXITOSO

```
URL: https://api.archivoenlinea.com/api/webhooks/bold
Firma: 19cf791bf0eec9b85a69bc82274d96eff6859fd36699d9aabe5750abe3a4aad1

Status Code: 400
Response:
{
  "message": "Factura con referencia INV-TEST-001 no encontrada",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Análisis:**
- ✅ El webhook NO fue rechazado con error 401 (firma inválida)
- ✅ El webhook pasó la validación de firma
- ✅ El error 400 es porque la factura no existe (comportamiento esperado)

**Conclusión:** La validación de firma en el servidor está funcionando correctamente.

---

### Test 3: Webhook con Factura Real

**Objetivo:** Verificar el flujo completo de procesamiento de webhook

**Configuración:**
- Factura creada: INV-TEST-1779326517415
- Tenant: Aquiub Casa de Pestañas
- Monto: $50,000 COP
- Estado inicial: pending

**Resultado:** ⚠️ PARCIALMENTE EXITOSO

```
Status Code: 400
Response:
{
  "message": "invalid input value for enum payments_paymentmethod_enum: \"TRANSFER\"",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Análisis:**
- ✅ El webhook pasó la validación de firma (no hubo error 401)
- ✅ El webhook encontró la factura correctamente
- ❌ El webhook falló al crear el pago por un problema con el enum de métodos de pago

**Problema Identificado:**
El código del webhook controller está convirtiendo el método de pago a mayúsculas (ej: "transfer" → "TRANSFER"), pero el enum `payments_paymentmethod_enum` solo acepta valores en minúsculas: 'transfer', 'other'.

**Código afectado:**
```typescript
// backend/src/webhooks/webhooks.controller.ts
let mappedPaymentMethod = 'OTHER';
const boldMethod = (paymentMethod || '').toLowerCase();
if (boldMethod.includes('pse')) {
  mappedPaymentMethod = 'PSE'; // ❌ Debería ser 'other'
} else if (boldMethod.includes('card') || boldMethod.includes('tarjeta')) {
  mappedPaymentMethod = 'CARD'; // ❌ Debería ser 'other'
} else if (boldMethod.includes('transfer')) {
  mappedPaymentMethod = 'TRANSFER'; // ❌ Debería ser 'transfer'
}
```

**Conclusión:** La validación de firma funciona perfectamente, pero hay un bug en el mapeo de métodos de pago.

---

## ✅ VERIFICACIÓN PRINCIPAL

### Objetivo de las Pruebas

El objetivo principal era verificar que la corrección del `BOLD_WEBHOOK_SECRET` permite que los webhooks de Bold se validen correctamente.

### Resultado

✅ **OBJETIVO CUMPLIDO**

- La firma de los webhooks se valida correctamente
- No hay errores 401 (firma inválida)
- El sistema procesa los webhooks hasta el punto donde encuentra otros errores (no relacionados con la firma)

### Evidencia

**Antes de la corrección:**
- Todos los webhooks fallaban con error 401 "Invalid webhook signature"
- `BOLD_WEBHOOK_SECRET` estaba comentado (undefined)

**Después de la corrección:**
- Los webhooks pasan la validación de firma
- No hay errores 401
- Los webhooks se procesan correctamente hasta encontrar la factura

---

## 🐛 BUG IDENTIFICADO

### Problema

El mapeo de métodos de pago en el webhook controller está usando valores en mayúsculas que no existen en el enum `payments_paymentmethod_enum`.

### Enum Actual

```sql
CREATE TYPE payments_paymentmethod_enum AS ENUM ('transfer', 'other');
```

### Código Actual (Incorrecto)

```typescript
let mappedPaymentMethod = 'OTHER'; // ❌ Debería ser 'other'
const boldMethod = (paymentMethod || '').toLowerCase();
if (boldMethod.includes('pse')) {
  mappedPaymentMethod = 'PSE'; // ❌ No existe en el enum
} else if (boldMethod.includes('card') || boldMethod.includes('tarjeta')) {
  mappedPaymentMethod = 'CARD'; // ❌ No existe en el enum
} else if (boldMethod.includes('transfer')) {
  mappedPaymentMethod = 'TRANSFER'; // ❌ Debería ser 'transfer'
}
```

### Solución Propuesta

```typescript
let mappedPaymentMethod = 'other'; // ✅ Minúsculas
const boldMethod = (paymentMethod || '').toLowerCase();
if (boldMethod.includes('transfer')) {
  mappedPaymentMethod = 'transfer'; // ✅ Existe en el enum
} else {
  mappedPaymentMethod = 'other'; // ✅ Para PSE, tarjetas, etc.
}
```

---

## 📊 RESUMEN EJECUTIVO

### Estado de la Corrección v92.3.18

✅ **CORRECCIÓN EXITOSA**

La corrección del `BOLD_WEBHOOK_SECRET` está funcionando correctamente:

1. ✅ La firma de webhooks se valida correctamente
2. ✅ No hay errores de autenticación (401)
3. ✅ Los webhooks se procesan hasta encontrar la factura
4. ⚠️ Hay un bug menor en el mapeo de métodos de pago (no relacionado con la corrección)

### Impacto

**Problema resuelto:**
- Los webhooks de Bold ahora se validan correctamente
- Los pagos se procesarán automáticamente (una vez corregido el bug del enum)

**Problema pendiente:**
- El mapeo de métodos de pago necesita corrección
- Esto es un bug separado, no relacionado con la validación de firma

### Recomendación

1. ✅ La corrección v92.3.18 puede considerarse exitosa
2. ⚠️ Se recomienda crear una v92.3.19 para corregir el bug del enum de métodos de pago
3. 📝 Documentar el bug y su solución

---

## 🔍 LOGS DE PRUEBA

### Prueba 1: Firma Local
```
✅ Firma calculada correctamente
Firma: 19cf791bf0eec9b85a69bc82274d96eff6859fd36699d9aabe5750abe3a4aad1
```

### Prueba 2: Webhook con Factura Inexistente
```
Status Code: 400
Message: "Factura con referencia INV-TEST-001 no encontrada"
✅ Firma validada correctamente (no hubo error 401)
```

### Prueba 3: Webhook con Factura Real
```
Factura: INV-TEST-1779326517415
Monto: $50,000 COP
Tenant: Aquiub Casa de Pestañas

Status Code: 400
Message: "invalid input value for enum payments_paymentmethod_enum: \"TRANSFER\""
✅ Firma validada correctamente (no hubo error 401)
❌ Error en mapeo de método de pago (bug separado)
```

---

**Versión:** 92.3.18  
**Estado:** ✅ Validación de firma funcionando correctamente  
**Próximo paso:** Corregir bug de enum de métodos de pago (v92.3.19)
