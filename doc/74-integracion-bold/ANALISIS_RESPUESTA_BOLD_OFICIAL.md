# 📧 Análisis de Respuesta Oficial de Bold

**Fecha**: 26 de Marzo 2026  
**Fuente**: Email de Julieth (Soporte Bold)  
**Estado**: ✅ CLARIFICACIÓN COMPLETA

---

## 🎯 Resumen Ejecutivo

Bold aclaró que hay **DOS APIs diferentes** para pagos en línea:

1. **API de Pagos**: Ustedes capturan los datos de tarjeta (NO devuelve URL)
2. **API Link de Pagos**: Bold captura los datos (SÍ devuelve URL) ← **ESTO ES LO QUE NECESITAMOS**

---

## 📋 Respuesta de Bold (Julieth)

### 1. ¿La URL que construimos es correcta?

**Respuesta de Bold**:
> Si están integrando el API de pagos https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea **NO deben construir ninguna URL**, internamente deben tener un formulario en donde se soliciten los datos de tarjeta (aplica para PSE, nequi, etc) a sus clientes y realizar el intento de pago.

**Conclusión**: Estábamos usando la API incorrecta.

---

### 2. ¿Bold devuelve una URL de checkout?

**Respuesta de Bold**:
> Para el **API de pagos NO se devuelve una URL** para el checkout, en este caso, del lado de ustedes deben realizar la captura de datos a sus clientes para realizar el pago mediante API.
>
> Si necesitan que se genere una **URL de checkout** y que **Bold capture esos datos**, entonces, se debe revisar la documentación de **API link de pagos**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos

**Conclusión**: Necesitamos usar "API Link de Pagos", NO "API de Pagos".

---

### 3. ¿Necesitamos activar algo en el dashboard?

**Respuesta de Bold**:
> No es necesario, por lo que vemos tienen las llaves activas, para aclarar:
> - Si requieren **API de pagos** deben seguir usando las **llaves de API de pagos**
> - Si requieren **API Link de pagos** deben usar las **llaves de Botón de pagos** que se encuentran en el **Panel de bold**

**Conclusión**: Necesitamos obtener las "llaves de Botón de pagos" del panel de Bold.

---

### 4. ¿Las credenciales actuales tienen acceso completo?

**Respuesta de Bold**:
> Si, las credenciales actuales tienen acceso completo

**Conclusión**: Las credenciales actuales son para "API de Pagos", necesitamos las de "Botón de Pagos".

---

## 🔍 Diferencias Entre las Dos APIs

| Aspecto | API de Pagos | API Link de Pagos |
|---------|--------------|-------------------|
| **Documentación** | https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea | https://developers.bold.co/pagos-en-linea/api-link-de-pagos |
| **URL Base** | `https://api.online.payments.bold.co` | `https://integrations.api.bold.co` |
| **Endpoint** | `POST /v1/payment-intent` | `POST /online/link/v1` |
| **Captura de Datos** | ❌ Ustedes capturan (formulario propio) | ✅ Bold captura (checkout de Bold) |
| **Devuelve URL** | ❌ NO | ✅ SÍ |
| **Llaves** | Llaves de API de Pagos | Llaves de Botón de Pagos |
| **Ubicación Llaves** | Panel → API de Pagos | Panel → Botón de Pagos |
| **Requiere Formulario** | ✅ SÍ (ustedes lo crean) | ❌ NO (Bold lo provee) |
| **Complejidad** | Alta (PCI compliance) | Baja (Bold maneja seguridad) |
| **Mejor Para** | Integración profunda | Integración rápida |

---

## ✅ Solución Correcta: API Link de Pagos

### Documentación Oficial:
https://developers.bold.co/pagos-en-linea/api-link-de-pagos

### URL Base:
```
https://integrations.api.bold.co
```

### Endpoint para Crear Link:
```
POST /online/link/v1
```

### Header de Autenticación:
```
Authorization: x-api-key <llave_de_identidad_boton_pagos>
```

### Request Example:
```json
{
  "amount_type": "CLOSE",
  "amount": {
    "currency": "COP",
    "total_amount": 100000,
    "taxes": [],
    "tip_amount": 0
  },
  "reference": "INV-202603-5324-1234567890",
  "description": "Factura INV-202603-5324",
  "callback_url": "https://demo-estetica.archivoenlinea.com/...",
  "payer_email": "cliente@email.com"
}
```

### Response Example:
```json
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
  },
  "errors": []
}
```

### Endpoint para Consultar Estado:
```
GET /online/link/v1/{payment_link}
```

---

## 🚀 Próximos Pasos

### Paso 1: Obtener Llaves de "Botón de Pagos" (URGENTE)

1. **Entrar al Panel de Bold**:
   - URL: https://panel.bold.co (o similar)
   - Iniciar sesión

2. **Buscar sección "Botón de Pagos"**:
   - Puede estar en "Integraciones" o "API"
   - Buscar específicamente "Botón de Pagos" o "Payment Button"

3. **Copiar las llaves**:
   - Llave de identidad (API Key)
   - Llave secreta (si aplica)

4. **Anotar las llaves**:
   ```
   BOLD_BUTTON_API_KEY=<llave_de_identidad_boton_pagos>
   BOLD_BUTTON_SECRET_KEY=<llave_secreta_boton_pagos> (si aplica)
   ```

