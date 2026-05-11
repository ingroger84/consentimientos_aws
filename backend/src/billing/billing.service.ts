import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private invoicesService: InvoicesService,
    private mailService: MailService,
  ) {}

  // LOCK para prevenir ejecuciones concurrentes
  private isGeneratingInvoices = false;

  async generateMonthlyInvoices(): Promise<{ generated: number; errors: string[] }> {
    // Prevenir ejecuciones concurrentes
    if (this.isGeneratingInvoices) {
      console.log('[BillingService] Ya hay una generación de facturas en progreso - omitiendo');
      return { generated: 0, errors: [] };
    }

    this.isGeneratingInvoices = true;

    try {
      console.log('[BillingService] Iniciando generación de facturas mensuales...');
      
      const now = new Date();
      const currentDay = now.getDate();

      // Buscar tenants activos cuyo día de facturación coincida con hoy (±1 día de tolerancia)
      // EXCLUIR: tenants con plan gratuito o en período de prueba
      const tenants = await this.tenantsRepository
        .createQueryBuilder('tenant')
        .where('tenant.status = :status', { status: TenantStatus.ACTIVE })
        .andWhere('tenant.billingDay BETWEEN :minDay AND :maxDay', {
          minDay: Math.max(1, currentDay - 1),
          maxDay: Math.min(28, currentDay + 1),
        })
        .andWhere('tenant.plan != :freePlan', { freePlan: 'free' })
        .getMany();

      console.log(`[BillingService] Encontrados ${tenants.length} tenants para facturar (día de corte: ${currentDay})`);

      let generated = 0;
      const errors: string[] = [];
      let skipped = 0;

      for (const tenant of tenants) {
        try {
          // Verificación adicional: No generar facturas para planes gratuitos o en trial
          if (tenant.plan === 'free') {
            console.log(`[BillingService] Tenant ${tenant.name} tiene plan gratuito - omitiendo facturación`);
            skipped++;
            continue;
          }

          // Si el tenant tiene trialEndsAt y aún está en período de prueba, no facturar
          if (tenant.trialEndsAt && tenant.trialEndsAt > now) {
            console.log(`[BillingService] Tenant ${tenant.name} está en período de prueba hasta ${tenant.trialEndsAt.toISOString()} - omitiendo facturación`);
            skipped++;
            continue;
          }

          // Calcular fecha de próxima factura basada en billingDay
          const nextBillingDate = new Date(now);
          nextBillingDate.setDate(tenant.billingDay);
          
          // Si el día de facturación ya pasó este mes, programar para el próximo mes
          if (nextBillingDate < now) {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }

          // Verificar si ya existe una factura para este período (mismo mes/año)
          const periodStart = new Date(now);
          periodStart.setDate(tenant.billingDay);
          if (periodStart > now) {
            periodStart.setMonth(periodStart.getMonth() - 1);
          }
          periodStart.setHours(0, 0, 0, 0);

          const periodEnd = new Date(periodStart);
          if (tenant.billingCycle === 'annual') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }
          periodEnd.setHours(0, 0, 0, 0);

          // Buscar cualquier factura (pending, paid, overdue) para este período exacto
          // Sin lock pesimista para evitar error de transacción
          const existingInvoice = await this.invoicesRepository
            .createQueryBuilder('invoice')
            .where('invoice.tenantId = :tenantId', { tenantId: tenant.id })
            .andWhere('invoice.periodStart = :periodStart', { periodStart })
            .andWhere('invoice.periodEnd = :periodEnd', { periodEnd })
            .getOne();

          if (existingInvoice) {
            console.log(`[BillingService] Tenant ${tenant.name} ya tiene factura para este período (${existingInvoice.invoiceNumber}, estado: ${existingInvoice.status})`);
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

      console.log(`[BillingService] Generación completada: ${generated} facturas generadas, ${skipped} omitidas (plan gratuito/trial), ${errors.length} errores`);

      return { generated, errors };
    } finally {
      this.isGeneratingInvoices = false;
    }
  }

  async suspendOverdueTenants(): Promise<{ suspended: number; errors: string[] }> {
    console.log('[BillingService] Iniciando suspensión de tenants morosos...');
    
    const now = new Date();
    let suspended = 0;
    const errors: string[] = [];
    const suspendedList: any[] = [];

    // NUEVA REGLA: Buscar facturas con más de 1 día después de creación
    // Día 0: Factura generada
    // Día 1: Día de gracia
    // Día 2: Suspensión si no hay pago
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    oneDayAgo.setHours(0, 0, 0, 0); // Inicio del día de ayer

    const overdueInvoices = await this.invoicesRepository.find({
      where: {
        status: InvoiceStatus.PENDING,
        createdAt: LessThanOrEqual(oneDayAgo),
      },
      relations: ['tenant'],
    });

    console.log(`[BillingService] Encontradas ${overdueInvoices.length} facturas pendientes con más de 1 día de antigüedad`);

    for (const invoice of overdueInvoices) {
      try {
        const tenant = invoice.tenant;

        // Solo suspender si el tenant está activo
        if (tenant.status === TenantStatus.ACTIVE) {
          // Actualizar estado del tenant
          tenant.status = TenantStatus.SUSPENDED;
          tenant.suspendedAt = now;
          await this.tenantsRepository.save(tenant);

          // Actualizar estado de la factura
          invoice.status = InvoiceStatus.OVERDUE;
          await this.invoicesRepository.save(invoice);

          suspended++;
          console.log(`[BillingService] Tenant ${tenant.name} suspendido por factura vencida (${invoice.invoiceNumber})`);

          // 🔔 Enviar notificación al super admin
          try {
            const daysOverdue = Math.floor((now.getTime() - new Date(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            await this.mailService.sendTenantSuspendedAlertToAdmin(tenant, invoice);
            
            // Agregar a la lista para el resumen diario
            suspendedList.push({
              tenantName: tenant.name,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.total,
              daysOverdue,
            });
          } catch (emailError) {
            console.error(`[BillingService] Error al enviar notificación de suspensión al admin:`, emailError);
            // No lanzar error para no interrumpir el proceso de suspensión
          }
        }
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
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular inicio y fin del mes actual
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Total de facturas del mes actual
    const totalInvoices = await this.invoicesRepository.count({
      where: {
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Facturas pendientes
    const pendingInvoices = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.PENDING,
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Facturas pagadas
    const paidInvoices = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.PAID,
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Facturas vencidas
    const overdueInvoices = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.OVERDUE,
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Facturas canceladas
    const cancelledInvoices = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.VOIDED,
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Ingresos del mes (facturas pagadas)
    const monthlyRevenueResult = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.createdAt BETWEEN :start AND :end', {
        start: monthStart,
        end: monthEnd,
      })
      .getRawOne();

    const monthlyRevenue = parseFloat(monthlyRevenueResult?.total || '0');

    // Ingresos totales (todas las facturas pagadas)
    const totalRevenueResult = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    // Ingresos proyectados (facturas pendientes + vencidas)
    const projectedRevenueResult = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status IN (:...statuses)', { 
        statuses: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
      })
      .getRawOne();

    const projectedRevenue = parseFloat(projectedRevenueResult?.total || '0');

    // Próximos vencimientos (7 días)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDue = await this.invoicesRepository.count({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: Between(now, sevenDaysFromNow),
      },
    });

    // Tenants activos
    const activeTenants = await this.tenantsRepository.count({
      where: {
        status: TenantStatus.ACTIVE,
      },
    });

    // Tenants suspendidos
    const suspendedTenants = await this.tenantsRepository.count({
      where: {
        status: TenantStatus.SUSPENDED,
      },
    });

    // Tenants en trial
    const trialTenants = await this.tenantsRepository
      .createQueryBuilder('tenant')
      .where('tenant.trialEndsAt > :now', { now })
      .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
      .getCount();

    // Historial de ingresos (últimos 6 meses)
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthEndDate = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59);
      
      const monthRevenueResult = await this.invoicesRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.createdAt BETWEEN :start AND :end', {
          start: monthDate,
          end: monthEndDate,
        })
        .getRawOne();

      const monthRevenue = parseFloat(monthRevenueResult?.total || '0');
      
      revenueHistory.push({
        month: monthDate.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
      });
    }

    return {
      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        paid: paidInvoices,
        overdue: overdueInvoices,
      },
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue,
      },
      tenants: {
        active: activeTenants,
        suspended: suspendedTenants,
        trial: trialTenants,
      },
      // Campos adicionales que espera el frontend
      monthlyRevenue,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      cancelledInvoices,
      suspendedTenants,
      upcomingDue,
      projectedRevenue,
      revenueHistory,
    };
  }

  async getHistory(tenantId?: string, limit: number = 50): Promise<BillingHistory[]> {
    const query = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.tenant', 'tenant')
      .addSelect(['tenant.id', 'tenant.name'])
      .orderBy('invoice.createdAt', 'DESC')
      .take(limit);

    if (tenantId) {
      query.where('invoice.tenantId = :tenantId', { tenantId });
    }

    const invoices = await query.getMany();

    return invoices.map(invoice => ({
      id: invoice.id,
      tenantName: invoice.tenant?.name || 'N/A',
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      createdAt: invoice.createdAt,
    }));
  }

  async suspendExpiredFreeTrials(): Promise<{ suspended: number; errors: string[] }> {
    console.log('[BillingService] Iniciando suspensión de cuentas gratuitas expiradas...');
    
    const now = new Date();
    let suspended = 0;
    const errors: string[] = [];

    // Buscar tenants con trial expirado
    const expiredTrials = await this.tenantsRepository
      .createQueryBuilder('tenant')
      .where('tenant.trialEndsAt < :now', { now })
      .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
      .andWhere('tenant.plan = :plan', { plan: 'free' })
      .getMany();

    console.log(`[BillingService] Encontrados ${expiredTrials.length} trials expirados`);

    for (const tenant of expiredTrials) {
      try {
        tenant.status = TenantStatus.SUSPENDED;
        tenant.suspendedAt = now;
        await this.tenantsRepository.save(tenant);

        suspended++;
        console.log(`[BillingService] Tenant ${tenant.name} suspendido por trial expirado`);
      } catch (error) {
        const errorMsg = `Error al suspender tenant ${tenant.name}: ${error.message}`;
        console.error(`[BillingService] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[BillingService] Suspensión completada: ${suspended} tenants suspendidos, ${errors.length} errores`);

    return { suspended, errors };
  }
}

export interface BillingHistory {
  id: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
}
