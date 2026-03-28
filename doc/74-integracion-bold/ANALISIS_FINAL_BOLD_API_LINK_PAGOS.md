# 🎯 Análisis Final: Bold API Link de Pagos vs Implementación Actual

**Fecha**: 25 de Marzo 2026  
**Estado**: ✅ DOCUMENTACIÓN COMPLETA ENCONTRADA

---

## ✅ DOCUMENTACIÓN OFICIAL ENCONTRADA

**URL**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos

Esta es la API correcta que necesitas. NO requiere datáfono.

---

## 📚 Especificaciones de la API Oficial

### URL Base:
```
https://integrations.api.bold.co
```

### Autenticación:
```
Authorization: x-api-key <llave_de_identidad>
```

### Endpoint para Crear Link de Pago:
```
POST /online/link/v1
```

### Request Body (Mínimo):
```json
{
  "amount_type": "CLOSE",
  "amount": {
    "currency": "COP",
    "total_amount": 100000,
    "taxes": [],
    "tip_amount": 0
  },
  "description": "Factura INV-202603-5324",
  "reference": "INV-202603-5324-1234567890",
  "callback_url": "https://demo-estetica.archivoenlinea.com/invoices/xxx/payment-success"
}
```

### Response Esperado:
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

## 🔍 Comparación con Implementación Actual

### ❌ v73.3 - INCORRECTO

**URL Base**:
```typescript
https://api.online.payments.bold.co  // ❌ INCORRECTA
```

**Endpoint**:
```typescript
POST /v1/payment-intent  // ❌ NO EXISTE
```

**Problemas**:
1. URL base incorrecta
2. Endpoint no documentado
3. Estructura de request diferente
4. No devuelve URL de checkout

### ❌ v73.4 - INCORRECTO

**Implementación**:
```typescript
// Genera URL de Wompi (servicio DIFERENTE)
https://checkout.wompi.co/p/?public-key=xxx&...
```

**Problemas**:
1. Usa Wompi en lugar de Bold
2. Las credenciales de Bold no funcionan en Wompi
3. Servicios completamente diferentes

---

## ✅ Implementación CORRECTA Requerida

### Cambios en `bold.service.ts`:

#### 1. URL Base (CAMBIAR)
```typescript
// ❌ ACTUAL (INCORRECTO)
const apiUrl = 'https://api.online.payments.bold.co';

// ✅ CORRECTO
const apiUrl = 'https://integrations.api.bold.co';
```

#### 2. Método `createPaymentLink` (REESCRIBIR COMPLETO)

**ACTUAL (v73.4 - INCORRECTO)**:
```typescript
async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
  // Genera URL de Wompi (INCORRECTO)
  const checkoutUrl = new URL('https://checkout.wompi.co/p/');
  checkoutUrl.searchParams.append('public-key', this.apiKey);
  // ...
}
```

**CORRECTO (según documentación oficial)**:
```typescript
async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
  try {
    this.logger.log(`Creando link de pago Bold para: ${data.reference}`);

    // Preparar payload según documentación oficial
    const payload = {
      amount_type: 'CLOSE', // Monto cerrado (definido por el comerciante)
      amount: {
        currency: data.currency || 'COP',
        total_amount: Math.round(data.amount), // En pesos, NO centavos
        taxes: [], // Opcional: agregar impuestos si es necesario
        tip_amount: 0
      },
      description: data.description,
      reference: data.reference, // Referencia única
      callback_url: data.redirectUrl, // URL de retorno
      payer_email: data.customerEmail, // Email del pagador (opcional)
      // payment_methods: ['CREDIT_CARD', 'PSE', 'NEQUI', 'BOTON_BANCOLOMBIA'] // Opcional
    };

    this.logger.log(`Request payload:`, JSON.stringify(payload, null, 2));

    // Llamar al endpoint correcto
    const response = await this.apiClient.post('/online/link/v1', payload);

    this.logger.log(`✅ Link de pago creado exitosamente`);
    this.logger.log(`   Payment Link ID: ${response.data.payload.payment_link}`);
    this.logger.log(`   URL: ${response.data.payload.url}`);

    return {
      id: response.data.payload.payment_link, // LNK_xxx
      url: response.data.payload.url, // https://checkout.bold.co/LNK_xxx
      reference: data.reference,
      amount: data.amount,
      status: 'PENDING',
      createdAt: new Date(),
    };
  } catch (error) {
    this.logger.error(`❌ Error al crear link de pago:`, error.response?.data || error.message);
    throw new BadRequestException(
      `Error al crear link de pago: ${error.response?.data?.message || error.message}`
    );
  }
}
```