---

### Paso 2: Actualizar Código (Una vez tengas las llaves)

Necesitamos actualizar:

1. **Variables de entorno** (`.env`):
   ```bash
   # Cambiar URL base
   BOLD_API_URL=https://integrations.api.bold.co
   
   # Actualizar llaves (con las de "Botón de Pagos")
   BOLD_API_KEY=<llave_de_identidad_boton_pagos>
   BOLD_SECRET_KEY=<llave_secreta_boton_pagos>
   ```

2. **Código** (`bold.service.ts`):
   - Cambiar endpoint de `/v1/payment-intent` a `/online/link/v1`
   - Actualizar estructura del request
   - Actualizar manejo de response (leer `payload.url`)

---

### Paso 3: Probar Localmente

```bash
cd backend
node test-bold-api-link-pagos.js
```

**Resultado esperado**:
```
✅ Link de pago creado
   Payment Link ID: LNK_H7S4xxx
   URL: https://checkout.bold.co/LNK_H7S4xxx
```

---

### Paso 4: Desplegar a Producción

Una vez confirmado que funciona localmente, desplegar.

---

## 📊 Comparación: Lo que Teníamos vs Lo que Necesitamos

### Lo que Teníamos (v73.5 - INCORRECTO):
```typescript
// URL Base
https://api.online.payments.bold.co

// Endpoint
POST /v1/payment-intent

// Llaves
Llaves de "API de Pagos"

// Response
{
  "payload": {
    "reference_id": "...",
    "status": "PENDING"
    // ❌ NO devuelve URL
  }
}

// Problema
No devuelve URL de checkout
```

### Lo que Necesitamos (v74.0 - CORRECTO):
```typescript
// URL Base
https://integrations.api.bold.co

// Endpoint
POST /online/link/v1

// Llaves
Llaves de "Botón de Pagos"

// Response
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
    // ✅ SÍ devuelve URL
  }
}

// Solución
Devuelve URL de checkout lista para usar
```

---

## 🎯 Flujo Completo (Una vez implementado)

### 1. Usuario hace clic en "Pagar Factura"
```
Frontend → Backend: POST /api/invoices/:id/payment-link
```

### 2. Backend crea link en Bold
```typescript
POST https://integrations.api.bold.co/online/link/v1
{
  "amount_type": "CLOSE",
  "amount": { "currency": "COP", "total_amount": 100000 },
  "reference": "INV-202603-5324-1234567890",
  "description": "Factura INV-202603-5324",
  "callback_url": "https://demo-estetica.archivoenlinea.com/...",
  "payer_email": "cliente@email.com"
}
```

### 3. Bold responde con URL
```json
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
  }
}
```

### 4. Backend guarda URL en BD
```typescript
invoice.boldPaymentLink = response.data.payload.url;
// URL: https://checkout.bold.co/LNK_H7S4xxx
```

### 5. Usuario es redirigido a Bold
- URL: `https://checkout.bold.co/LNK_H7S4xxx`
- Página de pago segura de Bold
- Bold captura los datos de tarjeta/PSE/Nequi
- Usuario completa el pago

### 6. Bold redirige a callback_url
```
https://demo-estetica.archivoenlinea.com/invoices/:id/payment-success
```

### 7. Bold envía webhook
```json
{
  "event": "PAYMENT_APPROVED",
  "transaction": {
    "id": "TXN123456",
    "reference": "INV-202603-5324-1234567890",
    "status": "APPROVED"
  }
}
```

### 8. Backend procesa webhook
- Busca factura por referencia
- Marca como pagada
- Activa tenant si estaba suspendido
- Envía email de confirmación

---

## ✅ Ventajas de API Link de Pagos

1. ✅ **Más simple**: No necesitas crear formulario de pago
2. ✅ **Más seguro**: Bold maneja los datos sensibles (PCI compliance)
3. ✅ **Devuelve URL**: Lista para redirigir al usuario
4. ✅ **Checkout completo**: Con todos los métodos de pago
5. ✅ **Menos código**: No necesitas integrar cada método de pago
6. ✅ **Mantenimiento**: Bold actualiza el checkout automáticamente

---

## 📚 Documentación Oficial

### API Link de Pagos (LO QUE NECESITAMOS):
- **URL**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
- **Descripción**: Bold captura los datos, devuelve URL de checkout
- **Llaves**: Botón de Pagos (en el panel)

### API de Pagos (LO QUE TENÍAMOS):
- **URL**: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea
- **Descripción**: Ustedes capturan los datos, NO devuelve URL
- **Llaves**: API de Pagos (en el panel)

---

## 🎉 Conclusión

La respuesta de Bold fue muy clara:

1. ✅ Estábamos usando la API incorrecta ("API de Pagos")
2. ✅ Necesitamos usar "API Link de Pagos"
3. ✅ Necesitamos obtener las "llaves de Botón de Pagos" del panel
4. ✅ La documentación oficial está en: https://developers.bold.co/pagos-en-linea/api-link-de-pagos

**Próxima acción**: Entrar al panel de Bold y obtener las llaves de "Botón de Pagos".

---

**Última actualización**: 26 de Marzo 2026  
**Estado**: ✅ CLARIFICACIÓN COMPLETA - ESPERANDO LLAVES DE BOTÓN DE PAGOS
