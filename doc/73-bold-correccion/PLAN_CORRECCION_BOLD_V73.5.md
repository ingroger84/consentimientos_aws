# 📋 Plan de Corrección Bold v73.5

**Fecha**: 25 de Marzo 2026  
**Estado**: ⚠️ ESPERANDO AUTORIZACIÓN PARA IMPLEMENTAR

---

## 🎯 Resumen Ejecutivo

He encontrado la documentación oficial completa de Bold Colombia para pagos en línea SIN datáfono:

**API**: Bold API Link de Pagos  
**URL**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos  
**Endpoint**: `POST /online/link/v1`  
**URL Base**: `https://integrations.api.bold.co`

---

## ❌ Problemas Identificados

### v73.3 y v73.4 están INCORRECTAS:

1. **URL base incorrecta**: `api.online.payments.bold.co` → Debe ser `integrations.api.bold.co`
2. **Endpoint incorrecto**: `/v1/payment-intent` → Debe ser `/online/link/v1`
3. **v73.4 usa Wompi**: Servicio completamente diferente a Bold

---

## ✅ Cambios Requeridos

### 1. Archivo `.env` (Backend)

**CAMBIAR**:
```bash
# ❌ ACTUAL
BOLD_API_URL=https://api.online.payments.bold.co

# ✅ CORRECTO
BOLD_API_URL=https://integrations.api.bold.co
```

### 2. Archivo `backend/src/payments/bold.service.ts`

#### Cambio 1: Constructor (URL Base)
**Estado**: ✅ Ya usa variable de entorno, solo actualizar `.env`

#### Cambio 2: Método `createPaymentLink` (REESCRIBIR COMPLETO)

**ELIMINAR** (líneas 67-140 aprox):
```typescript
// TODO EL CÓDIGO DE WOMPI
const checkoutUrl = new URL('https://checkout.wompi.co/p/');
// ...
```

**REEMPLAZAR CON**:
```typescript
async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
  try {
    this.logger.log(`Creando link de pago Bold para: ${data.reference}`);

    // Preparar payload según documentación oficial
    const payload = {
      amount_type: 'CLOSE',
      amount: {
        currency: data.currency || 'COP',
        total_amount: Math.round(data.amount),
        taxes: [],
        tip_amount: 0
      },
      description: data.description,
      reference: data.reference,
      callback_url: data.redirectUrl,
      payer_email: data.customerEmail,
    };

    this.logger.log(`📤 Request a Bold API Link de Pagos:`);
    this.logger.log(JSON.stringify(payload, null, 2));

    // Llamar al endpoint correcto
    const response = await this.apiClient.post('/online/link/v1', payload);

    this.logger.log(`✅ Link de pago creado exitosamente`);
    this.logger.log(`   Payment Link ID: ${response.data.payload.payment_link}`);
    this.logger.log(`   URL: ${response.data.payload.url}`);

    return {
      id: response.data.payload.payment_link,
      url: response.data.payload.url,
      reference: data.reference,
      amount: data.amount,
      status: 'PENDING',
      createdAt: new Date(),
    };
  } catch (error) {
    this.logger.error(`❌ Error al crear link de pago Bold:`, error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      this.logger.error(`   Errores de Bold:`, JSON.stringify(error.response.data.errors, null, 2));
    }
    
    throw new BadRequestException(
      `Error al crear link de pago: ${error.response?.data?.errors?.[0]?.message || error.message}`
    );
  }
}
```

#### Cambio 3: Método `getPaymentStatus` (ACTUALIZAR)

**CAMBIAR**:
```typescript
// ❌ ACTUAL
const response = await this.apiClient.get(`/v1/transactions/${transactionId}`);

// ✅ CORRECTO
const response = await this.apiClient.get(`/online/link/v1/${transactionId}`);
```

**Y actualizar el mapeo de respuesta**:
```typescript
return {
  id: response.data.id,
  reference: response.data.reference,
  amount: response.data.total,
  status: response.data.status, // ACTIVE, PROCESSING, PAID, REJECTED, CANCELLED, EXPIRED
  paymentMethod: response.data.payment_method,
  transactionId: response.data.transaction_id,
  createdAt: new Date(response.data.creation_date / 1000000),
  paidAt: response.data.status === 'PAID' ? new Date() : null,
};
```

#### Cambio 4: Método `cancelPaymentLink` (ELIMINAR O COMENTAR)

**NOTA**: La documentación NO menciona endpoint para cancelar links.

**OPCIÓN 1**: Comentar el método completo  
**OPCIÓN 2**: Lanzar error indicando que no está soportado

```typescript
async cancelPaymentLink(paymentLinkId: string): Promise<void> {
  throw new BadRequestException(
    'La cancelación de links de pago no está soportada por Bold API Link de Pagos'
  );
}
```

#### Cambio 5: Método `testConnection` (ACTUALIZAR)

**CAMBIAR**:
```typescript
// ❌ ACTUAL
await this.apiClient.post('/v1/payment-intent', testPayload);

// ✅ CORRECTO
await this.apiClient.get('/online/link/v1/payment_methods');
```

---

## 📝 Archivos a Modificar

