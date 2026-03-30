import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { TaxConfig } from './entities/tax-config.entity';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { BillingHistory, BillingAction } from '../billing/entities/billing-history.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { TaxConfigService } from './tax-config.service';
import { MailService } from '../mail/mail.service';
import { BoldService } from '../payments/bold.service';
import { PaymentAttemptsService } from '../payments/payment-attempts.service';
import { PaymentAttemptStatus } from '../payments/entities/payment-attempt.entity';
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
    private paymentAttemptsService: PaymentAttemptsService,
    private configService: ConfigService,
    private dataSource: DataSource,
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

    // Retornar la factura con todas las relaciones cargadas
    return this.findOne(savedInvoice.id);
  }

  async generateMonthlyInvoice(tenant: Tenant): Promise<Invoice> {
    // Obtener configuración del plan
    const planConfig = getPlanConfig(tenant.plan);
    if (!planConfig) {
      throw new BadRequestException(`Plan ${tenant.plan} no encontrado`);
    }

    // Calcular precio según ciclo de facturación
    // Si el tenant tiene precios personalizados, usarlos; de lo contrario, usar los del plan
    let amount: number;
    if (tenant.useCustomPrice) {
      if (tenant.billingCycle === 'annual' && tenant.customPriceAnnual) {
        amount = tenant.customPriceAnnual;
        this.logger.log(`✅ Usando precio anual personalizado para tenant ${tenant.name}: ${amount}`);
      } else if (tenant.billingCycle === 'monthly' && tenant.customPriceMonthly) {
        amount = tenant.customPriceMonthly;
        this.logger.log(`✅ Usando precio mensual personalizado para tenant ${tenant.name}: ${amount}`);
      } else {
        // Fallback al precio del plan si no hay precio personalizado configurado
        amount = calculatePrice(tenant.plan, tenant.billingCycle);
        this.logger.warn(`⚠️ Tenant ${tenant.name} tiene useCustomPrice=true pero no tiene precio personalizado configurado. Usando precio del plan.`);
      }
    } else {
      amount = calculatePrice(tenant.plan, tenant.billingCycle);
    }

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
      .leftJoinAndSelect('tenant.documentType', 'documentType')
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
      .leftJoinAndSelect('tenant.documentType', 'documentType')
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
    return await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tenant', 'tenant')
      .leftJoinAndSelect('tenant.documentType', 'documentType')
      .leftJoinAndSelect('invoice.payments', 'payments')
      .where('invoice.tenantId = :tenantId', { tenantId })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async getPublicPendingInvoices(tenantSlug: string): Promise<{ invoices: Invoice[]; tenantName: string }> {
    // Buscar el tenant por slug
    const tenant = await this.dataSource
      .getRepository(Tenant)
      .findOne({ where: { slug: tenantSlug } });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Obtener solo facturas pendientes o vencidas
    const invoices = await this.invoicesRepository.find({
      where: {
        tenantId: tenant.id,
        status: In(['pending', 'overdue']),
      },
      order: {
        dueDate: 'ASC',
      },
    });

    return {
      invoices,
      tenantName: tenant.name,
    };
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
   * Con soporte para regeneración automática si el link anterior falló
   */
  async createPaymentLink(invoiceId: string): Promise<string> {
    const invoice = await this.findOne(invoiceId);

    // Verificar que la factura esté pendiente
    if (invoice.status !== InvoiceStatus.PENDING && invoice.status !== InvoiceStatus.OVERDUE) {
      throw new BadRequestException('Solo se pueden crear links de pago para facturas pendientes o vencidas');
    }

    // Verificar si se puede realizar un nuevo intento
    const retryCheck = await this.paymentAttemptsService.canRetryPayment(invoiceId);
    
    if (!retryCheck.canRetry) {
      this.logger.error(`❌ No se puede crear link de pago para factura ${invoice.invoiceNumber}`);
      this.logger.error(`   Razón: ${retryCheck.reason}`);
      this.logger.error(`   Intentos: ${retryCheck.attemptsCount}/${retryCheck.maxAttempts}`);
      
      throw new BadRequestException(
        `No se puede generar un nuevo link de pago. ${retryCheck.reason}. ` +
        `Intentos realizados: ${retryCheck.attemptsCount}/${retryCheck.maxAttempts}`
      );
    }

    // Función para validar si un link de Bold es válido
    const isValidBoldLink = (link: string): boolean => {
      if (!link) return false;
      
      // Verificar que no contenga "undefined"
      if (link.includes('undefined')) return false;
      
      // Verificar que tenga el formato correcto de Bold API Link de Pagos
      // Formato esperado: https://checkout.bold.co/payment/LNK_XXXXXX
      const boldLinkPattern = /^https:\/\/checkout\.bold\.co\/payment\/LNK_[A-Z0-9]+$/i;
      
      if (!boldLinkPattern.test(link)) {
        this.logger.warn(`⚠️ Link de pago con formato inválido detectado: ${link}`);
        this.logger.warn(`   Formato esperado: https://checkout.bold.co/payment/LNK_XXXXXX`);
        return false;
      }
      
      return true;
    };

    // Verificar si hay un link activo y válido
    const shouldRegenerateLink = 
      !invoice.boldPaymentLink || 
      !isValidBoldLink(invoice.boldPaymentLink) ||
      invoice.boldPaymentLinkStatus === 'failed' ||
      invoice.boldPaymentLinkStatus === 'expired';

    if (!shouldRegenerateLink && invoice.boldPaymentLinkStatus === 'active') {
      this.logger.log(`✅ Factura ${invoice.invoiceNumber} ya tiene un link de pago válido: ${invoice.boldPaymentLink}`);
      return invoice.boldPaymentLink;
    }

    // Si el link es inválido o falló, regenerarlo
    if (shouldRegenerateLink) {
      this.logger.log(`🔄 Regenerando link de pago para factura ${invoice.invoiceNumber}`);
      this.logger.log(`   Razón: ${
        !invoice.boldPaymentLink 
          ? 'No existe link' 
          : invoice.boldPaymentLinkStatus === 'failed'
          ? 'Link anterior falló'
          : invoice.boldPaymentLinkStatus === 'expired'
          ? 'Link expirado'
          : 'Link inválido'
      }`);
      this.logger.log(`   Intentos previos: ${invoice.paymentAttemptsCount || 0}/${retryCheck.maxAttempts}`);
    }

    // Generar referencia única para Bold
    const attemptNumber = (invoice.paymentAttemptsCount || 0) + 1;
    const reference = `INV-${invoice.invoiceNumber}-${Date.now()}-A${attemptNumber}`;

    // Generar URL de redirección usando el slug del tenant
    const baseUrl = this.configService.get('FRONTEND_BASE_URL') || 'https://archivoenlinea.com';
    const tenantSlug = invoice.tenant.slug;
    const redirectUrl = `https://${tenantSlug}.archivoenlinea.com/invoices/${invoice.id}/payment-success`;

    this.logger.log(`🔗 Generando link de pago para tenant: ${tenantSlug}`);
    this.logger.log(`   Intento: ${attemptNumber}/${retryCheck.maxAttempts}`);
    this.logger.log(`   Redirect URL: ${redirectUrl}`);

    // Crear link de pago en Bold
    const paymentLink = await this.boldService.createPaymentLink({
      amount: invoice.total,
      currency: invoice.currency,
      description: `Factura ${invoice.invoiceNumber} - ${invoice.tenant.name} (Intento ${attemptNumber})`,
      reference,
      customerEmail: invoice.tenant.contactEmail,
      customerName: invoice.tenant.name,
      redirectUrl,
      expirationDate: invoice.dueDate,
    });

    // Guardar el link y la referencia en la factura
    invoice.boldPaymentLink = paymentLink.url;
    invoice.boldPaymentReference = reference;
    invoice.boldPaymentLinkStatus = 'active';
    await this.invoicesRepository.save(invoice);

    // Registrar el intento de pago
    await this.paymentAttemptsService.createAttempt({
      invoiceId: invoice.id,
      boldPaymentLink: paymentLink.url,
      boldPaymentReference: reference,
      boldPaymentLinkId: paymentLink.id,
      status: PaymentAttemptStatus.PENDING,
      boldResponse: paymentLink,
    });

    this.logger.log(`✅ Link de pago creado para factura ${invoice.invoiceNumber}`);
    this.logger.log(`   URL: ${paymentLink.url}`);
    this.logger.log(`   Link ID: ${paymentLink.id}`);
    this.logger.log(`   Intento: ${attemptNumber}/${retryCheck.maxAttempts}`);

    // Registrar en historial
    await this.billingHistoryRepository.save({
      tenantId: invoice.tenantId,
      action: BillingAction.PAYMENT_LINK_CREATED,
      description: `Link de pago creado para factura ${invoice.invoiceNumber} (Intento ${attemptNumber})`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        paymentLink: paymentLink.url,
        reference,
        attemptNumber,
        maxAttempts: retryCheck.maxAttempts,
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

  /**
   * Obtener historial de intentos de pago de una factura
   */
  async getPaymentAttempts(invoiceId: string): Promise<any[]> {
    const attempts = await this.paymentAttemptsService.findByInvoice(invoiceId);
    
    return attempts.map(attempt => ({
      id: attempt.id,
      status: attempt.status,
      failureReason: attempt.failureReason,
      attemptedAt: attempt.attemptedAt,
      boldPaymentLinkId: attempt.boldPaymentLinkId,
    }));
  }

  /**
   * Regenerar link de pago (endpoint público para reintentos)
   */
  async regeneratePaymentLink(invoiceId: string): Promise<{
    paymentLink: string;
    attemptNumber: number;
    maxAttempts: number;
  }> {
    const invoice = await this.findOne(invoiceId);

    // Verificar si se puede reintentar
    const retryCheck = await this.paymentAttemptsService.canRetryPayment(invoiceId);
    
    if (!retryCheck.canRetry) {
      throw new BadRequestException(retryCheck.reason);
    }

    // Marcar el link anterior como expirado
    if (invoice.boldPaymentLink) {
      invoice.boldPaymentLinkStatus = 'expired';
      await this.invoicesRepository.save(invoice);
      
      this.logger.log(`🔄 Link anterior marcado como expirado para factura ${invoice.invoiceNumber}`);
    }

    // Generar nuevo link
    const newPaymentLink = await this.createPaymentLink(invoiceId);

    return {
      paymentLink: newPaymentLink,
      attemptNumber: retryCheck.attemptsCount + 1,
      maxAttempts: retryCheck.maxAttempts,
    };
  }

  /**
   * Marcar link de pago como fallido
   */
  async markPaymentLinkAsFailed(invoiceId: string): Promise<void> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    invoice.boldPaymentLinkStatus = 'failed';
    await this.invoicesRepository.save(invoice);

    this.logger.log(`❌ Link de pago marcado como fallido para factura ${invoice.invoiceNumber}`);
    this.logger.log(`   Intentos realizados: ${invoice.paymentAttemptsCount || 0}/6`);
  }

  /**
   * Marcar link de pago como exitoso
   */
  async markPaymentLinkAsSucceeded(invoiceId: string): Promise<void> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    invoice.boldPaymentLinkStatus = 'succeeded';
    await this.invoicesRepository.save(invoice);

    this.logger.log(`✅ Link de pago marcado como exitoso para factura ${invoice.invoiceNumber}`);
  }
