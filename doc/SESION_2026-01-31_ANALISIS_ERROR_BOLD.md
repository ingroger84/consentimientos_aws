# Análisis del Error de Bold Payment Gateway

## Fecha
31 de Enero de 2026

## Error Actual

### Mensaje de Error
```
HTTP 403 Forbidden

{
  "message": "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'Qqm1lWKN0Dm4/4GF/mKO4XIJ4s5tpXme/lz40NVd3ZQ='."
}
```

### Headers Enviados
```
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
Content-Type: application/json
```

## Análisis del Error

### 1. Formato del Header
Según la [documentación oficial de Bold](https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion), el header debe ser:

```
Authorization: x-api-key <llave_de_identidad>
```

**Estamos enviando exactamente este formato**, pero Bold responde con error.

### 2. Mensaje de Error Detallado

El error menciona:
- "Invalid key=value pair" - Sugiere que Bold espera un formato `key=value`
- "missing equal-sign" - Sugiere que falta un signo `=`
- "hashed with SHA-256 and encoded with Base64" - Sugiere que Bold está hasheando el header

### 3. Posibles Causas

#### Causa 1: Formato de Autenticación Incorrecto
El mensaje "key=value pair" sugiere que Bold podría estar esperando un formato diferente al documentado, posiblemente:
- `Authorization: api_key=<llave>`
- `Authorization: x-api-key=<llave>`
- O algún otro formato con `=`

#### Causa 2: Autenticación HMAC Requerida
El hecho de que el error mencione "hashed with SHA-256" sugiere que Bold podría requerir:
- Firma HMAC de la petición
- Uso del `BOLD_SECRET_KEY` para firmar
- Headers adicionales como timestamp

#### Causa 3: API Key Inválida o Sin Permisos
- La API Key `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68` podría no ser válida
- Podría ser una API Key de sandbox que no funciona en producción
- Podría no tener permisos para crear intenciones de pago

#### Causa 4: Documentación Desactualizada
- La documentación de Bold podría estar desactualizada
- El formato de autenticación podría haber cambiado
- Podría haber una versión diferente de la API

## Pruebas Realizadas

### Prueba 1: Header `x-api-key` Directo
```typescript
headers: {
  'x-api-key': this.apiKey
}
```
**Resultado**: Error "Missing Authentication Token"

### Prueba 2: Header `Authorization` con Formato Documentado
```typescript
headers: {
  'Authorization': `x-api-key ${this.apiKey}`
}
```
**Resultado**: Error "Invalid key=value pair (missing equal-sign)"

## Intentos de Solución

### Intento 1: Formato con Signo Igual
Probar:
```typescript
headers: {
  'Authorization': `x-api-key=${this.apiKey}`
}
```

### Intento 2: Formato Bearer
Probar:
```typescript
headers: {
  'Authorization': `Bearer ${this.apiKey}`
}
```

### Intento 3: Firma HMAC
Implementar firma HMAC usando `BOLD_SECRET_KEY`:
```typescript
const signature = crypto
  .createHmac('sha256', BOLD_SECRET_KEY)
  .update(requestData)
  .digest('base64');

headers: {
  'Authorization': `x-api-key ${this.apiKey}`,
  'X-Signature': signature
}
```

## Información de Contacto Bold

### Soporte Técnico
- Portal de desarrolladores: https://developers.bold.co
- Email de soporte: (pendiente de obtener)
- Teléfono: (pendiente de obtener)

### Preguntas para Bold

1. ¿Cuál es el formato exacto del header `Authorization` para la API de pagos en línea?
2. ¿Se requiere firma HMAC para las peticiones?
3. ¿La API Key `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68` es válida y está activa?
4. ¿Esta API Key tiene permisos para crear intenciones de pago?
5. ¿Es una API Key de sandbox o producción?
6. ¿Hay alguna documentación adicional o ejemplos de código que podamos consultar?

## Credenciales Actuales

```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'KVwpsp4WlWny3apOYoGWvg'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
```

## Próximos Pasos

1. ⏳ **Contactar con Bold Colombia** - URGENTE
   - Solicitar soporte técnico
   - Verificar formato de autenticación correcto
   - Verificar validez de las credenciales

2. ⏳ **Probar formatos alternativos** - Mientras se espera respuesta de Bold
   - Formato con `=`: `x-api-key=<llave>`
   - Formato Bearer: `Bearer <llave>`
   - Implementar firma HMAC

3. ⏳ **Verificar credenciales en el panel de Bold**
   - Acceder al panel de administración de Bold
   - Verificar estado de la API Key
   - Verificar permisos asignados
   - Generar nuevas credenciales si es necesario

## Conclusión

A pesar de seguir la documentación oficial de Bold al pie de la letra, la API sigue rechazando nuestras peticiones. El error sugiere que hay una discrepancia entre la documentación y la implementación real de la API.

**Es necesario contactar directamente con Bold Colombia** para:
1. Obtener el formato correcto de autenticación
2. Verificar que las credenciales sean válidas
3. Confirmar que tengamos los permisos necesarios
4. Obtener documentación actualizada o ejemplos de código funcionales

## Referencias

- Documentación Bold: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion
- Script de prueba: `backend/test-bold-standalone.js`
- Servicio Bold: `backend/src/payments/bold.service.ts`
- Sesión anterior: `doc/SESION_2026-01-31_CORRECCION_BOLD_AUTENTICACION.md`
