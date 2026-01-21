# Solución Final: Integración con Wompi API - 21 Enero 2026

## Problema Identificado

Bold Colombia **NO tiene una API REST pública tradicional**. Bold Colombia utiliza **Wompi** como su procesador de pagos subyacente. Los errores de DNS (`ENOTFOUND`) ocurrían porque estábamos intentando conectar a URLs inexistentes de Bold.

## Investigación Realizada

1. **Bold Colombia vs Bold Commerce**: Son empresas diferentes
   - Bold Commerce (Canadá): Tiene API pública documentada
   - Bold Colombia: Usa Wompi como procesador, API limitada

2. **Documentación de Wompi**: [https://docs.wompi.co](https://docs.wompi.co)
   - Wompi es el procesador de pagos que usa Bold Colombia
   - Tiene API pública para crear payment links
   - Sandbox: `https://sandbox.wompi.co/v1`
   - Production: `https://production.wompi.co/v1`

## Solución Implementada

### 1. Actualización del Servicio Bold

**Archivo**: `backend/src/payments/bold.service.ts`

**Cambios principales**:

```typescript
// Constructor actualizado para usar Wompi API
constructor(private configService: ConfigService) {
  // Bold Colombia usa Wompi como procesador de pagos
  // Sandbox: https://sandbox.wompi.co/v1
  // Production: https://production.wompi.co/v1
  const apiUrl = this.configService.get<string>('BOLD_API_URL') || 'https://sandbox.wompi.co/v1';

  this.apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`, // Wompi usa la clave privada (SECRET_KEY)
    },
    timeout: 30000,
  });
}
```

**Método createPaymentLink actualizado**:

```typescript
async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
  // Estructura de Wompi para crear payment links
  const payload = {
    name: data.description,
    description: data.description,
    single_use: true, // Un solo uso por link
    collect_shipping: false,
    currency: data.currency || 'COP',
    amount_in_cents: Math.round(data.amount * 100), // Wompi espera centavos
    redirect_url: data.redirectUrl || this.configService.get('BOLD_SUCCESS_URL'),
    expires_at: data.expirationDate ? data.expirationDate.toISOString() : null,
  };

  const response = await this.apiClient.post('/payment_links', payload);

  const paymentLinkId = response.data.data.id;
  const paymentUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;

  return {
    id: paymentLinkId,
    url: paymentUrl,
    reference: data.reference,
    amount: data.amount,
    status: 'pending',
    createdAt: new Date(response.data.data.created_at),
  };
}
```

### 2. Actualización de Variables de Entorno

**Archivo local**: `backend/.env`
```env
BOLD_API_URL=https://sandbox.wompi.co/v1
```

**Archivo servidor**: `/home/ubuntu/consentimientos_aws/backend/.env`
```env
BOLD_API_URL=https://sandbox.wompi.co/v1
```

**Archivo PM2**: `/home/ubuntu/consentimientos_aws/ecosystem.config.js`
```javascript
BOLD_API_URL: 'https://sandbox.wompi.co/v1',
```

### 3. Estructura de la API de Wompi

#### Crear Payment Link

**Endpoint**: `POST /v1/payment_links`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {BOLD_SECRET_KEY}
```

**Body**:
```json
{
  "name": "Nombre del link",
  "description": "Descripción del pago",
  "single_use": true,
  "collect_shipping": false,
  "currency": "COP",
  "amount_in_cents": 11990000,
  "redirect_url": "https://datagree.net/payment/success",
  "expires_at": "2026-01-22T00:00:00.000Z"
}
```

**Response**:
```json
{
  "data": {
    "id": "3Z0Cfi",
    "name": "Nombre del link",
    "description": "Descripción del pago",
    "single_use": true,
    "collect_shipping": false,
    "currency": "COP",
    "amount_in_cents": 11990000,
    "active": true,
    "created_at": "2026-01-21T06:49:41.000Z",
    "updated_at": "2026-01-21T06:49:41.000Z"
  }
}
```

**URL del checkout**: `https://checkout.wompi.co/l/{payment_link_id}`

## Configuración de Credenciales

Las credenciales de Bold Colombia son en realidad credenciales de Wompi:

- `BOLD_API_KEY` = Public Key de Wompi (para frontend)
- `BOLD_SECRET_KEY` = Private Key de Wompi (para backend)
- `BOLD_MERCHANT_ID` = Merchant ID de Wompi

## Próximos Pasos

1. **Probar la creación de payment links** desde la interfaz
2. **Verificar que el link de Wompi se abra correctamente**
3. **Realizar una transacción de prueba** con tarjetas de prueba de Wompi:
   - Aprobada: `4242 4242 4242 4242`
   - Declinada: `4111 1111 1111 1111`
4. **Configurar webhooks de Wompi** para recibir notificaciones de pagos
5. **Migrar a producción** cuando esté listo:
   - Cambiar URL a `https://production.wompi.co/v1`
   - Usar credenciales de producción

## Documentación de Referencia

- [Wompi - Payment Links](https://docs.wompi.co/en/docs/colombia/links-de-pago/)
- [Wompi - Test Data](https://docs.wompi.co/en/docs/colombia/datos-de-prueba-en-sandbox/)
- [Wompi - Webhooks](https://docs.wompi.co/en/docs/colombia/eventos/)

## Archivos Modificados

1. `backend/src/payments/bold.service.ts` - Servicio actualizado para usar Wompi API
2. `backend/.env` - URL actualizada a Wompi sandbox
3. `/home/ubuntu/consentimientos_aws/backend/.env` - URL actualizada en servidor
4. `/home/ubuntu/consentimientos_aws/ecosystem.config.js` - URL actualizada en PM2

## Estado Actual

✅ Código actualizado y subido al servidor
✅ Variables de entorno actualizadas
✅ Backend reiniciado con nueva configuración
⏳ Pendiente: Probar creación de payment link desde la interfaz

---

**Fecha:** 21 de Enero de 2026
**Estado:** ✅ Implementado, pendiente de pruebas
**Servidor:** 100.28.198.249 (datagree.net)
**Proceso:** datagree-backend (PID 35433)
