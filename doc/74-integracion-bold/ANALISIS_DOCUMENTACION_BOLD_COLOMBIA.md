# 🔍 Análisis COMPLETO de Documentación Bold Colombia

**Fecha**: 25 de Marzo 2026  
**Estado**: ✅ DOCUMENTACIÓN ANALIZADA - SOLUCIÓN IDENTIFICADA

---

## ✅ CONFIRMACIÓN: Documentación Oficial Encontrada

La documentación oficial de Bold Colombia está en **https://developers.bold.co/** y es PÚBLICA (no requiere login).

### URLs Analizadas:
1. ✅ **Webhook**: https://developers.bold.co/webhook
2. ✅ **API Integrations Sandbox**: https://developers.bold.co/api-integrations/integration-sandbox
3. ⚠️ **API Pagos en Línea**: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea (BETA - Incompleta)

---

## 🎯 HALLAZGO CRÍTICO: Endpoint Incorrecto

### ❌ Lo que hemos estado usando (INCORRECTO):
```typescript
POST /v1/payment-intent  // Este endpoint NO existe en la documentación
```

### ✅ Endpoint CORRECTO según documentación oficial:
```typescript
POST /payments/app-checkout  // Endpoint documentado para crear pagos
```

**PERO HAY UN PROBLEMA**: Este endpoint es para datáfonos (POS), NO para links de pago web.

---

## 📚 Análisis de la Documentación Oficial

### 1. API Integrations (Datáfonos)
**URL**: https://developers.bold.co/api-integrations/integration-sandbox

**Propósito**: Integración con datáfonos SmartPro de Bold

**Características**:
- ✅ Documentación COMPLETA
- ✅ Endpoint: `POST /payments/app-checkout`
- ✅ URL Base: `https://integrations.api.bold.co`
- ✅ Autenticación: `Authorization: x-api-key <llave_de_identidad>`
- ✅ Métodos de pago: POS, NEQUI, DAVIPLATA, **PAY_BY_LINK**

**Métodos de pago disponibles**:
```json
{
  "payment_methods": [
    { "name": "POS", "enabled": true },           // Tarjetas en datáfono
    { "name": "NEQUI", "enabled": true },         // Nequi
    { "name": "DAVIPLATA", "enabled": true },     // Daviplata
    { "name": "PAY_BY_LINK", "enabled": true }    // 🎯 LINK DE PAGO
  ]
}
```

**🎯 CLAVE**: El método `PAY_BY_LINK` está disponible en este endpoint.

### 2. API Pagos en Línea (BETA)
**URL**: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea

**Estado**: ⚠️ BETA - Documentación INCOMPLETA

**Contenido**:
- ✅ Descripción general del servicio
- ❌ NO tiene endpoints específicos documentados
- ❌ NO tiene ejemplos de código
- ❌ NO tiene estructura de request/response

**Descripción**:
> "La API de Pagos en Línea de Bold te permite crear, procesar y gestionar pagos directamente desde tu sistema, app o sitio web."

**Funcionalidades prometidas**:
- Crear intentos de pago
- Recibir pagos con tarjeta, PSE y más
- Consultar el estado de una transacción
- Gestionar reembolsos
- Automatizar cobros recurrentes
- Recibir notificaciones en tiempo real

**Requisitos**:
- Equipo técnico capaz de implementar integraciones
- Certificado SSL vigente
- Cumplimiento con PCI DSS

**⚠️ PROBLEMA**: Esta API está en BETA y NO tiene documentación técnica completa.

### 3. Webhook
**URL**: https://developers.bold.co/webhook

**Propósito**: Recibir notificaciones de eventos de pagos

**Características**:
- ✅ Documentación COMPLETA
- ✅ Eventos: SALE_APPROVED, SALE_REJECTED, VOID_APPROVED, VOID_REJECTED
- ✅ Verificación de firma con HMAC-SHA256
- ✅ Política de reintentos (5 intentos)
- ✅ Servicio de fallback para consultar notificaciones

**Estructura de notificación**:
```json
{
  "id": "uuid",
  "type": "SALE_APPROVED",
  "subject": "payment_id",
  "data": {
    "payment_id": "F8A5D6B7G2H1",
    "merchant_id": "PQR6Y4T8Z3",
    "amount": { "total": 1000, "currency": "COP" },
    "payment_method": "CARD",
    "metadata": { "reference": "ORD-20251021-00145" }
  }
}
```