#### 3. Método `getPaymentStatus` (ACTUALIZAR)

**ACTUAL**:
```typescript
const response = await this.apiClient.get(`/v1/transactions/${transactionId}`);
```

**CORRECTO**:
```typescript
async getPaymentStatus(paymentLinkId: string): Promise<any> {
  try {
    this.logger.log(`Consultando estado de link de pago: ${paymentLinkId}`);

    // Endpoint correcto según documentación
    const response = await this.apiClient.get(`/online/link/v1/${paymentLinkId}`);

    this.logger.log(`Estado del link: ${response.data.status}`);

    return {
      id: response.data.id,
      reference: response.data.reference,
      amount: response.data.total,
      status: response.data.status, // ACTIVE, PROCESSING, PAID, REJECTED, CANCELLED, EXPIRED
      paymentMethod: response.data.payment_method,
      transactionId: response.data.transaction_id,
      createdAt: new Date(response.data.creation_date / 1000000), // Convertir de nanosegundos
      expirationDate: response.data.expiration_date ? new Date(response.data.expiration_date / 1000000) : null,
    };
  } catch (error) {
    this.logger.error(`❌ Error al consultar estado:`, error.response?.data || error.message);
    throw new BadRequestException(
      `Error al consultar estado: ${error.response?.data?.message || error.message}`
    );
  }
}
```

---

## 📋 Cambios Necesarios - Resumen

### 1. Variables de Entorno (`.env`)
```bash
# ❌ ACTUAL (INCORRECTO)
BOLD_API_URL=https://api.online.payments.bold.co

# ✅ CORRECTO
BOLD_API_URL=https://integrations.api.bold.co
```

### 2. `bold.service.ts` - Constructor
```typescript
// ✅ Ya está correcto (no cambiar)
this.apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `x-api-key ${this.apiKey}`,
  },
  timeout: 30000,
});
```

### 3. `bold.service.ts` - Método `createPaymentLink`
- ❌ ELIMINAR: Todo el código de Wompi
- ✅ IMPLEMENTAR: Código según documentación oficial (ver arriba)

### 4. `bold.service.ts` - Método `getPaymentStatus`
- ❌ CAMBIAR: Endpoint `/v1/transactions/${id}`
- ✅ USAR: Endpoint `/online/link/v1/${paymentLinkId}`

### 5. `bold.service.ts` - Método `cancelPaymentLink`
- ❌ ELIMINAR: Endpoint `/v1/payment-intent/${id}`
- ⚠️ NOTA: La documentación NO menciona endpoint para cancelar links

### 6. `bold.service.ts` - Método `testConnection`
- ❌ CAMBIAR: Endpoint `/v1/payment-intent`
- ✅ USAR: Endpoint `/online/link/v1/payment_methods` (para verificar conexión)

---

## 🎯 Estados del Link de Pago

Según la documentación oficial, los estados posibles son:

| Estado | Descripción |
|--------|-------------|
| `ACTIVE` | Link disponible para ser pagado |
| `PROCESSING` | Pago en curso |
| `PAID` | Pago completado exitosamente |
| `REJECTED` | Pago rechazado |
| `CANCELLED` | Pago cancelado o fallido |
| `EXPIRED` | Link vencido |

---

## 🔄 Flujo Completo

### 1. Usuario hace clic en "Pagar Factura"
```
Frontend → Backend: POST /api/invoices/:id/payment-link
```

### 2. Backend crea link de pago en Bold
```typescript
const paymentLink = await this.boldService.createPaymentLink({
  amount: invoice.total,
  currency: 'COP',
  description: `Factura ${invoice.invoiceNumber}`,
  reference: `INV-${invoice.invoiceNumber}-${Date.now()}`,
  customerEmail: invoice.tenant.contactEmail,
  redirectUrl: `${FRONTEND_URL}/invoices/${invoice.id}/payment-success`,
});
```

