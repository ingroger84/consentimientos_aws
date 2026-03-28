# 🔧 Plan de Corrección - Bold API Link de Pagos v74.0

**Fecha**: 26 de Marzo 2026  
**Versión**: 74.0.0  
**Estado**: ⏳ ESPERANDO APROBACIÓN

---

## 🎯 Objetivo

Implementar correctamente la integración con **Bold API Link de Pagos** según la documentación oficial y la respuesta de soporte de Bold.

---

## 📋 Cambios Necesarios

### 1. Variables de Entorno (`.env`)

```bash
# ❌ ACTUAL (API de Pagos)
BOLD_API_URL=https://api.online.payments.bold.co

# ✅ CORRECTO (API Link de Pagos)
BOLD_API_URL=https://integrations.api.bold.co

# ⚠️ IMPORTANTE: Necesitas obtener las llaves de "Botón de Pagos" del panel
# Las llaves actuales son para "API de Pagos" (diferente)
BOLD_API_KEY=<llave_de_identidad_boton_pagos>
BOLD_SECRET_KEY=<llave_secreta_boton_pagos>
```

---

### 2. Código (`bold.service.ts`)

#### Cambio 1: URL Base en Constructor
```typescript
// ❌ ACTUAL
const apiUrl = this.configService.get<string>('BOLD_API_URL') || 'https://api.online.payments.bold.co';

// ✅ CORRECTO
const apiUrl = this.configService.get<string>('BOLD_API_URL') || 'https://integrations.api.bold.co';
```

#### Cambio 2: Método `createPaymentLink`
```typescript
// ❌ ACTUAL - Endpoint incorrecto
const response = await this.apiClient.post('/v1/payment-intent', payload);

// ✅ CORRECTO - Endpoint según documentación oficial
const response = await this.apiClient.post('/online/link/v1', payload);
```

#### Cambio 3: Estructura del Request
```typescript
// ❌ ACTUAL
const payload = {
  reference_id: data.reference,  // ❌ Campo incorrecto
  amount: {
    currency: data.currency || 'COP',
    total_amount: Math.round(data.amount),
  },
  description: data.description,
  callback_url: data.redirectUrl,
  customer: {  // ❌ Campo no existe en API Link de Pagos
    name: data.customerName || 'Cliente',
    email: data.customerEmail,
  },
};

// ✅ CORRECTO - Según documentación oficial
const payload = {
  amount_type: 'CLOSE',  // ✅ Monto cerrado (comerciante define el monto)
  amount: {
    currency: data.currency || 'COP',
    total_amount: Math.round(data.amount),
    taxes: [],  // ✅ Array de impuestos (vacío si no aplica)
    tip_amount: 0,  // ✅ Propina (0 si no aplica)
  },
  reference: data.reference,  // ✅ Campo correcto (sin "_id")
  description: data.description,
  callback_url: data.redirectUrl,
  payer_email: data.customerEmail,  // ✅ Campo correcto (no "customer")
};
```

#### Cambio 4: Manejo de Response
```typescript
// ❌ ACTUAL - Construye URL manualmente
const paymentData = response.data.payload || response.data;
const checkoutUrl = `https://checkout.bold.co/payment/${paymentData.reference_id}`;

// ✅ CORRECTO - Usa URL devuelta por Bold
const paymentData = response.data.payload;
const checkoutUrl = paymentData.url;  // Bold devuelve la URL lista
const paymentLinkId = paymentData.payment_link;  // ID del link (LNK_xxx)
```

#### Cambio 5: Método `getPaymentStatus`
```typescript
// ❌ ACTUAL
const response = await this.apiClient.get(`/v1/transactions/${transactionId}`);

// ✅ CORRECTO - Consultar por payment_link
const response = await this.apiClient.get(`/online/link/v1/${paymentLinkId}`);
```

#### Cambio 6: Método `testConnection`
```typescript
// ❌ ACTUAL
await this.apiClient.post('/v1/payment-intent', testPayload);

// ✅ CORRECTO - Consultar métodos de pago disponibles
const response = await this.apiClient.get('/online/link/v1/payment_methods');
```

---

### 3. Versiones

```json
// backend/package.json
{
  "version": "74.0.0"
}

// backend/src/config/version.ts
export const VERSION = '74.0.0';

