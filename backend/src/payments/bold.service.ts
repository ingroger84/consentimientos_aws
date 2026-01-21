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

    // Bold Colombia API
    // Sandbox: https://api.online.payments.bold.co
    const apiUrl = this.configService.get<string>('BOLD_API_URL') || 'https://api.online.payments.bold.co';

    this.apiClient = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${this.apiKey}`, // Bold usa Authorization: x-api-key
      },
      timeout: 30000,
    });

    this.logger.log(`✅ Bold Service inicializado`);
    this.logger.log(`   API URL: ${apiUrl}`);
    this.logger.log(`   API Key: ${this.apiKey?.substring(0, 20)}...`);
    this.logger.log(`   Merchant ID: ${this.merchantId}`);
  }

  /**
   * Crear un link de pago en Bold Colombia
   */
  async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
    try {
      this.logger.log(`Creando intención de pago en Bold para: ${data.reference}`);

      // Estructura de Bold Colombia para crear intención de pago
      const payload = {
        reference_id: data.reference,
        amount: {
          currency: data.currency || 'COP',
          total_amount: Math.round(data.amount), // Bold espera el monto en pesos (no centavos)
        },
        description: data.description,
        callback_url: data.redirectUrl || this.configService.get('BOLD_SUCCESS_URL'),
        customer: {
          name: data.customerName,
          email: data.customerEmail,
        },
      };

      this.logger.log(`Payload para Bold:`, JSON.stringify(payload, null, 2));

      const response = await this.apiClient.post('/payment-intent', payload);

      // Bold devuelve la intención de pago con reference_id
      const referenceId = response.data.reference_id;
      
      // Para obtener el link de pago, necesitamos construir la URL del checkout
      // Según la documentación, después de crear la intención, se debe redirigir al usuario
      const paymentUrl = `https://checkout.bold.co/payment/${referenceId}`;

      this.logger.log(`✅ Intención de pago creada: ${referenceId}`);
      this.logger.log(`   URL de pago: ${paymentUrl}`);

      return {
        id: referenceId,
        url: paymentUrl,
        reference: data.reference,
        amount: data.amount,
        status: response.data.status || 'ACTIVE',
        createdAt: new Date(response.data.creation_date || Date.now()),
      };
    } catch (error) {
      this.logger.error(`❌ Error al crear intención de pago en Bold:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al crear intención de pago: ${error.response?.data?.message || error.message}`
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