### 3. Bold responde con URL del checkout
```json
{
  "payload": {
    "payment_link": "LNK_H7S4xxx",
    "url": "https://checkout.bold.co/LNK_H7S4xxx"
  }
}
```

### 4. Backend guarda el link y lo devuelve al frontend
```typescript
invoice.boldPaymentLink = paymentLink.url;
invoice.boldPaymentReference = paymentLink.id;
await this.invoicesRepository.save(invoice);

return paymentLink.url;
```

### 5. Frontend redirige al usuario a Bold
```typescript
window.location.href = paymentLink.url;
```

### 6. Usuario completa el pago en Bold
- Elige método de pago (tarjeta, PSE, Nequi, etc.)
- Completa la transacción
- Bold redirige a `callback_url`

### 7. Bold envía notificación al webhook
```json
{
  "type": "SALE_APPROVED",
  "data": {
    "payment_id": "TXNFD76543",
    "reference": "INV-202603-5324-1234567890",
    "status": "APPROVED"
  }
}
```

### 8. Backend procesa el webhook
```typescript
// Buscar factura por referencia
const invoice = await this.findByReference(reference);

// Marcar como pagada
await this.markAsPaid(invoice.id);

// Activar tenant si estaba suspendido
await this.activateTenantAfterPayment(invoice.tenantId);

// Enviar email de confirmación
await this.sendPaymentConfirmation(invoice.id);
```

---

## ⚠️ Notas Importantes

### 1. Formato de Montos
- ✅ Bold API Link de Pagos usa **pesos** (NO centavos)
- ✅ Ejemplo: $100,000 COP = `100000` (no `10000000`)

### 2. Referencia Única
- ✅ Debe ser alfanumérica con guiones: `[a-zA-Z0-9_-]`
- ✅ Máximo 60 caracteres
- ✅ Recomendado: Incluir timestamp para evitar duplicados
- ✅ Ejemplo: `INV-202603-5324-1774455735607`

### 3. Callback URL
- ✅ Debe ser HTTPS
- ✅ Debe ser del dominio de tu negocio
- ✅ Ejemplo: `https://demo-estetica.archivoenlinea.com/invoices/xxx/payment-success`

### 4. Métodos de Pago
- ✅ Si no especificas, se muestran todos los disponibles
- ✅ Opciones: `CREDIT_CARD`, `PSE`, `BOTON_BANCOLOMBIA`, `NEQUI`

### 5. Webhook
- ✅ Debes configurarlo en el Panel de Comercios de Bold
- ✅ Recibirás notificaciones de: `SALE_APPROVED`, `SALE_REJECTED`, etc.
- ✅ Usa la misma estructura que ya tienes implementada

---

## 📊 Resumen de Cambios

| Componente | Estado Actual | Cambio Requerido |
|------------|---------------|------------------|
| URL Base | `api.online.payments.bold.co` | `integrations.api.bold.co` |
| Endpoint crear | `/v1/payment-intent` | `/online/link/v1` |
| Endpoint consultar | `/v1/transactions/{id}` | `/online/link/v1/{payment_link}` |
| Request body | Estructura incorrecta | Usar estructura oficial |
| Response | No devuelve URL | Devuelve `url` en `payload` |
| Montos | Centavos (incorrecto) | Pesos |
| Autenticación | ✅ Correcta | No cambiar |

---

## ✅ Ventajas de la API Correcta

1. ✅ **NO requiere datáfono** (a diferencia de API Integrations)
2. ✅ **Documentación completa** y pública
3. ✅ **Checkout web** con múltiples métodos de pago
4. ✅ **URL de pago** devuelta en la respuesta
5. ✅ **Webhook** para notificaciones automáticas
6. ✅ **Consulta de estado** en cualquier momento
7. ✅ **Ambiente de pruebas** con llaves de prueba

---

## 🚀 Próximos Pasos

1. ✅ **Actualizar `.env`**: Cambiar URL base
2. ✅ **Reescribir `bold.service.ts`**: Implementar según documentación oficial
3. ✅ **Probar en local**: Crear link de pago de prueba
4. ✅ **Verificar webhook**: Configurar en Panel de Comercios
5. ✅ **Desplegar a producción**: Versión 73.5

---

**Última actualización**: 25 de Marzo 2026  
**Estado**: ✅ LISTO PARA IMPLEMENTAR