// frontend/package.json
{
  "version": "74.0.0"
}

// frontend/src/config/version.ts
export const VERSION = '74.0.0';
```

---

## 📊 Comparación Detallada

### URL Base:
| Versión | URL Base | Estado |
|---------|----------|--------|
| v73.5 | `https://api.online.payments.bold.co` | ❌ Incorrecto |
| v74.0 | `https://integrations.api.bold.co` | ✅ Correcto |

### Endpoint Crear Link:
| Versión | Endpoint | Estado |
|---------|----------|--------|
| v73.5 | `POST /v1/payment-intent` | ❌ Incorrecto |
| v74.0 | `POST /online/link/v1` | ✅ Correcto |

### Estructura Request:
| Campo | v73.5 | v74.0 | Estado |
|-------|-------|-------|--------|
| Tipo de monto | ❌ No existe | ✅ `amount_type: "CLOSE"` | Requerido |
| Referencia | `reference_id` | `reference` | Cambiar |
| Cliente | `customer: { name, email }` | `payer_email` | Cambiar |
| Impuestos | ❌ No existe | ✅ `taxes: []` | Agregar |
| Propina | ❌ No existe | ✅ `tip_amount: 0` | Agregar |

### Response:
| Campo | v73.5 | v74.0 | Estado |
|-------|-------|-------|--------|
| URL | ❌ No devuelve | ✅ `payload.url` | Usar |
| Link ID | ❌ No devuelve | ✅ `payload.payment_link` | Guardar |

---

## 🔑 Llaves Requeridas

### Llaves Actuales (API de Pagos):
```
BOLD_API_KEY=1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
BOLD_SECRET_KEY=KVwpsp4WlWny3apOYoGWvg
```
**Ubicación en Panel**: API de Pagos  
**Sirven para**: API de Pagos (captura manual de datos)  
**Estado**: ✅ Válidas pero para API incorrecta

### Llaves Necesarias (Botón de Pagos):
```
BOLD_API_KEY=<llave_de_identidad_boton_pagos>
BOLD_SECRET_KEY=<llave_secreta_boton_pagos>
```
**Ubicación en Panel**: Botón de Pagos  
**Sirven para**: API Link de Pagos (checkout de Bold)  
**Estado**: ⏳ Pendiente de obtener

---

## 📝 Checklist de Implementación

### Antes de Modificar Código:
- [ ] Entrar al panel de Bold
- [ ] Buscar sección "Botón de Pagos"
- [ ] Copiar llave de identidad
- [ ] Copiar llave secreta (si aplica)
- [ ] Anotar las llaves en lugar seguro
- [ ] Confirmar que son las llaves correctas

### Modificar Código:
- [ ] Actualizar `.env` con URL base correcta
- [ ] Actualizar `.env` con llaves de Botón de Pagos
- [ ] Actualizar `bold.service.ts` - URL base
- [ ] Actualizar `bold.service.ts` - Endpoint crear link
- [ ] Actualizar `bold.service.ts` - Estructura request
- [ ] Actualizar `bold.service.ts` - Manejo response
- [ ] Actualizar `bold.service.ts` - Método getPaymentStatus
- [ ] Actualizar `bold.service.ts` - Método testConnection
- [ ] Actualizar versiones a 74.0.0
- [ ] Compilar backend

### Probar:
- [ ] Probar localmente con script de prueba
- [ ] Verificar que devuelve URL válida
- [ ] Verificar que URL abre checkout de Bold
- [ ] Verificar métodos de pago disponibles

### Desplegar:
- [ ] Actualizar `.env` en servidor
- [ ] Copiar backend compilado a servidor
- [ ] Reiniciar PM2
- [ ] Verificar logs
- [ ] Probar en producción

---

## 🎯 Resumen

**Problema identificado**: Estábamos usando "API de Pagos" en lugar de "API Link de Pagos"

**Solución**: Cambiar a "API Link de Pagos" con las llaves correctas

**Acción inmediata**: Obtener llaves de "Botón de Pagos" del panel de Bold

**Tiempo estimado**: 1-2 horas (una vez tengas las llaves)

---

**Última actualización**: 26 de Marzo 2026  
**Estado**: ⏳ ESPERANDO LLAVES DE BOTÓN DE PAGOS
