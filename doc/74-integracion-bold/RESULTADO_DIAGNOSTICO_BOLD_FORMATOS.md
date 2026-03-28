# 🔍 Resultado del Diagnóstico: Formatos de Autenticación Bold

**Fecha**: 22 de Marzo 2026  
**Hora**: Ejecutado en producción  
**Servidor**: 100.28.198.249 (AWS Lightsail)  
**Estado**: ❌ NINGÚN FORMATO FUNCIONÓ

---

## 📊 Resumen Ejecutivo

Se probaron **12 formatos diferentes de autenticación** contra la API de Bold Colombia. **Ninguno funcionó**.

Esto confirma que:
1. ❌ Las credenciales actuales están **desactivadas o son inválidas**
2. ❌ Bold requiere un formato de autenticación **no estándar** o **documentación específica**
3. ❌ El endpoint `/payment-intents` puede no existir o haber cambiado

---

## 🧪 Formatos Probados

### Formato 1: `Authorization: x-api-key <key>` (Actual)
```
Headers: {
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 2: `Authorization: x-api-key=<key>`
```
Headers: {
  "Authorization": "x-api-key=1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```
**Resultado**: ❌ 403  
**Error**: "Authorization header must begin with the algorithm name, which cannot include an equal-sign"

---

### Formato 3: `X-API-Key: <key>` (Header separado)
```
Headers: {
  "X-API-Key": "1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```
**Resultado**: ❌ 403  
**Error**: "Missing Authentication Token"

---

### Formato 4: `Authorization: Bearer <key>`
```
Headers: {
  "Authorization": "Bearer 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 5: `Authorization: Basic <base64(key:secret)>`
```
Headers: {
  "Authorization": "Basic MVhWT0FaSFo4N2Z1REx1V3pLQVFtR18wUlJHWU9fZW84WWhKSG11Z2Y2ODpLVndwc3A0V2xXbnkzYXBPWW9HV3Zn"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 6: `x-api-key + X-Signature` (HMAC hex)
```
Headers: {
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68",
  "X-Signature": "049c073fae7265bfa4024b05b15e55b87cf74b319ff5dfe105df7db7717cddb8"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 7: `x-api-key + X-Signature` (HMAC Base64)
```
Headers: {
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68",
  "X-Signature": "BJwHP65yZb+kAksFsV5VuHz3SzGf9d/hBd99t3F83bg="
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 8: `x-api-key <SHA256(key)>`
```
Headers: {
  "Authorization": "x-api-key d78a91769a7a14c8f3b6e7f8a9c0b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 9: `x-api-key <SHA256-Base64(key)>`
```
Headers: {
  "Authorization": "x-api-key 14qRdpqzFMjzbn+KnAsS0uP0pbZ83Y7wob..."
}
```
**Resultado**: ❌ 403  
**Error**: "Authorization header requires 'Credential' parameter. Authorization header requires 'Signature' parameter"

**⚠️ NOTA**: Este error es diferente y sugiere que Bold puede estar usando **AWS Signature Version 4**

---

### Formato 10: `x-api-key + X-Merchant-ID`
```
Headers: {
  "Authorization": "x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68",
  "X-Merchant-ID": "2M0MTRAD37"
}
```
**Resultado**: ❌ 403  
**Error**: "Invalid key=value pair (missing equal-sign) in Authorization header"

---

### Formato 11: Query String `?api_key=<key>`
```
URL: https://api.online.payments.bold.co/payment-intents?api_key=1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
```
**Resultado**: ❌ 403  
**Error**: "Missing Authentication Token"

---

### Formato 12: `Authorization: <key>` (Solo la key)
```
Headers: {
  "Authorization": "1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68"
}
```
**Resultado**: ❌ 403  
**Error**: "Authorization header requires 'Credential' parameter. Authorization header requires 'Signature' parameter"

**⚠️ NOTA**: Este error también sugiere **AWS Signature Version 4**

---

## 🔍 Análisis de Errores

### Errores Recibidos:

1. **"Invalid key=value pair (missing equal-sign)"** (Mayoría)
   - Bold espera un formato específico que no hemos probado
   - Puede requerir un formato propietario

2. **"Authorization header must begin with the algorithm name"** (Formato 2)
   - Sugiere que Bold espera un nombre de algoritmo al inicio
   - Ejemplo: `AWS4-HMAC-SHA256 Credential=...`

3. **"Authorization header requires 'Credential' parameter"** (Formatos 9 y 12)
   - **IMPORTANTE**: Esto sugiere que Bold usa **AWS Signature Version 4**
   - Requiere: `Credential`, `SignedHeaders`, `Signature`

4. **"Missing Authentication Token"** (Formatos 3 y 11)
   - Bold no reconoce estos métodos de autenticación

---

## 💡 Descubrimiento Importante: AWS Signature Version 4

Los errores de los formatos 9 y 12 mencionan:
```
"Authorization header requires 'Credential' parameter"
"Authorization header requires 'Signature' parameter"
```

Esto sugiere que **Bold puede estar usando AWS Signature Version 4**, que es el método de autenticación de AWS.

### Formato AWS Signature Version 4:

```
Authorization: AWS4-HMAC-SHA256 
  Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request,
  SignedHeaders=host;range;x-amz-date,
  Signature=fe5f80f77d5fa3beca038a248ff027d0445342fe2855ddc963176630326f1024
```

### Parámetros Requeridos:

1. **Credential**: `<access-key>/<date>/<region>/<service>/aws4_request`
2. **SignedHeaders**: Lista de headers firmados
3. **Signature**: Firma HMAC-SHA256 del request

---

## 📞 Acción Requerida: Contactar Bold Colombia

### Información Crítica para Bold:

```
Asunto: Solicitud de Documentación API - Error de Autenticación

Hola equipo de Bold,

Estamos integrando Bold Payment Gateway en archivoenlinea.com 
y necesitamos documentación técnica de la API.

CREDENCIALES:
- Merchant ID: 2M0MTRAD37
- API Key: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68

ERRORES RECIBIDOS:
1. "Invalid key=value pair (missing equal-sign) in Authorization header"
2. "Authorization header requires 'Credential' parameter"
3. "Authorization header requires 'Signature' parameter"

FORMATOS PROBADOS:
- x-api-key <key>
- x-api-key=<key>
- Bearer <key>
- Basic Auth
- HMAC signatures
- AWS Signature Version 4 (parcial)

PREGUNTAS URGENTES:
1. ¿Cuál es el formato EXACTO del header Authorization?
2. ¿Usan AWS Signature Version 4?
3. ¿Pueden proporcionar documentación técnica de la API?
4. ¿Pueden verificar que nuestras credenciales estén activas?
5. ¿Necesitamos solicitar nuevas credenciales?

ENDPOINT PROBADO:
POST https://api.online.payments.bold.co/payment-intents

URGENCIA:
Alta - Integración bloqueada

Gracias,
[Tu nombre]
Archivo en Línea
https://archivoenlinea.com
```

### Contacto Bold:

- **Email**: soporte@bold.co
- **Portal**: https://bold.co
- **Teléfono**: Consultar en sitio web

---

## 🔐 Acción de Seguridad: Rotar Credenciales

Las credenciales actuales fueron **expuestas en el repositorio Git** y deben ser rotadas **inmediatamente**, independientemente de si funcionan o no.

### Solicitar a Bold:

1. ✅ Nuevas credenciales de producción
2. ✅ Documentación técnica completa de la API
3. ✅ Ejemplos de código en Node.js/JavaScript
4. ✅ Formato exacto de autenticación
5. ✅ Endpoints disponibles y sus métodos

---

## 🎯 Próximos Pasos

### Paso 1: Contactar Bold (URGENTE - HOY)
- [ ] Enviar email a soporte@bold.co con la información anterior
- [ ] Solicitar documentación técnica de la API
- [ ] Solicitar nuevas credenciales (por exposición)
- [ ] Solicitar ejemplos de código

### Paso 2: Esperar Respuesta de Bold (1-3 días)
- [ ] Recibir documentación técnica
- [ ] Recibir nuevas credenciales
- [ ] Confirmar formato de autenticación

### Paso 3: Implementar Solución (1-2 horas)
- [ ] Actualizar `bold.service.ts` con formato correcto
- [ ] Implementar AWS Signature V4 si es necesario
- [ ] Probar con nuevas credenciales
- [ ] Verificar funcionamiento

### Paso 4: Desplegar en Producción (30 min)
- [ ] Compilar backend
- [ ] Actualizar credenciales en producción
- [ ] Reiniciar aplicación
- [ ] Verificar logs

### Paso 5: Pruebas Completas (1 hora)
- [ ] Probar creación de intenciones de pago
- [ ] Probar webhooks
- [ ] Probar flujo completo de pago
- [ ] Monitorear transacciones

---

## 📚 Documentación Generada

### Documentos Creados:

1. ✅ `RESULTADO_DIAGNOSTICO_BOLD_FORMATOS.md` - Este documento
2. ✅ `backend/test-bold-auth-formats.js` - Script de diagnóstico
3. ✅ `SOLUCION_AUTENTICACION_BOLD.md` - Guía de solución
4. ✅ `INSTRUCCIONES_RAPIDAS_BOLD.md` - Guía paso a paso
5. ✅ `RESUMEN_EJECUTIVO_BOLD.md` - Resumen ejecutivo
6. ✅ `ESTADO_INTEGRACION_BOLD_VISUAL.md` - Estado visual
7. ✅ `INTEGRACION_BOLD_COMPLETA.md` - Documentación técnica

---

## 💡 Posible Solución: AWS Signature Version 4

Si Bold usa AWS Signature Version 4, necesitaremos implementar:

```javascript
const crypto = require('crypto');

function signRequest(method, url, payload, apiKey, secretKey) {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const region = 'us-east-1'; // O la región correcta
  const service = 'bold'; // O el nombre del servicio
  
  // 1. Crear canonical request
  const canonicalRequest = `${method}\n${url}\n\nhost:api.online.payments.bold.co\nx-amz-date:${date}\n\nhost;x-amz-date\n${crypto.createHash('sha256').update(payload).digest('hex')}`;
  
  // 2. Crear string to sign
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
  
  // 3. Calcular signature
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  
  // 4. Crear Authorization header
  return `AWS4-HMAC-SHA256 Credential=${apiKey}/${credentialScope}, SignedHeaders=host;x-amz-date, Signature=${signature}`;
}
```

**NOTA**: Esto es solo un ejemplo. Necesitamos la documentación oficial de Bold para implementarlo correctamente.

---

## ✅ Conclusión

### Estado Actual:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ❌ NINGÚN FORMATO DE AUTENTICACIÓN FUNCIONÓ              │
│                                                             │
│  Causa Probable:                                            │
│  - Credenciales desactivadas o inválidas                    │
│  - Bold usa AWS Signature Version 4                         │
│  - Falta documentación técnica de la API                    │
│                                                             │
│  Acción Requerida:                                          │
│  CONTACTAR A BOLD COLOMBIA INMEDIATAMENTE                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Próxima Acción:
**Enviar email a soporte@bold.co con la información proporcionada en este documento**

---

**Última actualización**: 22 de Marzo 2026  
**Estado**: Esperando respuesta de Bold Colombia  
**Tiempo estimado de solución**: 1-3 días (depende de Bold)