1. ✅ `backend/.env` - Actualizar URL base
2. ✅ `backend/src/payments/bold.service.ts` - Reescribir métodos
3. ✅ `backend/package.json` - Actualizar versión a 73.5.0
4. ✅ `backend/src/config/version.ts` - Actualizar versión a 73.5.0
5. ✅ `frontend/package.json` - Actualizar versión a 73.5.0
6. ✅ `frontend/src/config/version.ts` - Actualizar versión a 73.5.0

---

## 🧪 Plan de Pruebas

### Prueba 1: Crear Link de Pago
```bash
cd backend
node -e "
const axios = require('axios');
axios.post('https://integrations.api.bold.co/online/link/v1', {
  amount_type: 'CLOSE',
  amount: {
    currency: 'COP',
    total_amount: 10000,
    taxes: [],
    tip_amount: 0
  },
  description: 'Prueba de integración',
  reference: 'TEST-' + Date.now(),
  callback_url: 'https://demo-estetica.archivoenlinea.com/test'
}, {
  headers: {
    'Authorization': 'x-api-key ' + process.env.BOLD_API_KEY,
    'Content-Type': 'application/json'
  }
}).then(r => console.log(JSON.stringify(r.data, null, 2)))
  .catch(e => console.error(e.response?.data || e.message));
"
```

### Prueba 2: Consultar Estado
```bash
# Usar el payment_link de la prueba anterior
node -e "
const axios = require('axios');
axios.get('https://integrations.api.bold.co/online/link/v1/LNK_xxx', {
  headers: {
    'Authorization': 'x-api-key ' + process.env.BOLD_API_KEY
  }
}).then(r => console.log(JSON.stringify(r.data, null, 2)))
  .catch(e => console.error(e.response?.data || e.message));
"
```

### Prueba 3: Flujo Completo en la Aplicación
1. Crear una factura de prueba
2. Hacer clic en "Pagar"
3. Verificar que se crea el link en Bold
4. Verificar que se redirige a `https://checkout.bold.co/LNK_xxx`
5. Completar el pago con datos de prueba
6. Verificar que el webhook se recibe
7. Verificar que la factura se marca como pagada

---

## 📊 Comparación Antes/Después

| Aspecto | v73.4 (Actual) | v73.5 (Correcto) |
|---------|----------------|------------------|
| URL Base | `api.online.payments.bold.co` | `integrations.api.bold.co` |
| Endpoint | `/v1/payment-intent` | `/online/link/v1` |
| Servicio | Wompi (incorrecto) | Bold API Link de Pagos |
| Montos | Centavos | Pesos |
| Response | No devuelve URL | Devuelve URL en `payload.url` |
| Documentación | No existe | Completa y oficial |

---

## ⏱️ Estimación de Tiempo

- ✅ Actualizar `.env`: 1 minuto
- ✅ Reescribir `bold.service.ts`: 15 minutos
- ✅ Actualizar versiones: 2 minutos
- ✅ Compilar backend: 2 minutos
- ✅ Probar en local: 10 minutos
- ✅ Desplegar a servidor: 5 minutos
- ✅ Pruebas en producción: 10 minutos

**Total estimado**: 45 minutos

---

## 🚀 Pasos de Implementación

### Paso 1: Backup
```bash
# Hacer backup del archivo actual
cp backend/src/payments/bold.service.ts backend/src/payments/bold.service.ts.v73.4.backup
```

### Paso 2: Actualizar `.env`
```bash
# Editar backend/.env
# Cambiar BOLD_API_URL=https://api.online.payments.bold.co
# Por: BOLD_API_URL=https://integrations.api.bold.co
```

### Paso 3: Actualizar `bold.service.ts`
- Reescribir método `createPaymentLink`
- Actualizar método `getPaymentStatus`
- Actualizar método `testConnection`
- Comentar método `cancelPaymentLink`

### Paso 4: Actualizar Versiones
```bash
# backend/package.json: "version": "73.5.0"
# backend/src/config/version.ts: export const VERSION = '73.5.0'
# frontend/package.json: "version": "73.5.0"
# frontend/src/config/version.ts: export const VERSION = '73.5.0'
```

### Paso 5: Compilar y Probar Local
```bash
cd backend
npm run build
npm run start:dev

# En otra terminal, probar crear link
curl -X POST http://localhost:3000/api/invoices/xxx/payment-link
```

### Paso 6: Desplegar a Servidor
```bash
# Compilar backend
cd backend
npm run build

# Copiar a servidor
scp -r dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Reiniciar PM2
ssh ubuntu@100.28.198.249 "pm2 restart datagree --update-env"
```

### Paso 7: Verificar en Producción
1. Ir a https://demo-estetica.archivoenlinea.com
2. Crear factura de prueba
3. Hacer clic en "Pagar"
4. Verificar redirección a Bold checkout
5. Completar pago con datos de prueba
6. Verificar que factura se marca como pagada

---

## ⚠️ IMPORTANTE: Autorización Requerida

**NO IMPLEMENTARÉ NADA SIN TU AUTORIZACIÓN EXPLÍCITA.**

Por favor confirma:
- [ ] ¿Autorizo implementar los cambios descritos?
- [ ] ¿Quiero revisar el código antes de desplegar?
- [ ] ¿Procedo con el despliegue inmediato o espero?

---

**Última actualización**: 25 de Marzo 2026  
**Estado**: ⚠️ ESPERANDO AUTORIZACIÓN
