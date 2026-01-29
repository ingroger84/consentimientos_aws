# Sesión 2026-01-29: Corrección de Autenticación Bold API

## Fecha
29 de enero de 2026

## Problema Identificado

### Error en Integración Bold
Al intentar realizar un pago a través de Bold, se presentaban los siguientes errores:

1. **Error inicial**: "Missing Authentication Token"
2. **Error después del primer intento**: "Invalid key=value pair (missing equal-sign) in Authorization header"

### Análisis del Problema

El error sugería que Bold está usando AWS API Gateway, que interpreta los headers de autenticación de manera específica. La documentación de Bold indica:

```
Authorization: x-api-key <llave_de_identidad>
```

Sin embargo, este formato estaba causando el error "Invalid key=value pair".

## Solución Implementada

### 1. Cambio en el Header de Autenticación

**Archivo**: `backend/src/payments/bold.service.ts`

**Formato CORRECTO según documentación oficial de Bold**:
```typescript
this.apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `x-api-key ${this.apiKey}`, // Bold usa "Authorization: x-api-key <llave>"
  },
  timeout: 30000,
});
```

**Explicación**: Según la documentación oficial de Bold en https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion#autenticaci%C3%B3n-de-peticionesLa, el formato correcto es:

```
Llave: Authorization
Valor: x-api-key <llave_de_identidad>
```

Esto significa que el header `Authorization` debe contener el valor `x-api-key` seguido de un espacio y la llave de identidad. **NO** es un header separado llamado `x-api-key`.

### 2. Corrección de URLs de Callback

**Archivo**: `ecosystem.config.production.js`

**Cambio realizado**:
```javascript
// ANTES
BOLD_SUCCESS_URL: 'https://datagree.net/payment/success',
BOLD_FAILURE_URL: 'https://datagree.net/payment/failure',
BOLD_WEBHOOK_URL: 'https://datagree.net/api/webhooks/bold',

// DESPUÉS
BOLD_SUCCESS_URL: 'https://archivoenlinea.com/payment/success',
BOLD_FAILURE_URL: 'https://archivoenlinea.com/payment/failure',
BOLD_WEBHOOK_URL: 'https://archivoenlinea.com/api/webhooks/bold',
```

### 3. Protección de Credenciales

**Archivo**: `.gitignore`

Se agregó `ecosystem.config.production.js` al `.gitignore` para evitar que las credenciales de AWS y Bold se suban a GitHub.

## Pasos de Implementación

1. ✅ Revisar documentación oficial de Bold
2. ✅ Corregir formato de autenticación en `bold.service.ts` a `Authorization: x-api-key <llave>`
3. ✅ Actualizar URLs de callback en `ecosystem.config.js` (en servidor)
4. ✅ Agregar `ecosystem.config.production.js` al `.gitignore`
5. ✅ Compilar backend: `NODE_OPTIONS='--max-old-space-size=2048' npm run build`
6. ✅ Reiniciar PM2: `pm2 restart datagree --update-env`
7. ✅ Actualizar GitHub (versión 22.0.1)

## Configuración de Bold

### Credenciales (en servidor)
```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'IKi1koNT7pUK1uTRf4vYOQ'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
```

### Endpoints Utilizados
- **Crear intención de pago**: `POST /payment-intent`
- **Consultar estado**: `GET /transactions/{transactionId}`

## Próximos Pasos

1. ⏳ Probar el flujo completo de pago con Bold
2. ⏳ Verificar que el callback_url se esté enviando correctamente (actualmente aparece como "undefined")
3. ⏳ Implementar el manejo de webhooks de Bold
4. ⏳ Probar el flujo 3D Secure si es requerido

## Notas Técnicas

### Formato de Autenticación Bold
Según la documentación oficial de Bold (https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion#autenticaci%C3%B3n-de-peticionesLa), el formato correcto es:

```
Header: Authorization
Valor: x-api-key <llave_de_identidad>
```

Ejemplo con la llave `DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH`:
```
Authorization: x-api-key DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH
```

**Importante**: Es el header `Authorization` con el valor `x-api-key <llave>`, NO un header separado llamado `x-api-key`.

### Problema del callback_url
En los logs se observó que el `callback_url` se está enviando como "undefined":
```json
{
  "callback_url": "undefined/invoices/9970661d-9e56-4974-a1cc-f8f1a1280b44/payment-success"
}
```

Esto indica que falta configurar la variable de entorno `BOLD_SUCCESS_URL` correctamente o que el código no está leyendo correctamente esta variable.

## Versión
- **Versión anterior**: 20.0.3
- **Versión actual**: 22.0.1
- **Tipo de cambio**: PATCH (corrección de formato de autenticación)

## Estado
🟢 **LISTO PARA PRUEBAS** - Formato de autenticación corregido según documentación oficial de Bold

## Referencias
- [Documentación Bold API](https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion)
- [AWS API Gateway Authentication](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html)
