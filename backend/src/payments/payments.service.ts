import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { BillingHistory, BillingAction } from '../billing/entities/billing-history.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(BillingHistory)
    private billingHistoryRepository: Repository<BillingHistory>,
    private mailService: MailService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { tenantId, invoiceId, amount, ...paymentData } = createPaymentDto;

    // Verificar que el tenant existe
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Si hay invoiceId, verificar que existe y pertenece al tenant
    let invoice: Invoice | null = null;
    if (invoiceId) {
      invoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId, tenantId },
      });

      if (!invoice) {
        throw new NotFoundException('Factura no encontrada');
      }

      // Verificar que la factura no esté ya pagada
      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestException('La factura ya está pagada');
      }
    }

    // Crear el pago
    const payment = this.paymentsRepository.create({
      ...paymentData,
      tenantId,
      invoiceId,
      amount,
      paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
      status: paymentData.status || PaymentStatus.COMPLETED,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Si el pago está completado, actualizar la factura y el tenant
    if (savedPayment.status === PaymentStatus.COMPLETED) {
      await this.processCompletedPayment(savedPayment, tenant, invoice);
    }

    return savedPayment;
  }

  private async processCompletedPayment(
    payment: Payment,
    tenant: Tenant,
    invoice: Invoice | null,
  ): Promise<void> {
    // Actualizar factura si existe
    if (invoice) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = payment.paymentDate;
      await this.invoicesRepository.save(invoice);

      // Registrar en historial
      await this.billingHistoryRepository.save({
        tenantId: tenant.id,
        action: BillingAction.PAYMENT_RECEIVED,
        description: `Pago recibido por ${this.formatCurrency(payment.amount)} - Factura ${invoice.invoiceNumber}`,
        metadata: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
        },
      });

      // 🔔 Enviar notificación al super admin sobre el pago recibido
      try {
        await this.mailService.sendPaymentReceivedAlertToAdmin(tenant, payment, invoice);
      } catch (emailError) {
        console.error(`Error al enviar notificación de pago al admin:`, emailError);
        // No lanzar error para no interrumpir el flujo de pago
      }
    }

    // Si el tenant estaba suspendido, activarlo
    if (tenant.status === TenantStatus.SUSPENDED) {
      tenant.status = TenantStatus.ACTIVE;
      
      // Extender la fecha de expiración del plan
      const now = new Date();
      const expiresAt = new Date(now);
      
      if (tenant.billingCycle === 'annual') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
      
      tenant.planExpiresAt = expiresAt;
      tenant.planStartedAt = now;
      
      await this.tenantsRepository.save(tenant);

      // Registrar activación en historial
      await this.billingHistoryRepository.save({
        tenantId: tenant.id,
        action: BillingAction.TENANT_ACTIVATED,
        description: `Tenant reactivado tras recibir pago de ${this.formatCurrency(payment.amount)}`,
        metadata: {
          paymentId: payment.id,
          previousStatus: TenantStatus.SUSPENDED,
          newExpiresAt: expiresAt,
        },
      });

      // Enviar email de activación
      try {
        await this.mailService.sendTenantActivatedEmail(tenant, payment);
      } catch (error) {
        console.error('Error al enviar email de activación:', error);
      }
    } else {
      // Si el tenant está activo, extender la suscripción
      const currentExpires = tenant.planExpiresAt || new Date();
      const newExpires = new Date(currentExpires);
      
      if (tenant.billingCycle === 'annual') {
        newExpires.setFullYear(newExpires.getFullYear() + 1);
      } else {
        newExpires.setMonth(newExpires.getMonth() + 1);
      }
      
      tenant.planExpiresAt = newExpires;
      await this.tenantsRepository.save(tenant);
    }

    // Enviar email de confirmación de pago
    try {
      await this.mailService.sendPaymentConfirmationEmail(tenant, payment, invoice);
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
    }
  }

  async findAll(filters?: {
    tenantId?: string;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Payment[]> {
    const query = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.tenant', 'tenant')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.tenantId) {
      query.andWhere('payment.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('payment.paymentDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('payment.paymentDate <= :endDate', { endDate: filters.endDate });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['tenant', 'invoice'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }

  async findByTenant(tenantId: string): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: { tenantId },
      relations: ['invoice'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Procesar pago de Bold manualmente cuando el webhook no llega
   * Esto es común en sandbox o cuando hay problemas de red
   */
  async processBoldPaymentManually(
    invoiceId: string,
    boldOrderId: string,
    boldTxStatus: string,
  ): Promise<{ success: boolean; message: string; invoice?: any }> {
    try {
      console.log(`📥 Procesando pago manual de Bold`);
      console.log(`   Invoice ID: ${invoiceId}`);
      console.log(`   Bold Order ID: ${boldOrderId}`);
      console.log(`   Status: ${boldTxStatus}`);

      // Solo procesar si el estado es aprobado
      if (boldTxStatus !== 'approved') {
        return {
          success: false,
          message: `Pago no aprobado. Estado: ${boldTxStatus}`,
        };
      }

      // Buscar la factura
      const invoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId },
        relations: ['tenant'],
      });

      if (!invoice) {
        throw new NotFoundException(`Factura ${invoiceId} no encontrada`);
      }

      // Verificar si ya está pagada
      if (invoice.status === InvoiceStatus.PAID) {
        console.log(`✅ Factura ${invoice.invoiceNumber} ya está pagada`);
        return {
          success: true,
          message: 'La factura ya está marcada como pagada',
          invoice,
        };
      }

      console.log(`💰 Procesando pago para factura ${invoice.invoiceNumber}`);

      // Crear el registro de pago
      const payment = await this.create({
        amount: invoice.total,
        paymentMethod: PaymentMethod.OTHER,
        paymentDate: new Date().toISOString(),
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        notes: `Pago procesado manualmente desde página de confirmación - Bold Order ID: ${boldOrderId}`,
        boldTransactionId: boldOrderId,
        boldPaymentMethod: 'Bold Checkout',
        boldPaymentData: {
          boldOrderId,
          boldTxStatus,
          processedManually: true,
          processedAt: new Date().toISOString(),
        },
      });

      console.log(`✅ Pago registrado: ${payment.id}`);
      console.log(`✅ Factura ${invoice.invoiceNumber} marcada como pagada`);

      // Recargar la factura actualizada
      const updatedInvoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId },
        relations: ['tenant'],
      });

      return {
        success: true,
        message: 'Pago procesado exitosamente',
        invoice: updatedInvoice,
      };
    } catch (error) {
      console.error(`❌ Error al procesar pago manual:`, error);
      throw error;
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
