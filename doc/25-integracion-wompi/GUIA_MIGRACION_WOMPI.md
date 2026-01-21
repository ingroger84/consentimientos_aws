# Guía de Migración a Wompi - 21 Enero 2026

## 🎯 ¿Por qué Wompi?

Wompi es el gateway de pagos más completo en Colombia con:

- ✅ API REST completa y documentada
- ✅ Payment links programáticos
- ✅ Webhooks para notificaciones
- ✅ Sandbox para pruebas
- ✅ Tarjetas de prueba
- ✅ Soporte para PSE, Nequi, Bancolombia, tarjetas

## 📚 Documentación Oficial

- **Docs:** https://docs.wompi.co/en/docs/colombia/links-de-pago
- **Panel:** https://comercios.wompi.co/
- **Soporte:** soporte@wompi.co

## 🔑 Credenciales

### Sandbox (Pruebas)

```env
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_EVENTS_SECRET=test_events_xxxxx
```

### Producción

```env
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_API_URL=https://production.wompi.co/v1
WOMPI_EVENTS_SECRET=prod_events_xxxxx
```

## 🛠️ Implementación

### 1. Crear Payment Link

**Endpoint:** `POST https://sandbox.wompi.co/v1/payment_links`

**Headers:**
```
Authorization: Bearer prv_test_xxxxx
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Factura INV-202601-001",
  "description": "Pago de factura mensual - Demo Estetica",
  "single_use": true,
  "collect_shipping": false,
  "currency": "COP",
  "amount_in_cents": 11990000,
  "redirect_url": "https://datagree.net/invoices/xxx/payment-success",
  "expires_at": "2026-02-21T23:59:59Z"
}
```

**Respuesta:**
```json
{
  "data": {
    "id": "12345",
    "created_at": "2026-01-21T10:00:00.000Z",
    "name": "Factura INV-202601-001",
    "description": "Pago de factura mensual - Demo Estetica",
    "single_use": true,
    "collect_shipping": false,
    "currency": "COP",
    "amount_in_cents": 11990000,
    "expires_at": "2026-02-21T23:59:59Z",
    "redirect_url": "https://datagree.net/invoices/xxx/payment-success",
    "url": "https://checkout.wompi.co/l/12345",
    "active": true
  }
}
```

### 2. Código del Servicio

```typescript
// backend/src/payments/wompi.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface WompiPaymentLinkData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  redirectUrl?: string;
  expirationDate?: Date;
}

export interface WompiPaymentLink {
  id: string;
  url: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: Date;
}

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly apiClient: AxiosInstance;
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly eventsSecret: string;

  constructor(private configService: ConfigService) {
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY');
    this.eventsSecret = this.configService.get<string>('WOMPI_EVENTS_SECRET');

    const apiUrl = this.configService.get<string>('WOMPI_API_URL') || 'https://sandbox.wompi.co/v1';

    this.apiClient = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.privateKey}`,
      },
      timeout: 30000,
    });

    this.logger.log(`✅ Wompi Service inicializado`);
    this.logger.log(`   API URL: ${apiUrl}`);
    this.logger.log(`   Public Key: ${this.publicKey?.substring(0, 20)}...`);
  }

  /**
   * Crear un link de pago en Wompi
   */
  async createPaymentLink(data: WompiPaymentLinkData): Promise<WompiPaymentLink> {
    try {
      this.logger.log(`Creando payment link en Wompi para: ${data.reference}`);

      const payload = {
        name: `Factura ${data.reference}`,
        description: data.description,
        single_use: true,
        collect_shipping: false,
        currency: data.currency || 'COP',
        amount_in_cents: Math.round(data.amount * 100), // Wompi usa centavos
        redirect_url: data.redirectUrl || this.configService.get('WOMPI_SUCCESS_URL'),
        expires_at: data.expirationDate?.toISOString() || this.getDefaultExpiration(),
      };

      this.logger.log(`Payload para Wompi:`, JSON.stringify(payload, null, 2));

      const response = await this.apiClient.post('/payment_links', payload);

      const paymentLink = response.data.data;

      this.logger.log(`✅ Payment link creado: ${paymentLink.id}`);
      this.logger.log(`   URL: ${paymentLink.url}`);

      return {
        id: paymentLink.id,
        url: paymentLink.url,
        reference: data.reference,
        amount: data.amount,
        status: paymentLink.active ? 'ACTIVE' : 'INACTIVE',
        createdAt: new Date(paymentLink.created_at),
      };
    } catch (error) {
      this.logger.error(`❌ Error al crear payment link en Wompi:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al crear payment link: ${error.response?.data?.error?.reason || error.message}`
      );
    }
  }

  /**
   * Validar firma de webhook
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.eventsSecret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error(`❌ Error al validar firma de webhook:`, error);
      return false;
    }
  }

  /**
   * Obtener fecha de expiración por defecto (30 días)
   */
  private getDefaultExpiration(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  /**
   * Verificar si Wompi está configurado
   */
  isConfigured(): boolean {
    return !!(this.privateKey && this.publicKey && this.eventsSecret);
  }
}
```

### 3. Actualizar .env

```env
# Wompi Payment Gateway - SANDBOX
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_EVENTS_SECRET=test_events_xxxxx
WOMPI_SUCCESS_URL=https://datagree.net/payment/success
WOMPI_FAILURE_URL=https://datagree.net/payment/failure
WOMPI_WEBHOOK_URL=https://datagree.net/api/webhooks/wompi
```

### 4. Registrar Servicio en Module

```typescript
// backend/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { PaymentsController } from './payments.controller';

