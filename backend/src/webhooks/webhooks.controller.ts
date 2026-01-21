import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { BoldService, BoldWebhookPayload } from '../payments/bold.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly boldService: BoldService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Webhook de Bold para notificaciones de pago
   */
  @Post('bold')
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(
    @Body() payload: BoldWebhookPayload,
    @Headers('x-bold-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      this.logger.log(`📥 Webhook recibido de Bold`);
      this.logger.log(`   Event: ${payload.event}`);
      this.logger.log(`   Transaction ID: ${payload.transaction?.id}`);
      this.logger.log(`   Reference: ${payload.transaction?.reference}`);

      // Validar firma del webhook
      const payloadString = JSON.stringify(payload);
      const isValid = this.boldService.validateWebhookSignature(payloadString, signature);

      if (!isValid) {
        this.logger.error(`❌ Firma de webhook inválida`);
        throw new UnauthorizedException('Invalid webhook signature');
      }

      this.logger.log(`✅ Firma de webhook válida`);

      // Procesar el webhook según el evento
      switch (payload.event) {
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'payment.pending':
          await this.handlePaymentPending(payload);
          break;

        default:
          this.logger.warn(`⚠️ Evento no manejado: ${payload.event}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`❌ Error al procesar webhook de Bold:`, error);

      // Retornar 200 para evitar reintentos innecesarios si es un error de validación
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Para otros errores, Bold reintentará
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Manejar pago exitoso
   */
  private async handlePaymentSucceeded(payload: BoldWebhookPayload): Promise<void> {
    try {
      this.logger.log(`💰 Procesando pago exitoso`);

      const webhookData = await this.boldService.processWebhook(payload);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(webhookData.reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${webhookData.reference}`);
        throw new BadRequestException(`Invoice not found: ${webhookData.reference}`);
      }

      this.logger.log(`✅ Factura encontrada: ${invoice.invoiceNumber}`);

      // Verificar que el monto coincida
      if (Math.abs(invoice.total - webhookData.amount) > 0.01) {
        this.logger.error(`❌ Monto no coincide`);
        this.logger.error(`   Esperado: ${invoice.total}`);
        this.logger.error(`   Recibido: ${webhookData.amount}`);
        throw new BadRequestException('Amount mismatch');
      }

      // Mapear el método de pago de Bold a nuestro enum
      let paymentMethod = 'OTHER';
      const boldMethod = webhookData.paymentMethod.toLowerCase();
      if (boldMethod.includes('pse')) {
        paymentMethod = 'PSE';
      } else if (boldMethod.includes('card') || boldMethod.includes('tarjeta')) {
        paymentMethod = 'CARD';
      } else if (boldMethod.includes('transfer')) {
        paymentMethod = 'TRANSFER';
      }

      // Crear el registro de pago
      const payment = await this.paymentsService.create({
        amount: webhookData.amount,
        paymentMethod: paymentMethod as any,
        paymentDate: new Date().toISOString(),
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        notes: `Pago procesado automáticamente vía Bold - Transaction ID: ${webhookData.transactionId}`,
        boldTransactionId: webhookData.transactionId,
        boldPaymentMethod: webhookData.paymentMethod,
        boldPaymentData: payload,
      });

      this.logger.log(`✅ Pago registrado: ${payment.id}`);

      // Marcar la factura como pagada
      await this.invoicesService.markAsPaidWithPayment(invoice.id, payment.id);

      this.logger.log(`✅ Factura marcada como pagada`);

      // Activar el tenant automáticamente
      await this.invoicesService.activateTenantAfterPayment(invoice.tenantId);

      this.logger.log(`✅ Tenant activado automáticamente`);

      // Enviar email de confirmación
      await this.invoicesService.sendPaymentConfirmation(invoice.id);

      this.logger.log(`✅ Email de confirmación enviado`);
    } catch (error) {
      this.logger.error(`❌ Error al procesar pago exitoso:`, error);
      throw error;
    }
  }

  /**
   * Manejar pago fallido
   */
  private async handlePaymentFailed(payload: BoldWebhookPayload): Promise<void> {
    try {
      this.logger.log(`❌ Procesando pago fallido`);

      const webhookData = await this.boldService.processWebhook(payload);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(webhookData.reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${webhookData.reference}`);
        return;
      }

      this.logger.log(`Factura encontrada: ${invoice.invoiceNumber}`);

      // Registrar el intento fallido
      this.logger.log(`Pago fallido para factura ${invoice.invoiceNumber}`);

      // Opcional: Enviar notificación al tenant
      // await this.invoicesService.sendPaymentFailedNotification(invoice.id);
    } catch (error) {
      this.logger.error(`❌ Error al procesar pago fallido:`, error);
      throw error;
    }
  }

  /**
   * Manejar pago pendiente
   */
  private async handlePaymentPending(payload: BoldWebhookPayload): Promise<void> {
    try {
      this.logger.log(`⏳ Procesando pago pendiente`);

      const webhookData = await this.boldService.processWebhook(payload);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(webhookData.reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${webhookData.reference}`);
        return;
      }

      this.logger.log(`Factura encontrada: ${invoice.invoiceNumber}`);
      this.logger.log(`Pago pendiente para factura ${invoice.invoiceNumber}`);

      // El pago está pendiente (ej: PSE esperando confirmación bancaria)
      // No hacer nada por ahora, esperar el webhook de payment.succeeded
    } catch (error) {
      this.logger.error(`❌ Error al procesar pago pendiente:`, error);
      throw error;
    }
  }
}
