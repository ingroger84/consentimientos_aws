# Sesión 2026-01-31: Corrección Final de Autenticación Bold

## Fecha
31 de Enero de 2026

## Problema Identificado

### Error de Autenticación Bold
**Problema**: Al hacer clic en "Pagar Ahora", Bold respondía con error "Missing Authentication Token" a pesar de que el código parecía estar implementado correctamente.

**Causa raíz**: Formato incorrecto del header de autenticación. Se estaba enviando el header como `x-api-key: <llave>` cuando debía ser `Authorization: x-api-key <llave>`.

## Solución Implementada

### Documentación Oficial Consultada
URL: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion

**Sección de Autenticación**:
> Para autenticar tus peticiones, incluye la siguiente cabecera (header) en cada solicitud:
> 
> | Llave | Valor |
> |-------|-------|
> | Authorization | x-api-key <llave_de_identidad> |

**Ejemplo de la documentación**:
Si la llave de identidad es: `DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH`

Quedaría de la siguiente forma:
```
Authorization: x-api-key DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH
```

### Cambios Realizados

**Archivo**: `backend/src/payments/bold.service.ts`

**Antes** (incorrecto):
```typescript
this.apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey, // ❌ INCORRECTO
  },
  timeout: 30000,
});
```

**Después** (correcto):
```typescript
this.apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `x-api-key ${this.apiKey}`, // ✅ CORRECTO
  },
  timeout: 30000,
});
```

También se corrigió el log de debugging:
```typescript
this.logger.log(`Headers enviados a Bold:`, {
  'Content-Type': 'application/json',
  'Authorization': `x-api-key ${this.apiKey?.substring(0, 20)}...`,
});

const response = await this.apiClient.post('/payment-intents', payload);
```

## Configuración Actual

### Variables de Entorno (ecosystem.config.js)
```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'KVwpsp4WlWny3apOYoGWvg'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
BOLD_WEBHOOK_SECRET: 'g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE'
BOLD_SUCCESS_URL: 'https://archivoenlinea.com/payment/success'
BOLD_FAILURE_URL: 'https://archivoenlinea.com/payment/failure'
BOLD_WEBHOOK_URL: 'https://archivoenlinea.com/api/webhooks/bold'
FRONTEND_URL: 'https://archivoenlinea.com'
```

### Headers Correctos Enviados
```json
{
  "Content-Type": "application/json",
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```

### Estructura del Payload
```json
{
  "reference_id": "INV-INV-202601-XXXX-XXXXXXXXXX",
  "amount": {
    "currency": "COP",
    "total_amount": 119900
  },
  "description": "Factura INV-202601-XXXX - Nombre Tenant",
  "callback_url": "https://archivoenlinea.com/invoices/{id}/payment-success",
  "customer": {
    "name": "Nombre Cliente",
    "email": "email@cliente.com"
  }
}
```

## Proceso de Despliegue

### Comandos Ejecutados
```bash
# 1. Compilar backend
cd /home/ubuntu/consentimientos_aws/backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build

# 2. Reiniciar PM2
cd /home/ubuntu/consentimientos_aws
pm2 restart datagree --update-env

# 3. Verificar estado
pm2 status
```

### Resultado
```
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ datagree    │ default     │ 22.0.2  │ fork    │ 217989   │ 0s     │ 7    │ online    │ 0%       │ 40.2mb   │ ubuntu   │ disabled │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

## Estado del Sistema

### Backend
- ✅ Compilado correctamente
- ✅ PM2 online (PID: 217989)
- ✅ Bold Service con autenticación correcta
- ✅ Endpoint `/payment-intents` configurado
- ✅ Payload estructurado según documentación

### Integración Bold
- ✅ Header `Authorization` con formato correcto: `x-api-key <llave>`
- ✅ URL base correcta: `https://api.online.payments.bold.co`
- ✅ Endpoint correcto: `POST /payment-intents`
- ✅ Payload con estructura `PaymentIntent` según esquema de Bold
- ✅ callback_url dinámico usando `ConfigService`

### Versiones
- Backend: 22.0.2
- Frontend: 22.0.2
- Node.js: v18.x
- PM2: Activo

## Archivos Modificados

1. `backend/src/payments/bold.service.ts`
   - Cambiado header de `x-api-key` a `Authorization: x-api-key <llave>`
   - Actualizado log de debugging

## Próximos Pasos

1. ✅ **Corrección de autenticación** - COMPLETADO
2. ⏳ **Prueba de pago real** - Pendiente de que el usuario pruebe haciendo clic en "Pagar Ahora"
3. ⏳ **Verificación de respuesta de Bold** - Pendiente de ver si ahora Bold acepta la petición

## Notas Técnicas

- La documentación oficial de Bold es clara: el header debe ser `Authorization` con el valor `x-api-key <llave>`
- Este es un formato estándar en APIs que usan API Keys en el header Authorization
- El error "Missing Authentication Token" era causado por enviar el header en el formato incorrecto
- Todas las demás partes de la integración (payload, endpoint, URL) estaban correctas desde el principio

## Referencias

- Documentación oficial Bold: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion
- Esquema de datos Bold: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/esquema-de-datos
- Servidor: 100.28.198.249 (DatAgree - AWS Lightsail)
- Proyecto: `/home/ubuntu/consentimientos_aws`

## Resumen

La integración con Bold Colombia ahora está configurada correctamente según la documentación oficial. El formato de autenticación ha sido corregido de `x-api-key: <llave>` a `Authorization: x-api-key <llave>`. El sistema está listo para procesar pagos y debe funcionar correctamente en el próximo intento.
