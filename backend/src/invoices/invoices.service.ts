import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { TaxConfig } from './entities/tax-config.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { BillingHistory, BillingAction } from '../billing/entities/billing-history.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { TaxConfigService } from './tax-config.service';
import { MailService } from '../mail/mail.service';
import { getPlanConfig, calculatePrice } from '../tenants/plans.config';

@Injectable()
export class InvoicesService {
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
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { tenantId, taxConfigId, ...invoiceData } = createInvoiceDto;

    // Verificar que el tenant existe
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Si no se proporciona taxConfigId, usar el por defecto
    let finalTaxConfigId = taxConfigId;
    if (!finalTaxConfigId) {
      const defaultTaxConfig = await this.taxConfigService.findDefault();
      if (defaultTaxConfig) {
        finalTaxConfigId = defaultTaxConfig.id;
      }
    }

    // Crear la factura
    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      tenantId,
      taxConfigId: finalTaxConfigId,
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

    if (taxConfig) {
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

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
