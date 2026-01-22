import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { BillingHistory, BillingAction } from './entities/billing-history.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(BillingHistory)
    private billingHistoryRepository: Repository<BillingHistory>,
    private invoicesService: InvoicesService,
    private mailService: MailService,
  ) {}

  async generateMonthlyInvoices(): Promise<{ generated: number; errors: string[] }> {
    console.log('[BillingService] Iniciando generación de facturas mensuales...');
    
    const now = new Date();
    const currentDay = now.getDate();

    // Buscar tenants activos cuyo día de facturación coincida con hoy (±1 día de tolerancia)
    const tenants = await this.tenantsRepository
      .createQueryBuilder('tenant')
      .where('tenant.status = :status', { status: TenantStatus.ACTIVE })
      .andWhere('tenant.billingDay BETWEEN :minDay AND :maxDay', {
        minDay: Math.max(1, currentDay - 1),
        maxDay: Math.min(28, currentDay + 1),
      })
      .getMany();

    console.log(`[BillingService] Encontrados ${tenants.length} tenants para facturar (día de corte: ${currentDay})`);

    let generated = 0;
    const errors: string[] = [];

    for (const tenant of tenants) {
      try {
        // Calcular fecha de próxima factura basada en billingDay
        const nextBillingDate = new Date(now);
        nextBillingDate.setDate(tenant.billingDay);
        
        // Si el día de facturación ya pasó este mes, programar para el próximo mes
        if (nextBillingDate < now) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }

        // Verificar si ya existe una factura pendiente para este período
        const periodStart = new Date(now);
        periodStart.setDate(tenant.billingDay);
        if (periodStart > now) {
          periodStart.setMonth(periodStart.getMonth() - 1);
        }

        const periodEnd = new Date(periodStart);
        if (tenant.billingCycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        const existingInvoice = await this.invoicesRepository.findOne({
          where: {
            tenantId: tenant.id,
            status: InvoiceStatus.PENDING,
            periodStart: Between(
              new Date(periodStart.getTime() - 86400000), // -1 día
              new Date(periodStart.getTime() + 86400000), // +1 día
            ),
          },
        });

        if (existingInvoice) {
          console.log(`[BillingService] Tenant ${tenant.name} ya tiene factura pendiente para este período`);
          continue;
        }

        // Generar factura
        await this.invoicesService.generateMonthlyInvoice(tenant);
        generated++;
        console.log(`[BillingService] Factura generada para tenant ${tenant.name} (día de corte: ${tenant.billingDay})`);
      } catch (error) {
        const errorMsg = `Error al generar factura para tenant ${tenant.name}: ${error.message}`;
        console.error(`[BillingService] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[BillingService] Generación completada: ${generated} facturas generadas, ${errors.length} errores`);

    return { generated, errors };
  }

  async suspendOverdueTenants(): Promise<{ suspended: number; errors: string[] }> {
    console.log('[BillingService] Iniciando suspensión de tenants morosos...');

    const gracePeriodDays = parseInt(process.env.BILLING_GRACE_PERIOD_DAYS || '3');
    const now = new Date();
    const gracePeriodDate = new Date(now);
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Buscar facturas vencidas con período de gracia expirado
    const overdueInvoices = await this.invoicesRepository.find({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: LessThan(gracePeriodDate),
      },
      relations: ['tenant'],
    });

    console.log(`[BillingService] Encontradas ${overdueInvoices.length} facturas vencidas`);

    let suspended = 0;
    const errors: string[] = [];

    for (const invoice of overdueInvoices) {
      try {
        const tenant = invoice.tenant;

        // Solo suspender si el tenant está activo
        if (tenant.status !== TenantStatus.ACTIVE) {
          continue;
        }

        // Marcar factura como vencida
        await this.invoicesService.markAsOverdue(invoice.id);

        // Suspender tenant
        tenant.status = TenantStatus.SUSPENDED;
        await this.tenantsRepository.save(tenant);

        // Registrar en historial
        await this.billingHistoryRepository.save({
          tenantId: tenant.id,
          action: BillingAction.TENANT_SUSPENDED,
          description: `Tenant suspendido por falta de pago - Factura ${invoice.invoiceNumber} vencida`,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            dueDate: invoice.dueDate,
            gracePeriodDays,
          },
        });

        // Enviar email de suspensión
        try {
          await this.mailService.sendTenantSuspendedEmail(tenant, invoice);
        } catch (emailError) {
          console.error(`[BillingService] Error al enviar email de suspensión:`, emailError);
        }

        suspended++;
        console.log(`[BillingService] Tenant ${tenant.name} suspendido`);
      } catch (error) {
        const errorMsg = `Error al suspender tenant ${invoice.tenant.name}: ${error.message}`;
        console.error(`[BillingService] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[BillingService] Suspensión completada: ${suspended} tenants suspendidos, ${errors.length} errores`);

    return { suspended, errors };
  }

  async getDashboardStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Ingresos del mes actual
    const monthlyRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.paidAt BETWEEN :start AND :end', {
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      })
      .getRawOne();

    // Facturas pendientes
    const pendingInvoices = await this.invoicesRepository.count({
      where: { status: InvoiceStatus.PENDING },
    });

    // Facturas vencidas
    const overdueInvoices = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: LessThan(now),
      },
    });

    // Facturas pagadas (total)
    const paidInvoices = await this.invoicesRepository.count({
      where: { status: InvoiceStatus.PAID },
    });

    // Facturas canceladas (total)
    const cancelledInvoices = await this.invoicesRepository.count({
      where: { status: InvoiceStatus.VOIDED },
    });

    // Tenants suspendidos
    const suspendedTenants = await this.tenantsRepository.count({
      where: { status: TenantStatus.SUSPENDED },
    });

    // Próximos vencimientos (próximos 7 días)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDue = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: Between(now, sevenDaysFromNow),
      },
    });

    // Ingresos proyectados (facturas pendientes)
    const projectedRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PENDING })
      .getRawOne();

    // Historial de ingresos (últimos 6 meses)
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthRevenue = await this.invoicesRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.paidAt BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .getRawOne();

      revenueHistory.push({
        month: monthStart.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(monthRevenue?.total || '0'),
      });
    }

    return {
      monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      cancelledInvoices,
      suspendedTenants,
      upcomingDue,
      projectedRevenue: parseFloat(projectedRevenue?.total || '0'),
      revenueHistory,
    };
  }

  async getHistory(tenantId?: string, limit: number = 50): Promise<BillingHistory[]> {
    const query = this.billingHistoryRepository.createQueryBuilder('history')
      .leftJoinAndSelect('history.tenant', 'tenant')
      .orderBy('history.createdAt', 'DESC')
      .take(limit);

    if (tenantId) {
      query.where('history.tenantId = :tenantId', { tenantId });
    }

    return await query.getMany();
  }

  /**
   * Suspender cuentas gratuitas con trial expirado
   * Se ejecuta diariamente para verificar cuentas gratuitas que han superado su período de prueba
   */
  async suspendExpiredFreeTrials(): Promise<{ suspended: number; errors: string[] }> {
    console.log('[BillingService] Iniciando suspensión de cuentas gratuitas expiradas...');

    const now = new Date();

    // Buscar tenants con plan gratuito, en estado TRIAL y con trial expirado
    const expiredTrials = await this.tenantsRepository.find({
      where: {
        plan: 'free' as any,
        status: TenantStatus.TRIAL,
        trialEndsAt: LessThan(now),
      },
    });

    console.log(`[BillingService] Encontradas ${expiredTrials.length} cuentas gratuitas expiradas`);

    let suspended = 0;
    const errors: string[] = [];

    for (const tenant of expiredTrials) {
      try {
        // Suspender tenant
        tenant.status = TenantStatus.SUSPENDED;
        await this.tenantsRepository.save(tenant);

        // Registrar en historial
        await this.billingHistoryRepository.save({
          tenantId: tenant.id,
          action: BillingAction.TENANT_SUSPENDED,
          description: `Cuenta gratuita suspendida - Trial de 7 días expirado`,
          metadata: {
            plan: tenant.plan,
            trialEndsAt: tenant.trialEndsAt,
            daysExpired: Math.floor((now.getTime() - tenant.trialEndsAt.getTime()) / (1000 * 60 * 60 * 24)),
          },
        });

        suspended++;
        console.log(`[BillingService] Tenant ${tenant.name} (${tenant.slug}) suspendido - Trial expirado`);
      } catch (error) {
        const errorMsg = `Error al suspender tenant ${tenant.id}: ${error.message}`;
        console.error(`[BillingService] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[BillingService] Suspensión completada: ${suspended} tenants suspendidos, ${errors.length} errores`);

    return { suspended, errors };
  }
}
