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
import { PaymentAttemptsService } from '../payments/payment-attempts.service';
import { MailService } from '../mail/mail.service';
import { WebhookLog, WebhookStatus, WebhookProvider } from './entities/webhook-log.entity';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly boldService: BoldService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentAttemptsService: PaymentAttemptsService,
    private readonly mailService: MailService,
    @InjectRepository(WebhookLog)
    private webhookLogsRepository: Repository<WebhookLog>,
  ) {}

  /**
   * Webhook de Bold para notificaciones de pago
   */
  @Post('bold')
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(
    @Body() payload: any,
    @Headers('x-bold-signature') signature: string,
    @Headers() headers: any,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const startTime = Date.now();
    let webhookLog: WebhookLog;

    try {
      // Bold envía "type" en lugar de "event"
      const eventType = payload.type || payload.event;
      const transactionId = payload.data?.payment_id || payload.transaction?.id;
      const reference = payload.data?.metadata?.reference || payload.transaction?.reference;

      this.logger.log(`📥 Webhook recibido de Bold`);
      this.logger.log(`   Type: ${eventType}`);
      this.logger.log(`   Transaction ID: ${transactionId}`);
      this.logger.log(`   Reference: ${reference}`);

      // Crear log inicial del webhook
      webhookLog = await this.webhookLogsRepository.save({
        provider: WebhookProvider.BOLD,
        event: eventType,
        status: WebhookStatus.RECEIVED,
        payload,
        headers: {
          'x-bold-signature': signature,
          'content-type': headers['content-type'],
          'user-agent': headers['user-agent'],
        },
        signature,
        signatureValid: false,
        transactionId: transactionId,
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
      // Bold envía "type" con valores como "SALE_APPROVED", "SALE_REJECTED", etc.
      let processingResult: any;
      
      // Mapear tipos de Bold a eventos internos
      const eventMapping: Record<string, string> = {
        'SALE_APPROVED': 'payment.succeeded',
        'SALE_REJECTED': 'payment.failed',
        'SALE_PENDING': 'payment.pending',
      };

      const mappedEvent = eventMapping[eventType] || eventType;
      
      switch (mappedEvent) {
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
          this.logger.warn(`⚠️ Evento no manejado: ${eventType} (${mappedEvent})`);
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
    payload: any,
    webhookLog: WebhookLog,
  ): Promise<any> {
    try {
      this.logger.log(`💰 Procesando pago exitoso`);

      // Extraer datos del formato de Bold
      const transactionId = payload.data?.payment_id || payload.transaction?.id;
      const reference = payload.data?.metadata?.reference || payload.transaction?.reference;
      const amount = payload.data?.amount?.total || payload.transaction?.amount;
      const paymentMethod = payload.data?.payment_method || payload.transaction?.paymentMethod;
      const payerEmail = payload.data?.payer_email || payload.customer?.email;

      this.logger.log(`   Transaction ID: ${transactionId}`);
      this.logger.log(`   Reference: ${reference}`);
      this.logger.log(`   Amount: ${amount}`);
      this.logger.log(`   Payment Method: ${paymentMethod}`);

      // Buscar la factura por referencia
      const invoice = await this.invoicesService.findByReference(reference);

      if (!invoice) {
        this.logger.error(`❌ Factura no encontrada: ${reference}`);
        throw new BadRequestException(`Invoice not found: ${reference}`);
      }

      this.logger.log(`✅ Factura encontrada: ${invoice.invoiceNumber}`);

      // Actualizar webhook log con IDs
      webhookLog.invoiceId = invoice.id;
      webhookLog.tenantId = invoice.tenantId;
      await this.webhookLogsRepository.save(webhookLog);

      // Verificar que el monto coincida (Bold envía en pesos, no centavos)
      if (Math.abs(invoice.total - amount) > 0.01) {
        this.logger.error(`❌ Monto no coincide`);
        this.logger.error(`   Esperado: ${invoice.total}`);
        this.logger.error(`   Recibido: ${amount}`);
        throw new BadRequestException('Amount mismatch');
      }

      // Marcar el link de pago como exitoso
      await this.invoicesService.markPaymentLinkAsSucceeded(invoice.id);

      // Buscar el intento de pago correspondiente
      const attempt = await this.paymentAttemptsService.findByBoldReference(reference);
      
      if (attempt) {
        // Marcar el intento como exitoso
        await this.paymentAttemptsService.markAsSucceeded(attempt.id);
        this.logger.log(`✅ Intento de pago ${attempt.id} marcado como exitoso`);
      }

      // Mapear el método de pago de Bold a nuestro enum
      // Enum payments_paymentmethod_enum solo acepta: 'transfer', 'other'
      let mappedPaymentMethod = 'other';
      const boldMethod = (paymentMethod || '').toLowerCase();
      if (boldMethod.includes('transfer') || boldMethod.includes('transferencia')) {
        mappedPaymentMethod = 'transfer';
      } else {
        // PSE, tarjetas, efectivo, etc. se mapean a 'other'
        mappedPaymentMethod = 'other';
      }

      // Crear el registro de pago
      const payment = await this.paymentsService.create({
        amount: amount,
        paymentMethod: mappedPaymentMethod as any,
        paymentDate: new Date().toISOString(),
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        notes: `Pago procesado automáticamente vía Bold - Transaction ID: ${transactionId}`,
        boldTransactionId: transactionId,
        boldPaymentMethod: paymentMethod,
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
        amount: amount,
        attemptId: attempt?.id,
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

      // Marcar el link de pago como fallido
      await this.invoicesService.markPaymentLinkAsFailed(invoice.id);

      // Buscar el intento de pago correspondiente
      const attempt = await this.paymentAttemptsService.findByBoldReference(webhookData.reference);
      
      if (attempt) {
        // Marcar el intento como fallido
        await this.paymentAttemptsService.markAsFailed(
          attempt.id,
          payload.transaction?.status || 'Payment rejected by Bold',
          payload,
        );
        
        this.logger.log(`✅ Intento de pago ${attempt.id} marcado como fallido`);
      }

      // Enviar email de notificación de pago fallido
      try {
        await this.mailService.sendPaymentFailedEmail(invoice.tenant, invoice);
        this.logger.log(`✅ Email de pago fallido enviado a ${invoice.tenant.contactEmail}`);
      } catch (emailError) {
        this.logger.error(`❌ Error al enviar email de pago fallido:`, emailError);
        // No lanzar error, continuar con el proceso
      }

      this.logger.log(`Pago fallido registrado para factura ${invoice.invoiceNumber}`);

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: 'failed',
        attemptId: attempt?.id,
      };
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
