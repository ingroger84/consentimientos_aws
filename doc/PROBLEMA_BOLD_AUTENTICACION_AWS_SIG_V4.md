# 🔐 Problema de Autenticación con Bold Colombia

**Fecha:** 2026-02-26  
**Versión:** 42.1.2  
**Estado:** ⚠️ BLOQUEADO - Requiere información de Bold

---

## 📋 Resumen del Problema

La integración con Bold Colombia está fallando con error **403 Forbidden** en todas las pruebas de autenticación. El análisis indica que Bold Colombia usa **AWS Signature Version 4** para autenticación, no el formato simple `x-api-key` que estamos usando actualmente.

---

## 🔍 Análisis Técnico

### Credenciales Actuales

```env
BOLD_API_KEY=1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
BOLD_SECRET_KEY=KVwpsp4WlWny3apOYoGWvg
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://api.online.payments.bold.co
```

### Formato de Autenticación Actual (Incorrecto)

```typescript
headers: {
  'Authorization': `x-api-key ${this.apiKey}`
}
```

### Errores Recibidos

```
Authorization header requires 'Credential' parameter
Authorization header requires 'Signature' parameter
Invalid key=value pair (missing equal-sign) in Authorization header
```

Estos mensajes indican claramente que Bold espera **AWS Signature Version 4**.

---

## 🧪 Pruebas Realizadas

Se probaron 8 formatos diferentes de autenticación:

1. ❌ `x-api-key <key>`
2. ❌ `Bearer <key>`
3. ❌ `x-api-key=<key>`
4. ❌ `apikey=<key>`
5. ❌ Solo la key
6. ❌ Header `x-api-key` separado
7. ❌ Header `API-Key` separado
8. ❌ Basic Auth con API Key y Secret

**Resultado:** Todos fallaron con 403 Forbidden

---

## 📚 AWS Signature Version 4

### ¿Qué es?

AWS Signature Version 4 (SigV4) es un protocolo de autenticación que:
- Firma cada petición con una clave secreta
- Incluye timestamp para prevenir replay attacks
- Genera un hash HMAC-SHA256 de la petición
- Es el estándar usado por AWS para sus APIs

### Formato del Header de Autorización

```
Authorization: AWS4-HMAC-SHA256 
  Credential=<access_key>/<date>/<region>/<service>/aws4_request,
  SignedHeaders=<signed_headers>,
  Signature=<signature>
```

### Ejemplo Real

```
Authorization: AWS4-HMAC-SHA256 
  Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request,
  SignedHeaders=host;range;x-amz-date,
  Signature=fe5f80f77d5fa3beca038a248ff027d0445342fe2855ddc963176630326f1024
```

---

## 🛠️ Solución Propuesta

### Opción 1: Implementar AWS SigV4 Manualmente

```typescript
import * as crypto from 'crypto';

class BoldService {
  private generateAwsSigV4(
    method: string,
    path: string,
    payload: string,
    timestamp: Date
  ): string {
    const region = 'us-east-1'; // O la región de Bold
    const service = 'execute-api'; // O el servicio específico
    
    // 1. Crear canonical request
    const canonicalRequest = this.createCanonicalRequest(method, path, payload);
    
    // 2. Crear string to sign
    const stringToSign = this.createStringToSign(timestamp, region, service, canonicalRequest);
    
    // 3. Calcular signature
    const signature = this.calculateSignature(timestamp, region, service, stringToSign);
    
    // 4. Crear authorization header
    return this.createAuthorizationHeader(timestamp, region, service, signature);
  }
  
  private createCanonicalRequest(method: string, path: string, payload: string): string {
    const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');
    
    return [
      method,
      path,
      '', // Query string
      'host:api.online.payments.bold.co\n',
      'x-amz-date:' + this.getAmzDate(new Date()) + '\n',
      '',
      'host;x-amz-date',
      hashedPayload
    ].join('\n');
  }
  
  private calculateSignature(
    timestamp: Date,
    region: string,
    service: string,
    stringToSign: string
  ): string {
    const kDate = crypto.createHmac('sha256', 'AWS4' + this.secretKey)
      .update(timestamp.toISOString().split('T')[0])
      .digest();
    
    const kRegion = crypto.createHmac('sha256', kDate)
      .update(region)
      .digest();
    
    const kService = crypto.createHmac('sha256', kRegion)
      .update(service)
      .digest();
    
    const kSigning = crypto.createHmac('sha256', kService)
      .update('aws4_request')
      .digest();
    
    return crypto.createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');
  }
}
```

