import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAttempt, PaymentAttemptStatus } from './entities/payment-attempt.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

const MAX_PAYMENT_ATTEMPTS = 6;

@Injectable()
export class PaymentAttemptsService {
  private readonly logger = new Logger(PaymentAttemptsService.name);

  constructor(
    @InjectRepository(PaymentAttempt)
    private paymentAttemptsRepository: Repository<PaymentAttempt>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  /**
   * Registrar un nuevo intento de pago
   */
  async createAttempt(data: {
    invoiceId: string;
    boldPaymentLink: string;
    boldPaymentReference: string;
    boldPaymentLinkId: string;
    status?: PaymentAttemptStatus;
    boldResponse?: any;
  }): Promise<PaymentAttempt> {
    const attempt = this.paymentAttemptsRepository.create({
      invoiceId: data.invoiceId,
      boldPaymentLink: data.boldPaymentLink,
      boldPaymentReference: data.boldPaymentReference,
      boldPaymentLinkId: data.boldPaymentLinkId,
      status: data.status || PaymentAttemptStatus.PENDING,
      boldResponse: data.boldResponse,
      attemptedAt: new Date(),
    });

    const savedAttempt = await this.paymentAttemptsRepository.save(attempt);

    // Actualizar contador en la factura
    await this.invoicesRepository.increment(
      { id: data.invoiceId },
      'paymentAttemptsCount',
      1,
    );

    await this.invoicesRepository.update(
      { id: data.invoiceId },
      { lastPaymentAttemptAt: new Date() },
    );

    this.logger.log(`✅ Intento de pago registrado: ${savedAttempt.id}`);
    this.logger.log(`   Invoice: ${data.invoiceId}`);
    this.logger.log(`   Status: ${savedAttempt.status}`);

    return savedAttempt;
  }

  /**
   * Marcar un intento como fallido
   */
  async markAsFailed(
    attemptId: string,
    failureReason: string,
    boldResponse?: any,
  ): Promise<PaymentAttempt> {
    const attempt = await this.paymentAttemptsRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new BadRequestException('Intento de pago no encontrado');
    }

    attempt.status = PaymentAttemptStatus.FAILED;
    attempt.failureReason = failureReason;
    if (boldResponse) {
      attempt.boldResponse = boldResponse;
    }

    const updatedAttempt = await this.paymentAttemptsRepository.save(attempt);

    this.logger.log(`❌ Intento de pago marcado como fallido: ${attemptId}`);
    this.logger.log(`   Razón: ${failureReason}`);

    return updatedAttempt;
  }

  /**
   * Marcar un intento como exitoso
   */
  async markAsSucceeded(attemptId: string): Promise<PaymentAttempt> {
    const attempt = await this.paymentAttemptsRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new BadRequestException('Intento de pago no encontrado');
    }

    attempt.status = PaymentAttemptStatus.SUCCEEDED;

    const updatedAttempt = await this.paymentAttemptsRepository.save(attempt);

    this.logger.log(`✅ Intento de pago marcado como exitoso: ${attemptId}`);

    return updatedAttempt;
  }

  /**
   * Obtener todos los intentos de una factura
   */
  async findByInvoice(invoiceId: string): Promise<PaymentAttempt[]> {
    return await this.paymentAttemptsRepository.find({
      where: { invoiceId },
      order: { attemptedAt: 'DESC' },
    });
  }

  /**
   * Obtener el último intento de una factura
   */
  async findLastAttempt(invoiceId: string): Promise<PaymentAttempt | null> {
    return await this.paymentAttemptsRepository.findOne({
      where: { invoiceId },
      order: { attemptedAt: 'DESC' },
    });
  }

  /**
   * Verificar si se puede realizar un nuevo intento de pago
   */
  async canRetryPayment(invoiceId: string): Promise<{
    canRetry: boolean;
    reason?: string;
    attemptsCount: number;
    maxAttempts: number;
  }> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return {
        canRetry: false,
        reason: 'Factura no encontrada',
        attemptsCount: 0,
        maxAttempts: MAX_PAYMENT_ATTEMPTS,
      };
    }

    // Verificar si ya está pagada
    if (invoice.status === 'paid') {
      return {
        canRetry: false,
        reason: 'La factura ya está pagada',
        attemptsCount: invoice.paymentAttemptsCount || 0,
        maxAttempts: MAX_PAYMENT_ATTEMPTS,
      };
    }

    // Verificar límite de intentos
    const attemptsCount = invoice.paymentAttemptsCount || 0;
    if (attemptsCount >= MAX_PAYMENT_ATTEMPTS) {
      return {
        canRetry: false,
        reason: `Se alcanzó el límite máximo de ${MAX_PAYMENT_ATTEMPTS} intentos de pago`,
        attemptsCount,
        maxAttempts: MAX_PAYMENT_ATTEMPTS,
      };
    }

    return {
      canRetry: true,
      attemptsCount,
      maxAttempts: MAX_PAYMENT_ATTEMPTS,
    };
  }

  /**
   * Obtener estadísticas de intentos de pago
   */
  async getAttemptStats(invoiceId: string): Promise<{
    total: number;
    pending: number;
    failed: number;
    succeeded: number;
    expired: number;
    lastAttempt: Date | null;
  }> {
    const attempts = await this.findByInvoice(invoiceId);

    return {
      total: attempts.length,
      pending: attempts.filter((a) => a.status === PaymentAttemptStatus.PENDING).length,
      failed: attempts.filter((a) => a.status === PaymentAttemptStatus.FAILED).length,
      succeeded: attempts.filter((a) => a.status === PaymentAttemptStatus.SUCCEEDED).length,
      expired: attempts.filter((a) => a.status === PaymentAttemptStatus.EXPIRED).length,
      lastAttempt: attempts.length > 0 ? attempts[0].attemptedAt : null,
    };
  }

  /**
   * Buscar intento por referencia de Bold
   */
  async findByBoldReference(boldPaymentReference: string): Promise<PaymentAttempt | null> {
    return await this.paymentAttemptsRepository.findOne({
      where: { boldPaymentReference },
      relations: ['invoice'],
    });
  }
}
