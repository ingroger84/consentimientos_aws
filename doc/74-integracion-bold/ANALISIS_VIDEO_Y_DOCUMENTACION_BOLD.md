# 📹 Análisis: Video Tutorial y Documentación Bold vs Implementación Actual

**Fecha**: 26 de Marzo 2026  
**Video**: https://www.youtube.com/watch?v=9v1e0Ciy2XI&t=337s  
**Documentación**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos  
**Estado**: ✅ ANÁLISIS COMPLETADO

---

## 🎯 Resumen Ejecutivo

Basándome en la documentación oficial de Bold API Link de Pagos, he identificado que nuestra implementación actual (v74.0) está **correcta** en estructura pero puede tener un problema con las llaves.

---

## 📚 Análisis de la Documentación Oficial

### URL Base:
```
https://integrations.api.bold.co
```
✅ **Nuestra implementación**: Correcto

### Autenticación:
```
Authorization: x-api-key <llave_de_identidad>
```
✅ **Nuestra implementación**: Correcto

### Endpoint Crear Link:
```
POST /online/link/v1
```
✅ **Nuestra implementación**: Correcto

---

## 📋 Estructura del Request (Según Documentación)

### Campos Obligatorios:

1. **amount_type** (string):
   - `"OPEN"`: El pagador decide el monto
   - `"CLOSE"`: El comerciante establece el monto
   
   ✅ **Nuestra implementación**: `"CLOSE"` (correcto)

### Campos Opcionales:

2. **amount** (object) - Requerido si `amount_type = "CLOSE"`:
   ```json
   {
     "currency": "COP",
     "total_amount": 10000,
     "taxes": [],
     "tip_amount": 0
   }
   ```
   ✅ **Nuestra implementación**: Correcto

3. **reference** (string):
   - Identificador único de la venta
   - Solo caracteres alfanuméricos, guiones bajos (_) y medios (-)
   - Máximo 60 caracteres
   - Se asigna automáticamente (LNK_*) si no se proporciona
   
   ✅ **Nuestra implementación**: Correcto

4. **description** (string):
   - Descripción breve de la transacción
   - Mínimo 2 caracteres, máximo 100 caracteres
   
   ✅ **Nuestra implementación**: Correcto

5. **callback_url** (string):
   - URL de redirección tras finalizar transacción
   - Debe ser HTTPS
   - Debe ser del dominio del negocio
   
   ✅ **Nuestra implementación**: Correcto

6. **payer_email** (string):
   - Email al cual enviar el link cuando se cree
   
   ✅ **Nuestra implementación**: Correcto

7. **expiration_date** (number):
   - Fecha de expiración en nanosegundos desde época Unix
   
   ⚠️ **Nuestra implementación**: No implementado (opcional)

8. **payment_methods** (array):
   - Lista de métodos de pago disponibles
   - Ejemplo: `["CREDIT_CARD", "PSE", "BOTON_BANCOLOMBIA", "NEQUI"]`
   - Si no se incluye, se muestran todos
   
   ⚠️ **Nuestra implementación**: No implementado (opcional)

9. **image_url** (string):
   - URL de imagen del producto/servicio
   - Debe ser HTTPS y terminar en .png o .jpg
   
   ⚠️ **Nuestra implementación**: No implementado (opcional)

---

## 📥 Estructura del Response (Según Documentación)

### Response Exitoso:
```json
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
  },
  "errors": []
}
```

✅ **Nuestra implementación**: Lee correctamente `payload.url` y `payload.payment_link`

---

## 🔍 Consulta de Estado del Link

### Endpoint:
```
GET /online/link/v1/{payment_link}
```

✅ **Nuestra implementación**: Correcto

### Response:
```json
{
  "api_version": 1,
  "id": "LNK_H7S4XXXX",
  "total": 10000,
  "subtotal": 8403,
  "tip_amount": 0,
  "taxes": [...],
  "status": "ACTIVE",
  "expiration_date": null,
  "creation_date": 1719242727607215713,
  "description": null,
  "payment_method": "PSE",
  "transaction_id": null,
  "amount_type": "CLOSE",
  "is_sandbox": false,
  "reference": "unique_reference_001-1798598454489"
}
```

### Estados Posibles:
- `ACTIVE`: Link disponible para pagar
- `PROCESSING`: Pago en curso
- `PAID`: Pago exitoso
- `REJECTED`: Pago rechazado
- `CANCELLED`: Pago cancelado o fallido
- `EXPIRED`: Link vencido

✅ **Nuestra implementación**: Mapea correctamente los campos

---

## 🔑 Llaves de Integración (Según Documentación)

### Ubicación de las Llaves:

La documentación indica que se deben usar las **llaves de "Botón de Pagos"**:

> "La API funciona bajo un esquema de seguridad utilizando la misma llave de identidad (API key) del Botón de pagos"

### Tipos de Llaves:

1. **Llaves de Prueba** (Sandbox):
   - Para desarrollo y testing
   - Transacciones no reales
   - `is_sandbox: true` en response

2. **Llaves de Producción**:
   - Para transacciones reales
   - `is_sandbox: false` en response

---

## ✅ Comparación: Nuestra Implementación vs Documentación