### Opción 2: Usar Librería AWS SDK

```typescript
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

const signer = new SignatureV4({
  service: 'execute-api',
  region: 'us-east-1',
  credentials: {
    accessKeyId: this.apiKey,
    secretAccessKey: this.secretKey,
  },
  sha256: Sha256,
});

const signedRequest = await signer.sign({
  method: 'POST',
  hostname: 'api.online.payments.bold.co',
  path: '/payment-intents',
  protocol: 'https:',
  headers: {
    'Content-Type': 'application/json',
    'host': 'api.online.payments.bold.co',
  },
  body: JSON.stringify(payload),
});
```

---

## ⚠️ Información Necesaria de Bold

Antes de implementar la solución, necesitamos confirmar con Bold Colombia:

### 1. Formato de Autenticación Correcto
- ¿Usan AWS Signature V4?
- ¿Qué región usar? (us-east-1, us-west-2, etc.)
- ¿Qué nombre de servicio? (execute-api, bold-api, etc.)

### 2. Credenciales
- ¿Las credenciales actuales son válidas?
- ¿Son para sandbox o producción?
- ¿Tienen los permisos correctos?
- ¿Están activas?

### 3. Documentación
- ¿Tienen documentación oficial de la API?
- ¿Ejemplos de código en Node.js/TypeScript?
- ¿Endpoint de prueba para verificar autenticación?

### 4. Alternativas
- ¿Existe un formato de autenticación más simple?
- ¿Hay un SDK oficial de Bold para Node.js?
- ¿Webhooks requieren autenticación diferente?

---

## 📞 Contacto con Bold Colombia

### Información de Contacto
- **Sitio web:** https://bold.co
- **Soporte:** https://bold.co/soporte
- **Email:** soporte@bold.co (verificar)
- **Teléfono:** (verificar en sitio web)

### Preguntas para Bold

```
Asunto: Consulta sobre Autenticación API Bold Colombia

Hola equipo de Bold,

Estoy integrando Bold en mi aplicación y tengo las siguientes credenciales:
- API Key: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
- Secret Key: KVwpsp4WlWny3apOYoGWvg
- Merchant ID: 2M0MTRAD37

Estoy recibiendo errores 403 que indican que se requiere AWS Signature V4:
"Authorization header requires 'Credential' parameter"
"Authorization header requires 'Signature' parameter"

Preguntas:
1. ¿Qué formato de autenticación debo usar?
2. ¿Usan AWS Signature Version 4?
3. ¿Tienen documentación oficial de la API?
4. ¿Hay un SDK oficial para Node.js?
5. ¿Las credenciales son para sandbox o producción?

Gracias,
[Tu nombre]
```

---

## 🔄 Próximos Pasos

1. **Contactar con Bold Colombia** para obtener:
   - Documentación oficial
   - Formato correcto de autenticación
   - Verificación de credenciales

2. **Mientras tanto:**
   - Mantener el código actual
   - Documentar el problema
   - Preparar implementación de AWS SigV4

3. **Una vez tengamos la información:**
   - Implementar autenticación correcta
   - Actualizar `bold.service.ts`
   - Probar integración completa
   - Actualizar documentación

---

## 📝 Archivos Relacionados

- `backend/src/payments/bold.service.ts` - Servicio principal
- `backend/test-bold-connection.js` - Script de prueba con .env
- `backend/test-bold-standalone.js` - Script standalone
- `backend/test-bold-auth-formats.js` - Prueba de formatos
- `backend/TEST-BOLD-README.md` - Documentación

---

## 🔗 Referencias

- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [@aws-sdk/signature-v4](https://www.npmjs.com/package/@aws-sdk/signature-v4)
- [Bold Colombia](https://bold.co)

---

## ✅ Estado Actual

- ✅ Problema identificado
- ✅ Pruebas realizadas
- ✅ Documentación creada
- ⏳ Esperando información de Bold
- ⏳ Implementación pendiente
