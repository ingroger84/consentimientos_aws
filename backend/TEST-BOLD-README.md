# Scripts de Prueba para Bold Payment Gateway

Este directorio contiene scripts para verificar la conexión con Bold Payment Gateway y validar que las credenciales estén configuradas correctamente.

## Scripts Disponibles

### 1. `test-bold-auth-formats.js` ⭐ NUEVO - DIAGNÓSTICO AUTOMÁTICO
Script que prueba **12 formatos diferentes de autenticación** automáticamente para identificar el formato correcto que Bold espera.

**Uso básico:**
```bash
cd backend
node test-bold-auth-formats.js
```

**Uso con PowerShell (recomendado):**
```powershell
.\scripts\test-bold-auth-formats.ps1
```

**Qué hace:**
- Prueba 12 formatos de autenticación diferentes
- Identifica automáticamente cuál funciona
- Muestra la respuesta de Bold para cada intento
- Genera un resumen con los formatos exitosos

**Requisitos:**
- Node.js y axios instalado

---

### 2. `test-bold-standalone.js` ⭐ PRUEBA BÁSICA
Script standalone que puede ejecutarse sin configuración adicional. Usa las credenciales hardcodeadas o variables de entorno.

**Uso básico:**
```bash
cd backend
node test-bold-standalone.js
```

**Uso con credenciales personalizadas:**
```bash
BOLD_API_KEY=tu_api_key BOLD_SECRET_KEY=tu_secret node test-bold-standalone.js
```

**Requisitos:**
- Solo Node.js y axios instalado

---

### 3. `test-bold-connection.js`
Script que usa las variables de entorno del proyecto (archivo `.env`).

**Uso:**
```bash
cd backend
node test-bold-connection.js
```

**Requisitos:**
- Archivo `.env` configurado con las credenciales de Bold
- Dependencias del proyecto instaladas (`npm install`)

## Instalación de Dependencias

Si no tienes axios instalado:

```bash
cd backend
npm install axios
```

## Ejecución en el Servidor de Producción

### Opción 1: Ejecutar directamente en el servidor
```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node test-bold-standalone.js
```

### Opción 2: Ejecutar desde tu máquina local
```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws/backend && node test-bold-standalone.js"
```

## Qué Verifica el Script

El script realiza las siguientes verificaciones:

1. ✅ **Credenciales configuradas**: Verifica que todas las variables de entorno de Bold estén presentes
2. ✅ **Formato de autenticación**: Verifica que el header `Authorization` tenga el formato correcto
3. ✅ **Conexión con Bold**: Intenta conectarse a la API de Bold
4. ✅ **Creación de intención de pago**: Intenta crear una intención de pago de prueba

## Interpretación de Resultados

### ✅ Conexión Exitosa
Si ves este mensaje:
```
🎉 Las credenciales de Bold son VÁLIDAS y funcionan correctamente
🎉 La API de Bold está respondiendo correctamente
🎉 El formato de autenticación es correcto
```

**Significa que:**
- Tus credenciales de Bold son válidas
- El formato de autenticación es correcto
- La API de Bold está respondiendo
- Puedes proceder a usar Bold en producción

### ❌ Error de Autenticación (401)
```
❌ Error 401: No autorizado
```

**Posibles causas:**
- API Key incorrecta o inválida
- Formato del header incorrecto
- API Key desactivada en el panel de Bold

**Soluciones:**
1. Verifica que la API Key sea correcta
2. Contacta con Bold para verificar que tu API Key esté activa
3. Verifica que el formato del header sea: `Authorization: x-api-key <llave>`

### ❌ Error de Permisos (403)
```
❌ Error 403: Prohibido
```

**Posibles causas:**
- Tu API Key no tiene permisos para crear intenciones de pago
- API Key de sandbox usada en producción (o viceversa)

**Soluciones:**
1. Verifica en el panel de Bold los permisos de tu API Key
2. Contacta con Bold para solicitar los permisos necesarios
3. Verifica que estés usando la API Key correcta (sandbox vs producción)

### ❌ Error de Formato (400)
```
❌ Error 400: Petición incorrecta
```

**Posibles causas:**
- Payload con formato incorrecto
- Campos requeridos faltantes

**Soluciones:**
1. Revisa la documentación de Bold para el endpoint `/payment-intents`
2. Verifica que todos los campos requeridos estén presentes

