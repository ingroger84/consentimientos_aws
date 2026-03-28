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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoldService, BoldWebhookPayload } from '../payments/bold.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentsService } from '../payments/payments.service';
import { WebhookLog, WebhookStatus, WebhookProvider } from './entities/webhook-log.entity';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly boldService: BoldService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
    @InjectRepository(WebhookLog)
    private webhookLogsRepository: Repository<WebhookLog>,
  ) {}

  /**
   * Webhook de Bold para notificaciones de pago
   */
  @Post('bold')
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(
    @Body() payload: BoldWebhookPayload,
    @Headers('x-bold-signature') signature: string,
    @Headers() headers: any,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const startTime = Date.now();
    let webhookLog: WebhookLog;

    try {
      this.logger.log(`📥 Webhook recibido de Bold`);
      this.logger.log(`   Event: ${payload.event}`);
      this.logger.log(`   Transaction ID: ${payload.transaction?.id}`);
      this.logger.log(`   Reference: ${payload.transaction?.reference}`);

      // Crear log inicial del webhook
      webhookLog = await this.webhookLogsRepository.save({
        provider: WebhookProvider.BOLD,
        event: payload.event,
        status: WebhookStatus.RECEIVED,
        payload,
        headers: {
          'x-bold-signature': signature,
          'content-type': headers['content-type'],
          'user-agent': headers['user-agent'],
        },
        signature,
        signatureValid: false,
        transactionId: payload.transaction?.id,
      });

      // Validar firma del webhook
      const payloadString = JSON.stringify(payload);
      const isValid = this.boldService.validateWebhookSignature(payloadString, signature);

      // Actualizar validez de la firma
      webhookLog.signatureValid = isValid;
      await this.webhookLogsRepository.save(webhookLog);

      if (!isValid) {
        this.logger.error(`❌ Firma de webhook inválida`);
        webhookLog.status = WebhookStatus.INVALID_SIGNATURE;
        webhookLog.errorMessage = 'Invalid webhook signature';
        webhookLog.processingTimeMs = Date.now() - startTime;
        await this.webhookLogsRepository.save(webhookLog);
        throw new UnauthorizedException('Invalid webhook signature');
      }

      this.logger.log(`✅ Firma de webhook válida`);

      // Procesar el webhook según el evento
      let processingResult: any;
      
      switch (payload.event) {
        case 'payment.succeeded':
          processingResult = await this.handlePaymentSucceeded(payload, webhookLog);
          break;

        case 'payment.failed':
          processingResult = await this.handlePaymentFailed(payload, webhookLog);
          break;

        case 'payment.pending':
          processingResult = await this.handlePaymentPending(payload, webhookLog);
          break;

        default:
          this.logger.warn(`⚠️ Evento no manejado: ${payload.event}`);
          processingResult = { handled: false, reason: 'Event not handled' };
      }

      // Actualizar log con resultado exitoso
      webhookLog.status = WebhookStatus.PROCESSED;
      webhookLog.processingResult = processingResult;
      webhookLog.processingTimeMs = Date.now() - startTime;
      await this.webhookLogsRepository.save(webhookLog);

      return { received: true };
    } catch (error) {
      this.logger.error(`❌ Error al procesar webhook de Bold:`, error);

      // Actualizar log con error
      if (webhookLog) {
        webhookLog.status = WebhookStatus.FAILED;
        webhookLog.errorMessage = error.message;
        webhookLog.processingTimeMs = Date.now() - startTime;
        await this.webhookLogsRepository.save(webhookLog);
      }

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
  private async handlePaymentSucceeded(
    payload: BoldWebhookPayload,
    webhookLog: WebhookLog,
  ): Promise<any> {
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

      // Actualizar webhook log con IDs
      webhookLog.invoiceId = invoice.id;
      webhookLog.tenantId = invoice.tenantId;
      await this.webhookLogsRepository.save(webhookLog);

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

      return {
        success: true,
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        tenantId: invoice.tenantId,
        amount: webhookData.amount,
      };
    } catch (error) {
      this.logger.error(`❌ Error al procesar pago exitoso:`, error);
      throw error;
    }
  }

  /**
   * Manejar pago fallido
   */
  private async handlePaymentFailed(
    payload: BoldWebhookPayload,
    webhookLog: WebhookLog,
  ): Promise<any> {
    try {
      this.logger.log(`❌ Procesando pago fallido`);

      const webhookData = await this.boldService.processWebhook(payload);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(webhookData.reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${webhookData.reference}`);
        return { success: false, reason: 'Invoice not found' };
      }

      this.logger.log(`Factura encontrada: ${invoice.invoiceNumber}`);

      // Actualizar webhook log con IDs
      webhookLog.invoiceId = invoice.id;
      webhookLog.tenantId = invoice.tenantId;
      await this.webhookLogsRepository.save(webhookLog);

      // Registrar el intento fallido
      this.logger.log(`Pago fallido para factura ${invoice.invoiceNumber}`);

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: 'failed',
      };

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
  private async handlePaymentPending(
    payload: BoldWebhookPayload,
    webhookLog: WebhookLog,
  ): Promise<any> {
    try {
      this.logger.log(`⏳ Procesando pago pendiente`);

      const webhookData = await this.boldService.processWebhook(payload);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(webhookData.reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${webhookData.reference}`);
        return { success: false, reason: 'Invoice not found' };
      }

      this.logger.log(`Factura encontrada: ${invoice.invoiceNumber}`);
      this.logger.log(`Pago pendiente para factura ${invoice.invoiceNumber}`);

      // Actualizar webhook log con IDs
      webhookLog.invoiceId = invoice.id;
      webhookLog.tenantId = invoice.tenantId;
      await this.webhookLogsRepository.save(webhookLog);

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: 'pending',
      };

      // El pago está pendiente (ej: PSE esperando confirmación bancaria)
      // No hacer nada por ahora, esperar el webhook de payment.succeeded
    } catch (error) {
      this.logger.error(`❌ Error al procesar pago pendiente:`, error);
      throw error;
    }
  }
}
