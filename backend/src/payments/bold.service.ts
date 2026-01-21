import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface BoldPaymentLinkData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  redirectUrl?: string;
  expirationDate?: Date;
}

export interface BoldPaymentLink {
  id: string;
  url: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export interface BoldWebhookPayload {
  event: string;
  transaction: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    createdAt: string;
    paidAt?: string;
  };
  customer: {
    email: string;
    name: string;
  };
}

@Injectable()
export class BoldService {
  private readonly logger = new Logger(BoldService.name);
  private readonly apiClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly merchantId: string;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BOLD_API_KEY');
    this.secretKey = this.configService.get<string>('BOLD_SECRET_KEY');
    this.merchantId = this.configService.get<string>('BOLD_MERCHANT_ID');
    this.webhookSecret = this.configService.get<string>('BOLD_WEBHOOK_SECRET');

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

    this.logger.log(`✅ Bold Service inicializado (Wompi API)`);
    this.logger.log(`   API URL: ${apiUrl}`);
    this.logger.log(`   Public Key: ${this.apiKey?.substring(0, 20)}...`);
  }

  /**
   * Crear un link de pago en Bold (usando Wompi API)
   */
  async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
    try {
      this.logger.log(`Creando link de pago en Wompi para: ${data.reference}`);

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

      this.logger.log(`Payload para Wompi:`, JSON.stringify(payload, null, 2));

      const response = await this.apiClient.post('/payment_links', payload);

      const paymentLinkId = response.data.data.id;
      const paymentUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;

      this.logger.log(`✅ Link de pago creado: ${paymentUrl}`);

      return {
        id: paymentLinkId,
        url: paymentUrl,
        reference: data.reference,
        amount: data.amount,
        status: 'pending',
        createdAt: new Date(response.data.data.created_at),
      };
    } catch (error) {
      this.logger.error(`❌ Error al crear link de pago en Wompi:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al crear link de pago: ${error.response?.data?.error?.reason || error.message}`
      );
    }
  }

  /**
   * Consultar el estado de un pago
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      this.logger.log(`Consultando estado de pago: ${transactionId}`);

      const response = await this.apiClient.get(`/transactions/${transactionId}`);

      this.logger.log(`Estado del pago: ${response.data.status}`);

      return {
        id: response.data.id,
        reference: response.data.reference,
        amount: response.data.amount / 100,
        status: response.data.status,
        paymentMethod: response.data.paymentMethod,
        createdAt: new Date(response.data.createdAt),
        paidAt: response.data.paidAt ? new Date(response.data.paidAt) : null,
      };
    } catch (error) {
      this.logger.error(`❌ Error al consultar estado de pago:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al consultar estado de pago: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Validar la firma de un webhook de Bold
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      const isValid = signature === expectedSignature;

      if (!isValid) {
        this.logger.warn(`⚠️ Firma de webhook inválida`);
        this.logger.warn(`   Recibida: ${signature}`);
        this.logger.warn(`   Esperada: ${expectedSignature}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`❌ Error al validar firma de webhook:`, error);
      return false;
    }
  }

  /**
   * Procesar un webhook de Bold
   */
  async processWebhook(payload: BoldWebhookPayload): Promise<{
    transactionId: string;
    reference: string;
    amount: number;
    status: string;
    paymentMethod: string;
  }> {
    try {
      this.logger.log(`Procesando webhook de Bold: ${payload.event}`);
      this.logger.log(`   Transaction ID: ${payload.transaction.id}`);
      this.logger.log(`   Reference: ${payload.transaction.reference}`);
      this.logger.log(`   Status: ${payload.transaction.status}`);

      return {
        transactionId: payload.transaction.id,
        reference: payload.transaction.reference,
        amount: payload.transaction.amount / 100, // Convertir de centavos a pesos
        status: payload.transaction.status,
        paymentMethod: payload.transaction.paymentMethod,
      };
    } catch (error) {
      this.logger.error(`❌ Error al procesar webhook:`, error);
      throw error;
    }
  }

  /**
   * Cancelar un link de pago
   */
  async cancelPaymentLink(paymentLinkId: string): Promise<void> {
    try {
      this.logger.log(`Cancelando link de pago: ${paymentLinkId}`);

      await this.apiClient.delete(`/payment-links/${paymentLinkId}`);

      this.logger.log(`✅ Link de pago cancelado`);
    } catch (error) {
      this.logger.error(`❌ Error al cancelar link de pago:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al cancelar link de pago: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Verificar si Bold está configurado correctamente
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.secretKey && this.merchantId && this.webhookSecret);
  }

  /**
   * Test de conexión con Bold
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'Bold no está configurado. Verifica las variables de entorno.',
        };
      }

      // Intentar hacer una petición simple a la API
      await this.apiClient.get('/health');

      this.logger.log(`✅ Conexión exitosa con Bold`);

      return {
        success: true,
        message: 'Conexión exitosa con Bold',
      };
    } catch (error) {
      this.logger.error(`❌ Error al conectar con Bold:`, error.response?.data || error.message);

      return {
        success: false,
        message: `Error al conectar con Bold: ${error.response?.data?.message || error.message}`,
      };
    }
  }
}