---

## 🚨 PROBLEMA CON NUESTRA INTEGRACIÓN

### ❌ Lo que hicimos en v73.3 (INCORRECTO):
```typescript
// Endpoint que NO existe en la documentación
POST https://api.online.payments.bold.co/v1/payment-intent

// Intentamos construir URL manualmente
https://checkout.bold.co/payment/${reference_id}
```

**Resultado**: 
- ❌ Endpoint `/v1/payment-intent` NO está documentado
- ❌ URL construida manualmente NO funciona
- ❌ No hay checkout web en Bold Colombia

### ❌ Lo que hicimos en v73.4 (INCORRECTO):
```typescript
// Cambiamos a Wompi (servicio DIFERENTE)
https://checkout.wompi.co/p/?public-key=xxx&...
```

**Problema**: 
- ❌ Wompi y Bold Colombia son servicios DIFERENTES
- ❌ Las credenciales de Bold NO funcionan en Wompi
- ❌ Estamos mezclando dos pasarelas diferentes

---

## ✅ SOLUCIÓN CORRECTA: Usar API Integrations con PAY_BY_LINK

Según la documentación oficial, el método correcto es:

### Endpoint Correcto:
```
POST https://integrations.api.bold.co/payments/app-checkout
```

### Headers:
```
Authorization: x-api-key <llave_de_identidad>
Content-Type: application/json
```

### Request Body:
```json
{
  "amount": {
    "currency": "COP",
    "total_amount": 100000,  // Monto en pesos (NO centavos)
    "taxes": [
      {
        "type": "VAT",
        "base": 84034,
        "value": 15966
      }
    ],
    "tip_amount": 0
  },
  "payment_method": "PAY_BY_LINK",  // 🎯 CLAVE: Usar PAY_BY_LINK
  "terminal_model": "N86",           // Requerido (usar el de tu cuenta)
  "terminal_serial": "N860W000000",  // Requerido (usar el de tu cuenta)
  "reference": "INV-202603-5324",    // Tu referencia única
  "user_email": "vendedor@comercio.com",
  "description": "Factura INV-202603-5324",
  "payer": {
    "email": "cliente@email.com",
    "phone_number": "3001234567"
  }
}
```

### ⚠️ REQUISITOS IMPORTANTES:

1. **Datáfono vinculado**: Debes tener al menos un datáfono SmartPro vinculado a tu cuenta Bold
2. **Datáfono encendido**: El datáfono debe estar encendido y con la app abierta o en background
3. **Terminal model y serial**: Debes obtenerlos de tu cuenta Bold usando:
   ```
   GET https://integrations.api.bold.co/payments/binded-terminals
   Authorization: x-api-key <llave_de_identidad>
   ```

### Response Esperado:
```json
{
  "payload": {
    "integration_id": "e1eeb06d-e2c4-461e-8346-f0982b4be1fc"
  },
  "errors": []
}
```

### 🤔 PREGUNTA CRÍTICA:

**¿Cómo se genera el link de pago?**

La documentación NO especifica cómo se obtiene la URL del link de pago. Posibles opciones:

1. **Opción A**: El link se envía automáticamente al email del `payer`
2. **Opción B**: El link se genera en el datáfono y se debe compartir manualmente
3. **Opción C**: Hay un endpoint adicional para consultar el link (no documentado)
4. **Opción D**: El link se recibe en el webhook después de crear el pago

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Paso 1: Verificar Datáfonos Vinculados (URGENTE)
```bash
curl -X GET https://integrations.api.bold.co/payments/binded-terminals \
  -H "Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
```

**Objetivo**: Obtener `terminal_model` y `terminal_serial` reales de tu cuenta.

### Paso 2: Probar Crear Pago con PAY_BY_LINK
```bash
curl -X POST https://integrations.api.bold.co/payments/app-checkout \
  -H "Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "currency": "COP",
      "total_amount": 10000,
      "taxes": [],
      "tip_amount": 0
    },
    "payment_method": "PAY_BY_LINK",
    "terminal_model": "N86",
    "terminal_serial": "TU_SERIAL_AQUI",
    "reference": "TEST-'$(date +%s)'",
    "user_email": "info@innovasystems.com.co",
    "description": "Prueba de link de pago",
    "payer": {
      "email": "rcaraballo@innovasystems.com.co"
    }
  }'
```

