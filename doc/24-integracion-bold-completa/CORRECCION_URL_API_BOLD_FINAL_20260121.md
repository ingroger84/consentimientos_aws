# Corrección Final de URL API Bold - 21 Enero 2026

## Problema Identificado

El error `getaddrinfo ENOTFOUND sandbox-api.bold.co` persistía después de actualizar el archivo `.env` porque el archivo `ecosystem.config.js` tenía la URL incorrecta hardcodeada en las variables de entorno.

## Causa Raíz

PM2 estaba usando las variables de entorno definidas en `ecosystem.config.js` en lugar de leer el archivo `.env`. Esto causaba que el backend siguiera usando la URL incorrecta incluso después de actualizar el `.env`.

## Solución Aplicada

### 1. Identificación del Problema

```bash
# Verificamos que el .env tenía la URL correcta
cat /home/ubuntu/consentimientos_aws/backend/.env | grep BOLD_API_URL
# Resultado: BOLD_API_URL=https://api-sandbox.bold.co/v1 ✅

# Verificamos el ecosystem.config.js
cat /home/ubuntu/consentimientos_aws/ecosystem.config.js | grep BOLD_API_URL
# Resultado: BOLD_API_URL: 'https://sandbox-api.bold.co/v1' ❌
```

### 2. Corrección del Archivo ecosystem.config.js

Se corrigieron dos líneas en el archivo `ecosystem.config.js`:

**Antes:**
```javascript
BOLD_API_URL: 'https://sandbox-api.bold.co/v1',
BOLD_WEBHOOK_SECRET: 'pendiente_configurar_webhook',
```

**Después:**
```javascript
BOLD_API_URL: 'https://api-sandbox.bold.co/v1',
BOLD_WEBHOOK_SECRET: 'KWpgscWMWny3apOYs0Wvg',
```

### 3. Reinicio del Backend

```bash
cd /home/ubuntu/consentimientos_aws
pm2 delete datagree-backend
pm2 start ecosystem.config.js
```

## Resultado

✅ Backend reiniciado exitosamente con PID 34387
✅ No hay errores de DNS en los logs
✅ URL correcta de Bold configurada: `https://api-sandbox.bold.co/v1`
✅ Webhook Secret configurado correctamente

## Verificación

```bash
# Estado del proceso
pm2 status
# Resultado: datagree-backend online, PID 34387, memoria ~188MB

# Logs del backend
pm2 logs datagree-backend --lines 50 --nostream
# Resultado: No hay errores de DNS, aplicación iniciada correctamente
```

## Configuración Final de Bold

### Variables de Entorno en ecosystem.config.js

```javascript
BOLD_API_KEY: '1XVQAZsH297hGUuW4KAqmC'
BOLD_SECRET_KEY: 'KWpgscWMWny3apOYs0Wvg'
BOLD_MERCHANT_ID: '0fhPQYC'
BOLD_API_URL: 'https://api-sandbox.bold.co/v1'
BOLD_WEBHOOK_SECRET: 'KWpgscWMWny3apOYs0Wvg'
BOLD_SUCCESS_URL: 'https://datagree.net/payment/success'
BOLD_FAILURE_URL: 'https://datagree.net/payment/failure'
BOLD_WEBHOOK_URL: 'https://datagree.net/api/webhooks/bold'
```

## Próximos Pasos

1. Probar crear un link de pago desde la interfaz
2. Verificar que el link de Bold se abra correctamente
3. Realizar una transacción de prueba
4. Verificar que el webhook reciba la notificación

## Lección Aprendida

Cuando se usa PM2 con variables de entorno definidas en `ecosystem.config.js`, estas tienen prioridad sobre el archivo `.env`. Siempre verificar ambos archivos al actualizar configuraciones.

---

**Fecha:** 21 de Enero de 2026
**Estado:** ✅ Completado
**Servidor:** 100.28.198.249 (datagree.net)
**Proceso:** datagree-backend (PID 34387)
