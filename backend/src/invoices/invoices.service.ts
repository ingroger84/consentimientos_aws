import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { TaxConfig } from './entities/tax-config.entity';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { BillingHistory, BillingAction } from '../billing/entities/billing-history.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { TaxConfigService } from './tax-config.service';
import { MailService } from '../mail/mail.service';
import { BoldService } from '../payments/bold.service';
import { getPlanConfig, calculatePrice } from '../tenants/plans.config';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(TaxConfig)
    private taxConfigRepository: Repository<TaxConfig>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(BillingHistory)
    private billingHistoryRepository: Repository<BillingHistory>,
    private taxConfigService: TaxConfigService,
    private mailService: MailService,
    private boldService: BoldService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { tenantId, taxConfigId, taxExempt, taxExemptReason, ...invoiceData } = createInvoiceDto;

    // Verificar que el tenant existe
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Validar que si es exenta, se proporcione la razón
    if (taxExempt && !taxExemptReason) {
      throw new BadRequestException('Debe proporcionar una razón para la exención de impuestos');
    }

    let finalTaxConfigId = taxConfigId;
    let calculatedTax = invoiceData.tax || 0;
    let calculatedTotal = invoiceData.total;

    // Si la factura NO es exenta de impuestos
    if (!taxExempt) {
      // Si no se proporciona taxConfigId, usar el por defecto
      if (!finalTaxConfigId) {
        const defaultTaxConfig = await this.taxConfigService.findDefault();
        if (defaultTaxConfig) {
          finalTaxConfigId = defaultTaxConfig.id;
        }
      }

      // Si hay un taxConfigId, calcular el impuesto
      if (finalTaxConfigId) {
        const taxConfig = await this.taxConfigService.findOne(finalTaxConfigId);
        const taxCalculation = this.taxConfigService.calculateTax(invoiceData.amount, taxConfig);
        calculatedTax = taxCalculation.tax;
        calculatedTotal = taxCalculation.total;
      } else {
        // Si no hay taxConfigId y no hay impuesto por defecto, no aplicar impuesto
        calculatedTax = 0;
        calculatedTotal = invoiceData.amount;
      }
    } else {
      // Si es exenta, no hay impuesto
      calculatedTax = 0;
      calculatedTotal = invoiceData.amount;
      finalTaxConfigId = undefined; // No asociar ningún impuesto
    }

    // Crear la factura
    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      tenantId,
      taxConfigId: finalTaxConfigId,
      taxExempt: taxExempt || false,
      taxExemptReason: taxExemptReason || null,
      tax: calculatedTax,
      total: calculatedTotal,
      dueDate: new Date(invoiceData.dueDate),
      periodStart: new Date(invoiceData.periodStart),
      periodEnd: new Date(invoiceData.periodEnd),
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId,
      action: BillingAction.INVOICE_CREATED,
      description: `Factura ${savedInvoice.invoiceNumber} creada por ${this.formatCurrency(savedInvoice.total)}`,
      metadata: {
        invoiceId: savedInvoice.id,
        invoiceNumber: savedInvoice.invoiceNumber,
        amount: savedInvoice.total,
        dueDate: savedInvoice.dueDate,
      },
    });

    // Enviar email con la factura
    try {
      await this.mailService.sendInvoiceEmail(tenant, savedInvoice);
    } catch (error) {
      console.error('Error al enviar email de factura:', error);
    }

    return savedInvoice;
  }

  async generateMonthlyInvoice(tenant: Tenant): Promise<Invoice> {
    // Obtener configuración del plan
    const planConfig = getPlanConfig(tenant.plan);
    if (!planConfig) {
      throw new BadRequestException(`Plan ${tenant.plan} no encontrado`);
    }

    // Calcular precio según ciclo de facturación
    const amount = calculatePrice(tenant.plan, tenant.billingCycle);

    // Obtener configuración de impuesto por defecto
    const taxConfig = await this.taxConfigService.findDefault();
    let tax = 0;
    let total = amount;
    let taxConfigId: string | undefined;

    if (taxConfig && taxConfig.isActive) {
      const taxCalculation = this.taxConfigService.calculateTax(amount, taxConfig);
      tax = taxCalculation.tax;
      total = taxCalculation.total;
      taxConfigId = taxConfig.id;
    } else {
      // Fallback al método anterior si no hay configuración de impuesto
      const taxRate = parseFloat(process.env.BILLING_TAX_RATE || '0.19');
      tax = amount * taxRate;
      total = amount + tax;
    }

    // Calcular período de facturación
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);
    
    if (tenant.billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Fecha de vencimiento (30 días después de la emisión)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    // Crear líneas de factura
    const items = [
      {
        description: `Plan ${planConfig.name} - ${tenant.billingCycle === 'annual' ? 'Anual' : 'Mensual'}`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ];

    // Crear factura
    const createInvoiceDto: CreateInvoiceDto = {
      tenantId: tenant.id,
      taxConfigId,
      amount,
      tax,
      total,
      currency: 'COP',
      status: InvoiceStatus.PENDING,
      dueDate: dueDate.toISOString(),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      items,
      notes: `Factura generada automáticamente para el período ${periodStart.toLocaleDateString('es-CO')} - ${periodEnd.toLocaleDateString('es-CO')}`,
    };

    return await this.create(createInvoiceDto);
  }

  async findAll(filters?: {
    tenantId?: string;
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Invoice[]> {
    const query = this.invoicesRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tenant', 'tenant')
      .leftJoinAndSelect('invoice.payments', 'payments')
      .orderBy('invoice.createdAt', 'DESC');

    if (filters?.tenantId) {
      query.andWhere('invoice.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('invoice.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('invoice.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tenant', 'tenant')
      .leftJoinAndSelect('invoice.payments', 'payments')
      .leftJoinAndSelect('invoice.taxConfig', 'taxConfig')
      .where('invoice.id = :id', { id })
      .getOne();

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Asegurar que items sea un array
    if (!invoice.items) {
      invoice.items = [];
    }

    return invoice;
  }

  async findByTenant(tenantId: string): Promise<Invoice[]> {
    return await this.invoicesRepository.find({
      where: { tenantId },
      relations: ['payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdue(): Promise<Invoice[]> {
    const now = new Date();
    return await this.invoicesRepository.find({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: LessThan(now),
      },
      relations: ['tenant'],
    });
  }

  async markAsPaid(id: string, paidAt?: Date): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('La factura ya está marcada como pagada');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = paidAt || new Date();

    const updatedInvoice = await this.invoicesRepository.save(invoice);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId: invoice.tenantId,
      action: BillingAction.PAYMENT_RECEIVED,
      description: `Factura ${invoice.invoiceNumber} marcada como pagada`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paidAt: invoice.paidAt,
      },
    });

    return updatedInvoice;
  }

  async markAsOverdue(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.PENDING) {
      return invoice;
    }

    invoice.status = InvoiceStatus.OVERDUE;
    return await this.invoicesRepository.save(invoice);
  }

  async cancel(id: string, reason?: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('No se puede anular una factura pagada');
    }

    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException('La factura ya está anulada');
    }

    invoice.status = InvoiceStatus.VOIDED;
    invoice.cancellationReason = reason || 'Sin motivo especificado';
    invoice.cancelledAt = new Date();

    const cancelledInvoice = await this.invoicesRepository.save(invoice);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId: invoice.tenantId,
      action: BillingAction.INVOICE_CANCELLED,
      description: `Factura ${invoice.invoiceNumber} anulada${reason ? ': ' + reason : ''}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        reason,
        voidedAt: invoice.cancelledAt,
      },
    });

    return cancelledInvoice;
  }

  async resendEmail(id: string): Promise<void> {
    const invoice = await this.findOne(id);

    try {
      await this.mailService.sendInvoiceEmail(invoice.tenant, invoice);
    } catch (error) {
      console.error('Error al reenviar email de factura:', error);
      throw new BadRequestException('No se pudo enviar el email de la factura');
    }
  }

  async updateOverdueStatus(): Promise<number> {
    const overdueInvoices = await this.findOverdue();
    let count = 0;

    for (const invoice of overdueInvoices) {
      await this.markAsOverdue(invoice.id);
      count++;
    }

    return count;
  }

  async getInvoiceStats(): Promise<{
    pending: number;
    overdue: number;
    paid: number;
    cancelled: number;
    total: number;
  }> {
    const [pending, overdue, paid, cancelled, total] = await Promise.all([
      this.invoicesRepository.count({ where: { status: InvoiceStatus.PENDING } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.OVERDUE } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.PAID } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.VOIDED } }),
      this.invoicesRepository.count(),
    ]);

    return { pending, overdue, paid, cancelled, total };
  }

  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return await this.invoicesRepository.find({
      where: { status },
      relations: ['tenant', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar factura por referencia de pago Bold
   */
  async findByReference(reference: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tenant', 'tenant')
      .leftJoinAndSelect('invoice.payments', 'payments')
      .where('invoice.boldPaymentReference = :reference', { reference })
      .getOne();

    if (!invoice) {
      throw new NotFoundException(`Factura con referencia ${reference} no encontrada`);
    }

    return invoice;
  }

  /**
   * Crear link de pago Bold para una factura
   */
  async createPaymentLink(invoiceId: string): Promise<string> {
    const invoice = await this.findOne(invoiceId);

    // Verificar que la factura esté pendiente
    if (invoice.status !== InvoiceStatus.PENDING && invoice.status !== InvoiceStatus.OVERDUE) {
      throw new BadRequestException('Solo se pueden crear links de pago para facturas pendientes o vencidas');
    }

    // Verificar que no tenga ya un link de pago
    if (invoice.boldPaymentLink) {
      this.logger.log(`Factura ${invoice.invoiceNumber} ya tiene un link de pago: ${invoice.boldPaymentLink}`);
      return invoice.boldPaymentLink;
    }

    // Generar referencia única para Bold
    const reference = `INV-${invoice.invoiceNumber}-${Date.now()}`;

    // Crear link de pago en Bold
    const paymentLink = await this.boldService.createPaymentLink({
      amount: invoice.total,
      currency: invoice.currency,
      description: `Factura ${invoice.invoiceNumber} - ${invoice.tenant.name}`,
      reference,
      customerEmail: invoice.tenant.contactEmail,
      customerName: invoice.tenant.name,
      redirectUrl: `${process.env.FRONTEND_URL}/invoices/${invoice.id}/payment-success`,
      expirationDate: invoice.dueDate,
    });

    // Guardar el link y la referencia en la factura
    invoice.boldPaymentLink = paymentLink.url;
    invoice.boldPaymentReference = reference;
    await this.invoicesRepository.save(invoice);

    this.logger.log(`✅ Link de pago creado para factura ${invoice.invoiceNumber}: ${paymentLink.url}`);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId: invoice.tenantId,
      action: BillingAction.PAYMENT_LINK_CREATED,
      description: `Link de pago creado para factura ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        paymentLink: paymentLink.url,
        reference,
      },
    });

    return paymentLink.url;
  }

  /**
   * Activar tenant después de recibir pago
   */
  async activateTenantAfterPayment(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Si el tenant está suspendido, activarlo
    if (tenant.status === TenantStatus.SUSPENDED) {
      tenant.status = TenantStatus.ACTIVE;
      await this.tenantsRepository.save(tenant);

      this.logger.log(`✅ Tenant ${tenant.name} activado automáticamente después del pago`);

      // Registrar en historial
      await this.billingHistoryRepository.save({
        tenantId,
        action: BillingAction.TENANT_ACTIVATED,
        description: `Tenant activado automáticamente después de recibir pago`,
        metadata: {
          previousStatus: TenantStatus.SUSPENDED,
          newStatus: TenantStatus.ACTIVE,
        },
      });
    }
  }

  /**
   * Enviar email de confirmación de pago
   */
  async sendPaymentConfirmation(invoiceId: string): Promise<void> {
    const invoice = await this.findOne(invoiceId);

    // Get the latest payment for this invoice
    const payment = invoice.payments && invoice.payments.length > 0 
      ? invoice.payments[invoice.payments.length - 1] 
      : null;

    try {
      await this.mailService.sendPaymentConfirmationEmail(invoice.tenant, payment, invoice);
      this.logger.log(`✅ Email de confirmación de pago enviado para factura ${invoice.invoiceNumber}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar email de confirmación de pago:`, error);
      // No lanzar error para no interrumpir el flujo de pago
    }
  }

  /**
   * Marcar factura como pagada con ID de pago
   */
  async markAsPaidWithPayment(id: string, paymentId: string, paidAt?: Date): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('La factura ya está marcada como pagada');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = paidAt || new Date();

    const updatedInvoice = await this.invoicesRepository.save(invoice);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId: invoice.tenantId,
      action: BillingAction.PAYMENT_RECEIVED,
      description: `Factura ${invoice.invoiceNumber} marcada como pagada`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paidAt: invoice.paidAt,
        paymentId,
      },
    });

    return updatedInvoice;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
