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

    // Bold Colombia - API Link de Pagos (según respuesta de Bold 26/03/2026)
    // URL Base: https://integrations.api.bold.co
    // Endpoint: POST /online/link/v1
    // Documentación: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
    const apiUrl = this.configService.get<string>('BOLD_API_URL') || 'https://integrations.api.bold.co';

    this.apiClient = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${this.apiKey}`, // Bold: Authorization con prefijo "x-api-key" (minúsculas)
      },
      timeout: 30000,
    });

    this.logger.log(`✅ Bold Service inicializado (API Link de Pagos)`);
    this.logger.log(`   API URL: ${apiUrl}`);
    this.logger.log(`   API Key: ${this.apiKey?.substring(0, 20)}...`);
    this.logger.log(`   Merchant ID: ${this.merchantId}`);
  }

  /**
   * Crear un link de pago en Bold Colombia
   * Según respuesta de Bold del 26/03/2026 y documentación oficial
   * https://developers.bold.co/pagos-en-linea/api-link-de-pagos
   */
  async createPaymentLink(data: BoldPaymentLinkData): Promise<BoldPaymentLink> {
    try {
      this.logger.log(`Creando link de pago Bold para: ${data.reference}`);

      // Preparar payload según documentación oficial de API Link de Pagos
      const payload = {
        amount_type: 'CLOSE',  // Monto cerrado (comerciante define el monto)
        amount: {
          currency: data.currency || 'COP',
          total_amount: Math.round(data.amount), // En pesos (no centavos)
          taxes: [],  // Array de impuestos (vacío si no aplica)
          tip_amount: 0,  // Propina (0 si no aplica)
        },
        reference: data.reference,  // Referencia única (sin "_id")
        description: data.description,
        callback_url: data.redirectUrl,
        payer_email: data.customerEmail,  // Email del pagador (no "customer")
      };

      this.logger.log(`📤 Request a Bold (API Link de Pagos):`, JSON.stringify(payload, null, 2));

      // Endpoint según documentación oficial: POST /online/link/v1
      const response = await this.apiClient.post('/online/link/v1', payload);

      this.logger.log(`✅ Respuesta de Bold:`, JSON.stringify(response.data, null, 2));

      // Extraer datos del payload
      const paymentData = response.data.payload;

      if (!paymentData || !paymentData.url) {
        throw new Error('Bold no devolvió URL de checkout en la respuesta');
      }

      // Bold devuelve la URL lista para usar
      const checkoutUrl = paymentData.url;  // Ejemplo: https://checkout.bold.co/LNK_H7S4xxx
      const paymentLinkId = paymentData.payment_link;  // Ejemplo: LNK_H7S4xxx

      this.logger.log(`✅ Link de pago creado`);
      this.logger.log(`   Payment Link ID: ${paymentLinkId}`);
      this.logger.log(`   URL: ${checkoutUrl}`);

      return {
        id: paymentLinkId,
        url: checkoutUrl,
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
        `Error al crear link de pago: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Consultar el estado de un link de pago
   * Según documentación oficial: GET /online/link/v1/{payment_link}
   */
  async getPaymentStatus(paymentLinkId: string): Promise<any> {
    try {
      this.logger.log(`Consultando estado de link de pago: ${paymentLinkId}`);

      const response = await this.apiClient.get(`/online/link/v1/${paymentLinkId}`);

      this.logger.log(`Estado del link: ${response.data.status}`);

      const paymentData = response.data;

      return {
        id: paymentData.id,
        reference: paymentData.reference,
        amount: paymentData.total,
        status: paymentData.status,
        paymentMethod: paymentData.payment_method,
        createdAt: paymentData.creation_date ? new Date(paymentData.creation_date / 1000000) : new Date(),
        paidAt: paymentData.transaction_id ? new Date() : null,
      };
    } catch (error) {
      this.logger.error(`❌ Error al consultar estado de link:`, error.response?.data || error.message);
      throw new BadRequestException(
        `Error al consultar estado: ${error.response?.data?.message || error.message}`
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
   * NOTA: La documentación de Bold API Link de Pagos NO menciona endpoint para cancelar links
   */
  async cancelPaymentLink(paymentLinkId: string): Promise<void> {
    this.logger.warn(`⚠️ Intento de cancelar link de pago: ${paymentLinkId}`);
    this.logger.warn(`   La API de Bold Link de Pagos no soporta cancelación de links`);
    
    throw new BadRequestException(
      'La cancelación de links de pago no está soportada por Bold API Link de Pagos'
    );
  }

  /**
   * Verificar si Bold está configurado correctamente
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.secretKey && this.merchantId && this.webhookSecret);
  }

  /**
   * Test de conexión con Bold API Link de Pagos
   * Consulta los métodos de pago disponibles
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'Bold no está configurado. Verifica las variables de entorno.',
        };
      }

      // Probar consultando métodos de pago disponibles
      // Endpoint: GET /online/link/v1/payment_methods
      const response = await this.apiClient.get('/online/link/v1/payment_methods');

      this.logger.log(`✅ Conexión exitosa con Bold API Link de Pagos`);
      this.logger.log(`   Métodos de pago disponibles:`, JSON.stringify(response.data.payload?.payment_methods, null, 2));

      return {
        success: true,
        message: 'Conexión exitosa con Bold API Link de Pagos',
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