@Module({
  providers: [WompiService],
  controllers: [PaymentsController],
  exports: [WompiService],
})
export class PaymentsModule {}
```

## 🧪 TARJETAS DE PRUEBA

### Visa - Aprobada

```
Número: 4242424242424242
Mes: 12
Año: 2030
CVV: 123
Cuotas: 1
```

### Mastercard - Rechazada

```
Número: 5555555555554444
Mes: 12
Año: 2030
CVV: 123
Cuotas: 1
```

## 🔔 WEBHOOKS

Wompi envía notificaciones a tu webhook cuando:

- ✅ Pago aprobado
- ❌ Pago rechazado
- ⏳ Pago pendiente
- 🔄 Pago en proceso

**Endpoint:** `POST https://datagree.net/api/webhooks/wompi`

**Payload:**
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "12345-1234-1234-1234-123456789012",
      "amount_in_cents": 11990000,
      "reference": "INV-202601-001",
      "customer_email": "cliente@example.com",
      "currency": "COP",
      "payment_method_type": "CARD",
      "redirect_url": "https://datagree.net/payment/success",
      "status": "APPROVED",
      "shipping_address": null,
      "payment_link_id": "12345",
      "payment_source_id": null
    }
  },
  "sent_at": "2026-01-21T10:00:00.000Z",
  "timestamp": 1737453600,
  "signature": {
    "checksum": "abc123...",
    "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
  }
}
```

## 📋 CHECKLIST DE MIGRACIÓN

- [ ] Crear cuenta en Wompi (sandbox)
- [ ] Obtener credenciales de prueba
- [ ] Crear `wompi.service.ts`
- [ ] Actualizar `.env` con credenciales
- [ ] Registrar servicio en module
- [ ] Actualizar `invoices.service.ts` para usar Wompi
- [ ] Probar creación de payment link
- [ ] Probar pago con tarjeta de prueba
- [ ] Configurar webhook
- [ ] Probar notificaciones de webhook
- [ ] Migrar a producción

## 🚀 VENTAJAS DE WOMPI

1. **API Completa:** Todo lo que necesitas está documentado
2. **Sandbox:** Pruebas ilimitadas sin costo
3. **Webhooks:** Notificaciones automáticas de pagos
4. **Múltiples métodos:** Tarjetas, PSE, Nequi, Bancolombia
5. **Soporte:** Respuesta rápida y en español
6. **Costos:** Competitivos en el mercado colombiano

---

**Fecha:** 21 de Enero de 2026  
**Estado:** Guía completa  
**Próximo paso:** Crear cuenta en Wompi y obtener credenciales