### ❌ Sin Respuesta
```
❌ No se recibió respuesta de Bold
```

**Posibles causas:**
- Problemas de red
- URL de API incorrecta
- Firewall bloqueando la conexión

**Soluciones:**
1. Verifica tu conexión a internet
2. Verifica que la URL de Bold sea correcta: `https://api.online.payments.bold.co`
3. Intenta hacer ping a `api.online.payments.bold.co`

## Credenciales Actuales

Las credenciales de Bold están configuradas en:

- **Producción**: `ecosystem.config.js`
- **Desarrollo**: `backend/.env`

### Credenciales de Producción
```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'KVwpsp4WlWny3apOYoGWvg'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
```

## Formato Correcto de Autenticación

Según la [documentación oficial de Bold](https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion):

```
Authorization: x-api-key <llave_de_identidad>
```

**Ejemplo:**
```
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
```

## Documentación de Bold

- Portal de desarrolladores: https://developers.bold.co
- Integración: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion
- Esquema de datos: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/esquema-de-datos

## Soporte

Si después de ejecutar el script sigues teniendo problemas:

1. Revisa los logs del script para identificar el error específico
2. Consulta la documentación de Bold
3. Contacta con el soporte técnico de Bold Colombia
4. Verifica que tu cuenta de Bold esté activa y configurada correctamente

## Notas Importantes

- ⚠️ El script crea una intención de pago de prueba con un monto de $10,000 COP
- ⚠️ Esta intención de pago NO se procesa, solo se crea para verificar la conexión
- ⚠️ No se realiza ningún cargo real
- ✅ Es seguro ejecutar este script en producción
- ✅ El script no modifica ninguna configuración

## Ejemplo de Salida Exitosa

```
==================================================================
🚀 INICIANDO PRUEBA DE CONEXIÓN CON BOLD PAYMENT GATEWAY
==================================================================
ℹ️  Fecha: 31/1/2026, 1:30:00 a. m.
ℹ️  Script: test-bold-standalone.js

==================================================================
🔍 VERIFICACIÓN DE CREDENCIALES BOLD
==================================================================

1️⃣  Credenciales configuradas:

ℹ️  API Key: 1XVOAZHZ87fuDLuWz...gf68
ℹ️  Secret Key: KVwpsp4WlW...
ℹ️  Merchant ID: 2M0MTRAD37
ℹ️  API URL: https://api.online.payments.bold.co

2️⃣  Formato de autenticación:

ℹ️  Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQm...
✅ Formato correcto según documentación Bold

3️⃣  Configurando cliente HTTP:

✅ Cliente HTTP configurado

4️⃣  Probando endpoints de Bold:

📍 Test 2: Crear intención de pago de prueba
ℹ️  Payload de prueba:
{
  "reference_id": "TEST-1738287000000",
  "amount": {
    "currency": "COP",
    "total_amount": 10000
  },
  "description": "Prueba de conexión con Bold API - Script de verificación",
  "callback_url": "https://archivoenlinea.com/test-callback",
  "customer": {
    "name": "Usuario de Prueba",
    "email": "test@archivoenlinea.com"
  }
}

ℹ️  ⏳ Enviando petición a Bold...

==================================================================
✅ CONEXIÓN EXITOSA CON BOLD
==================================================================

📊 Respuesta completa de Bold:
{
  "payload": {
    "reference_id": "TEST-1738287000000",
    "status": "ACTIVE",
    "creation_date": "2026-01-31T01:30:00Z",
    "amount": {
      "currency": "COP",
      "total_amount": 10000
    }
  }
}

📋 Información de la intención de pago:

✅ Reference ID: TEST-1738287000000
✅ Estado: ACTIVE
✅ Fecha de creación: 2026-01-31T01:30:00Z
✅ Monto: 10000 COP

======================================================================
✅ 🎉 Las credenciales de Bold son VÁLIDAS y funcionan correctamente
✅ 🎉 La API de Bold está respondiendo correctamente
✅ 🎉 El formato de autenticación es correcto
======================================================================

ℹ️  ✨ Puedes proceder a usar Bold en producción

======================================================================
🎉 PRUEBA COMPLETADA EXITOSAMENTE
======================================================================

✨ Tu integración con Bold está lista para usar
```
