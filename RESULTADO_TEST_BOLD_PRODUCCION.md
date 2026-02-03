# 🔍 RESULTADO TEST BOLD EN PRODUCCIÓN

**Fecha**: 02 de Febrero 2026  
**Hora**: 04:56 UTC  
**Servidor**: 100.28.198.249 (AWS Lightsail)  
**Estado**: ❌ ERROR DE AUTENTICACIÓN

---

## 📊 RESUMEN EJECUTIVO

El test de conexión con Bold API se ejecutó exitosamente en el servidor de producción, pero **Bold está rechazando las credenciales**.

---

## ✅ VERIFICACIONES EXITOSAS

### 1. Variables de Entorno
```
✅ BOLD_API_KEY: 1XVOAZHZ87fuDLuWzKAQ...
✅ BOLD_SECRET_KEY: IKi1koNT7p...
✅ BOLD_MERCHANT_ID: 2M0MTRAD37
✅ BOLD_API_URL: https://api.online.payments.bold.co
```

### 2. Formato de Autenticación
```
✅ Header Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQ...
✅ Formato correcto según documentación Bold
```

### 3. Cliente HTTP
```
✅ Cliente HTTP creado correctamente
✅ Axios configurado correctamente
```

---

## ❌ ERROR DETECTADO

### Respuesta de Bold
```json
{
  "message": "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'Qqm1lWKN0Dm4/4GF/mKO4XIJ4s5tpXme/lz40NVd3ZQ='."
}
```

### Código HTTP
```
403 Forbidden
```

### Headers Enviados
```json
{
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68",
  "User-Agent": "axios/1.13.2",
  "Content-Length": "258",
  "Accept-Encoding": "gzip, compress, deflate, br"
}
```

---

## 🔍 ANÁLISIS DEL ERROR

### Mensaje de Bold
El mensaje de error menciona:
- "Invalid key=value pair (missing equal-sign)"
- "hashed with SHA-256 and encoded with Base64"

### Interpretación
Bold está esperando que la API Key esté:
1. **Hasheada con SHA-256**
2. **Codificada en Base64**
3. **En formato key=value**

### Problema Identificado
Estamos enviando la API Key en texto plano:
```
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
```

Pero Bold parece esperar algo como:
```
Authorization: x-api-key <hash_sha256_base64>
```

---

## 🎯 POSIBLES CAUSAS

### 1. API Key Incorrecta o Inválida ⚠️
- La API Key puede estar desactivada
- La API Key puede haber expirado
- La API Key puede no tener permisos

### 2. Formato de Autenticación Incorrecto ⚠️
- Bold puede requerir un formato específico
- Puede necesitar firma HMAC
- Puede necesitar timestamp

### 3. Ambiente Incorrecto ⚠️
- API Key de sandbox usada en producción
- API Key de producción sin activar
- Merchant ID incorrecto

### 4. Credenciales Comprometidas 🚨
- Las credenciales fueron expuestas en el repositorio
- Bold puede haberlas desactivado automáticamente
- Requieren rotación inmediata

---

## 📝 PAYLOAD DE PRUEBA ENVIADO

```json
{
  "reference_id": "TEST-1770008205476",
  "amount": {
    "currency": "COP",
    "total_amount": 10000
  },
  "description": "Prueba de conexión con Bold API",
  "callback_url": "https://archivoenlinea.com/test",
  "customer": {
    "name": "Usuario de Prueba",
    "email": "test@archivoenlinea.com"
  }
}
```

---

## 🔧 SOLUCIONES PROPUESTAS

### Solución 1: Contactar Soporte de Bold (RECOMENDADO)
```
Contacto: soporte@bold.co
Teléfono: Ver sitio web Bold Colombia

Información a proporcionar:
- Merchant ID: 2M0MTRAD37
- API Key: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
- Error: "Invalid key=value pair (missing equal-sign)"
- Pregunta: ¿Cómo debe ser el formato correcto del header Authorization?
```

### Solución 2: Verificar Documentación de Bold
```
1. Revisar documentación oficial de Bold
2. Verificar ejemplos de código
3. Confirmar formato de autenticación
4. Verificar si requiere firma HMAC
```

### Solución 3: Rotar Credenciales
```
1. Solicitar nuevas credenciales a Bold
2. Verificar que sean para producción
3. Confirmar permisos necesarios
4. Actualizar en servidor
```