| Aspecto | Documentación | Nuestra Implementación | Estado |
|---------|---------------|------------------------|--------|
| **URL Base** | `https://integrations.api.bold.co` | ✅ Correcto | ✅ |
| **Endpoint** | `POST /online/link/v1` | ✅ Correcto | ✅ |
| **Autenticación** | `Authorization: x-api-key <key>` | ✅ Correcto | ✅ |
| **amount_type** | `"CLOSE"` | ✅ Correcto | ✅ |
| **amount** | `{ currency, total_amount, taxes, tip_amount }` | ✅ Correcto | ✅ |
| **reference** | String único | ✅ Correcto | ✅ |
| **description** | String 2-100 chars | ✅ Correcto | ✅ |
| **callback_url** | HTTPS URL | ✅ Correcto | ✅ |
| **payer_email** | Email string | ✅ Correcto | ✅ |
| **expiration_date** | Nanosegundos Unix | ⚠️ No implementado | ⚠️ Opcional |
| **payment_methods** | Array de métodos | ⚠️ No implementado | ⚠️ Opcional |
| **image_url** | HTTPS .png/.jpg | ⚠️ No implementado | ⚠️ Opcional |
| **Response** | Lee `payload.url` | ✅ Correcto | ✅ |
| **Consulta Estado** | `GET /online/link/v1/{id}` | ✅ Correcto | ✅ |

---

## 🎯 Campos Opcionales que Podríamos Agregar

### 1. Fecha de Expiración (expiration_date)

**Beneficio**: Los links expiran automáticamente después de cierto tiempo

**Implementación**:
```typescript
// Calcular fecha de expiración (ejemplo: 24 horas)
const expirationDate = Date.now() * 1000000 + (24 * 60 * 60 * 1000000000);

const payload = {
  // ... otros campos
  expiration_date: expirationDate,
};
```

### 2. Métodos de Pago (payment_methods)

**Beneficio**: Limitar métodos de pago disponibles

**Implementación**:
```typescript
const payload = {
  // ... otros campos
  payment_methods: ['CREDIT_CARD', 'PSE', 'NEQUI'],
};
```

### 3. Imagen del Producto (image_url)

**Beneficio**: Mostrar imagen en el checkout de Bold

**Implementación**:
```typescript
const payload = {
  // ... otros campos
  image_url: 'https://demo-estetica.archivoenlinea.com/logo.png',
};
```

---

## 🔧 Problema Actual: Error 403

### Análisis:

El error 403 que recibimos al probar con las llaves de prueba indica:

```json
{
  "Message": "User is not authorized to access this resource with an explicit deny in an identity-based policy"
}
```

### Posibles Causas:

1. **Llaves de Prueba No Activadas**:
   - Las llaves de prueba pueden requerir activación en el panel
   - Puede requerir solicitud al soporte

2. **Llaves Incorrectas**:
   - Las llaves compartidas pueden ser de otro servicio
   - Verificar que sean específicamente de "Botón de Pagos"

3. **Ambiente Incorrecto**:
   - Las llaves pueden ser para otro ambiente
   - Verificar si son para sandbox o producción

### Solución:

1. **Verificar en Panel de Bold**:
   - Entrar a https://panel.bold.co
   - Ir a "Botón de Pagos"
   - Verificar que las llaves estén activas
   - Copiar las llaves correctas

2. **Usar Llaves de Producción**:
   - Si las llaves de prueba no funcionan
   - Usar directamente las llaves de producción
   - Hacer pruebas con montos pequeños

---

## 📊 Flujo Completo (Según Documentación)

### 1. Crear Link de Pago

```typescript
POST https://integrations.api.bold.co/online/link/v1
{
  "amount_type": "CLOSE",
  "amount": {
    "currency": "COP",
    "total_amount": 10000,
    "taxes": [],
    "tip_amount": 0
  },
  "reference": "INV-202603-5324",
  "description": "Factura INV-202603-5324",
  "callback_url": "https://demo-estetica.archivoenlinea.com/payment-success",
  "payer_email": "cliente@email.com"
}
```

### 2. Bold Responde con URL

```json
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
  }
}
```

### 3. Usuario Paga en Bold

- Redirigir a `https://checkout.bold.co/LNK_H7S4xxx`
- Bold muestra checkout con métodos de pago
- Usuario completa el pago

### 4. Bold Redirige y Notifica

- Redirige a `callback_url`
- Envía webhook con estado del pago
- Backend marca factura como pagada

---

## ✅ Conclusión

### Nuestra Implementación:

- ✅ **Estructura**: 100% correcta según documentación
- ✅ **Endpoints**: Correctos
- ✅ **Request**: Correcto
- ✅ **Response**: Correcto
- ⚠️ **Llaves**: Problema con llaves de prueba

### Campos Opcionales No Implementados:

- ⚠️ `expiration_date`: Útil para expirar links automáticamente
- ⚠️ `payment_methods`: Útil para limitar métodos de pago
- ⚠️ `image_url`: Útil para mostrar logo/imagen

### Próximos Pasos:

1. **Obtener llaves correctas** del panel de Bold (producción)
2. **Probar con llaves de producción**
3. **Considerar agregar campos opcionales** (expiration_date, payment_methods, image_url)
4. **Desplegar a producción**

---

## 🎯 Recomendaciones

### Implementación Actual (v74.0):

La implementación está **correcta** según la documentación oficial. Solo necesitamos:

1. ✅ Llaves correctas de "Botón de Pagos"
2. ⚠️ Considerar agregar campos opcionales (no urgente)

### Campos Opcionales Recomendados:

1. **expiration_date**: Agregar expiración de 24-48 horas
2. **payment_methods**: Opcional, dejar todos por defecto
3. **image_url**: Opcional, agregar logo de la empresa

---

**Última actualización**: 26 de Marzo 2026  
**Estado**: ✅ IMPLEMENTACIÓN CORRECTA - ESPERANDO LLAVES DE PRODUCCIÓN