**Objetivo**: Ver qué responde la API y cómo se genera el link.

### Paso 3: Contactar Soporte de Bold (SI NO FUNCIONA)

Si el método `PAY_BY_LINK` no genera una URL en la respuesta, contactar a Bold para:

1. Confirmar cómo se obtiene la URL del link de pago
2. Verificar si hay un endpoint adicional para consultar el link
3. Confirmar si el link se envía por email automáticamente
4. Solicitar acceso a la documentación completa de "API Pagos en Línea"

---

## 📊 Comparación de Enfoques

| Enfoque | Estado | Ventajas | Desventajas |
|---------|--------|----------|-------------|
| **v73.3**: `/v1/payment-intent` | ❌ Incorrecto | Ninguna | Endpoint no documentado |
| **v73.4**: Wompi Checkout | ❌ Incorrecto | Ninguna | Servicio diferente |
| **CORRECTO**: `/payments/app-checkout` + `PAY_BY_LINK` | ✅ Documentado | Oficial, soportado | Requiere datáfono vinculado |

---

## ⚠️ LIMITACIONES IDENTIFICADAS

### 1. Requiere Datáfono Físico
Bold Colombia requiere tener un datáfono SmartPro vinculado, incluso para links de pago web.

**Pregunta**: ¿Tienes un datáfono Bold vinculado a tu cuenta?

### 2. Documentación Incompleta
La documentación de "API Pagos en Línea" está en BETA y no tiene detalles técnicos.

**Solución**: Usar "API Integrations" que SÍ está documentada.

### 3. No Hay Checkout Web Directo
Bold Colombia NO tiene un checkout web como Wompi o Stripe.

**Solución**: Usar el método `PAY_BY_LINK` que genera links de pago.

---

## 🔧 IMPLEMENTACIÓN CORRECTA

### Cambios Necesarios en `bold.service.ts`:

```typescript
// ❌ ELIMINAR: URL de Wompi
// const checkoutUrl = 'https://checkout.wompi.co/p/';

// ✅ USAR: Endpoint correcto de Bold
const endpoint = '/payments/app-checkout';

// ✅ USAR: Método PAY_BY_LINK
const payload = {
  amount: {
    currency: 'COP',
    total_amount: Math.round(data.amount), // Pesos, NO centavos
    taxes: [],
    tip_amount: 0
  },
  payment_method: 'PAY_BY_LINK',
  terminal_model: this.configService.get('BOLD_TERMINAL_MODEL'),
  terminal_serial: this.configService.get('BOLD_TERMINAL_SERIAL'),
  reference: data.reference,
  user_email: this.configService.get('SMTP_USER'),
  description: data.description,
  payer: {
    email: data.customerEmail,
    phone_number: data.customerPhone || ''
  }
};

const response = await this.apiClient.post(endpoint, payload);

// ⚠️ PROBLEMA: La respuesta NO incluye la URL del link
// Necesitamos investigar cómo obtener la URL
```

---

## 📞 ACCIÓN REQUERIDA DEL USUARIO

**ANTES de implementar, necesitamos que confirmes**:

1. ✅ ¿Tienes un datáfono Bold SmartPro vinculado a tu cuenta?
2. ✅ ¿Puedes obtener el `terminal_model` y `terminal_serial` de tu cuenta?
3. ✅ ¿Puedes probar el endpoint `/payments/binded-terminals` para verificar?
4. ✅ ¿Quieres que contactemos al soporte de Bold para aclarar cómo se obtiene la URL del link?

---

## 📚 URLs de Referencia Oficiales

### Bold Colombia (Documentación Oficial)
- Portal desarrolladores: https://developers.bold.co/
- API Integrations: https://developers.bold.co/api-integrations/integration-sandbox
- Webhook: https://developers.bold.co/webhook
- API Pagos en Línea (BETA): https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea

### Bold Colombia (Servicios)
- Sitio principal: https://bold.co
- Link de pago (producto): https://datafonos.bold.co/link-de-pago/
- API Base: https://integrations.api.bold.co

---

**Última actualización**: 25 de Marzo 2026  
**Estado**: ✅ Documentación analizada - Esperando confirmación de datáfono vinculado