### Solución 4: Implementar Firma HMAC
```javascript
// Si Bold requiere firma HMAC
const crypto = require('crypto');

const signature = crypto
  .createHmac('sha256', BOLD_SECRET_KEY)
  .update(requestData)
  .digest('base64');

headers['Authorization'] = `x-api-key ${BOLD_API_KEY}`;
headers['X-Signature'] = signature;
```

---

## 📊 COMPARACIÓN CON DOCUMENTACIÓN

### Formato Actual (Nuestro)
```
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
```

### Formato Esperado por Bold (Según Error)
```
Authorization: x-api-key <hash_sha256_base64>
```

### Posible Formato Correcto
```
Authorization: x-api-key=1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
```

O con firma:
```
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
X-Signature: <hmac_sha256_base64>
```

---

## 🚨 ESTADO DE CREDENCIALES

### Credenciales Actuales
```
BOLD_API_KEY: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
BOLD_SECRET_KEY: IKi1koNT7pUK1uTRf4vYOQ (en producción)
BOLD_MERCHANT_ID: 2M0MTRAD37
```

### ⚠️ IMPORTANTE
Estas credenciales fueron **expuestas en el repositorio Git** y deben ser rotadas inmediatamente, independientemente de si funcionan o no.

---

## 📋 PRÓXIMOS PASOS

### Paso 1: Contactar Bold (URGENTE)
- [ ] Enviar email a soporte@bold.co
- [ ] Explicar el error recibido
- [ ] Solicitar formato correcto de autenticación
- [ ] Solicitar nuevas credenciales (por exposición)

### Paso 2: Verificar Documentación
- [ ] Revisar documentación oficial de Bold
- [ ] Buscar ejemplos de código en Node.js
- [ ] Verificar si requiere firma HMAC
- [ ] Confirmar formato de headers

### Paso 3: Implementar Solución
- [ ] Actualizar código según documentación
- [ ] Implementar firma HMAC si es necesario
- [ ] Probar con nuevas credenciales
- [ ] Verificar en ambiente de prueba primero

### Paso 4: Rotar Credenciales
- [ ] Obtener nuevas credenciales de Bold
- [ ] Actualizar en servidor de producción
- [ ] Actualizar en archivo local (no commitear)
- [ ] Verificar funcionamiento

---

## 📝 LOGS COMPLETOS

### Ejecución del Script
```
============================================================
🚀 INICIANDO PRUEBA DE CONEXIÓN CON BOLD
============================================================
ℹ️  Fecha: 2/2/2026, 4:56:45 a. m.

1️⃣  Verificando variables de entorno...
✅ BOLD_API_KEY: 1XVOAZHZ87fuDLuWzKAQ...
✅ BOLD_SECRET_KEY: IKi1koNT7p...
✅ BOLD_MERCHANT_ID: 2M0MTRAD37
✅ BOLD_API_URL: https://api.online.payments.bold.co

2️⃣  Verificando formato de autenticación...
ℹ️  Header Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQ...

3️⃣  Creando cliente HTTP...
✅ Cliente HTTP creado correctamente

4️⃣  Probando creación de intención de pago...
ℹ️  Enviando petición a Bold...

============================================================
❌ ERROR EN LA CONEXIÓN CON BOLD
============================================================

❌ Código HTTP: 403
📄 Respuesta: Invalid key=value pair (missing equal-sign)
```

---

## ✅ CONCLUSIÓN

### Estado Actual
```
┌────────────────────────────────────────────┐
│                                            │
│  ❌ Conexión Bold: FALLIDA                │
│  ✅ Script ejecutado: CORRECTAMENTE       │
│  ✅ Credenciales cargadas: SÍ             │
│  ❌ Autenticación: RECHAZADA              │
│  🚨 Acción requerida: CONTACTAR BOLD     │
│                                            │
└────────────────────────────────────────────┘
```

### Resumen
El script se ejecutó correctamente en producción y confirmó que:
1. Las credenciales están configuradas
2. El formato de autenticación es correcto según nuestra documentación
3. Bold está rechazando las credenciales con un error específico
4. Se requiere contactar a Bold para resolver el problema

### Acción Inmediata
**Contactar a Bold Support** para:
1. Verificar formato correcto de autenticación
2. Solicitar nuevas credenciales (por exposición)
3. Confirmar que las credenciales actuales estén activas
4. Obtener documentación actualizada

---

**Ejecutado en**: Servidor de producción (100.28.198.249)  
**Fecha**: 02 de Febrero 2026  
**Hora**: 04:56 UTC  
**Estado**: ❌ ERROR DE AUTENTICACIÓN BOLD
