# Sesión 2026-01-29: Corrección Integración Bold Payment Gateway

## Problema Identificado

La integración con Bold Colombia está fallando con el error:
```
"Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'Qqm1lWKN0Dm4/4GF/mKO4XIJ4s5tpXme/lz40NVd3ZQ='."
```

## Cambios Realizados

### 1. Corrección del `callback_url`
- **Problema**: El `callback_url` aparecía como `"undefined/invoices/..."`
- **Causa**: `process.env.FRONTEND_URL` no se estaba leyendo correctamente en PM2
- **Solución**: 
  - Agregado `FRONTEND_URL: 'https://archivoenlinea.com'` a `ecosystem.config.js`
  - Modificado `invoices.service.ts` para usar `ConfigService` en lugar de `process.env`
- **Estado**: ✅ CORREGIDO - El callback_url ahora muestra correctamente `https://archivoenlinea.com/invoices/...`

### 2. Corrección del Endpoint
- **Problema**: Estábamos usando `/payment-intent` (singular)
- **Solución**: Cambiado a `/payment-intents` (plural) según documentación de Bold
- **Estado**: ✅ CORREGIDO

### 3. Formato del Header de Autenticación
- **Documentación Bold**: `Authorization: x-api-key <llave_de_identidad>`
- **Implementación actual**: `'Authorization': 'x-api-key ${this.apiKey}'`
- **Estado**: ❌ RECHAZADO POR BOLD

## Configuración Actual

### Variables de Entorno (ecosystem.config.js)
```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'IKi1koNT7pUK1uTRf4vYOQ'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
BOLD_WEBHOOK_SECRET: 'g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE'
BOLD_SUCCESS_URL: 'https://archivoenlinea.com/payment/success'
BOLD_FAILURE_URL: 'https://archivoenlinea.com/payment/failure'
BOLD_WEBHOOK_URL: 'https://archivoenlinea.com/api/webhooks/bold'
FRONTEND_URL: 'https://archivoenlinea.com'
```

### Payload Enviado a Bold
```json
{
  "reference_id": "INV-INV-202601-1723-1769669609358",
  "amount": {
    "currency": "COP",
    "total_amount": 119900
  },
  "description": "Factura INV-202601-1723 - Demo Estetica",
  "callback_url": "https://archivoenlinea.com/invoices/9970661d-9e56-4974-a1cc-f8f1a1280b44/payment-success",
  "customer": {
    "name": "Demo Estetica",
    "email": "roger.caraballo@gmail.com"
  }
}
```

## Problema Actual

El error persiste: **"Invalid key=value pair (missing equal-sign) in Authorization header"**

### Posibles Causas

1. **API Key Incorrecta**: La API Key proporcionada puede no ser válida o puede ser de sandbox cuando se necesita producción
2. **Formato del Header**: Aunque seguimos la documentación, Bold puede estar esperando un formato diferente
3. **Ambiente**: Puede que estemos usando credenciales de sandbox contra el endpoint de producción o viceversa

### Próximos Pasos Recomendados

1. **Verificar con Bold**:
   - Confirmar que la API Key `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68` es válida
   - Confirmar si es de sandbox o producción
   - Verificar que el Merchant ID `2M0MTRAD37` está activo

2. **Probar Formato Alternativo del Header**:
   - Intentar con header `x-api-key` directamente (sin Authorization)
   - Intentar con `Bearer` token
   - Intentar con Basic Auth

3. **Revisar Documentación Actualizada**:
   - La documentación de Bold puede haber cambiado
   - Contactar soporte técnico de Bold para confirmar formato correcto

## Archivos Modificados

- `backend/src/payments/bold.service.ts` - Formato de autenticación y endpoint
- `backend/src/invoices/invoices.service.ts` - Uso de ConfigService para FRONTEND_URL
- `ecosystem.config.js` - Agregada variable FRONTEND_URL

## Estado Final

- ✅ callback_url corregido
- ✅ Endpoint corregido a `/payment-intents`
- ✅ Header corregido a `x-api-key` (enviado en cada petición)
- ✅ Secret Key actualizado a `KVwpsp4WlWny3apOYoGWvg`
- ❌ Error de autenticación persiste: "Missing Authentication Token"

## Problema Actual

Bold sigue rechazando la autenticación con el error "Missing Authentication Token" a pesar de que:
1. El header `x-api-key` se está enviando correctamente
2. La API Key es la correcta: `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68`
3. El formato del header es correcto según la documentación

**Posible causa**: La API Key proporcionada puede ser de **sandbox** pero estamos usando el endpoint de **producción** (`https://api.online.payments.bold.co`).

## Recomendación Final

Verificar con Bold si:
1. La API Key `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68` es de sandbox o producción
2. Si es de sandbox, cambiar el endpoint a `https://sandbox.api.online.payments.bold.co`
3. Si es de producción, verificar que la API Key esté activa y tenga permisos para crear intenciones de pago

## Timestamp

- Inicio: 2026-01-29 06:36 AM
- Última actualización: 2026-01-29 07:14 AM
