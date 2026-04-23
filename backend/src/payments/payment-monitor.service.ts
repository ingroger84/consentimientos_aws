import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { BoldService } from './bold.service';
import { PaymentsService } from './payments.service';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';

export interface PendingPaymentLink {
  invoiceId: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  boldPaymentLink: string;
  boldPaymentReference: string;
  amount: number;
  createdAt: Date;
  minutesSinceCreation: number;
}

@Injectable()
export class PaymentMonitorService {
  private readonly logger = new Logger(PaymentMonitorService.name);
  private readonly monitoredLinks = new Map<string, Date>(); // invoiceId -> lastChecked

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private boldService: BoldService,
    private paymentsService: PaymentsService,
    private invoicesService: InvoicesService,
    private mailService: MailService,
  ) {}

  /**
   * Cron job que se ejecuta cada 2 minutos para verificar pagos pendientes
   * Esto actúa como respaldo cuando los webhooks no llegan
   */
  @Cron('*/2 * * * *')
  async checkPendingPayments(): Promise<void> {
    try {
      this.logger.log('🔍 Iniciando verificación de pagos pendientes...');

      // Buscar facturas con link de pago pero sin pagar
      // Solo las creadas en las últimas 24 horas
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const pendingInvoices = await this.invoicesRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.tenant', 'tenant')
        .where('invoice.status IN (:...statuses)', { 
          statuses: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
        })
        .andWhere('invoice.boldPaymentLink IS NOT NULL')
        .andWhere('invoice.boldPaymentReference IS NOT NULL')
        .andWhere('invoice.createdAt >= :since', { since: twentyFourHoursAgo })
        .getMany();

      if (pendingInvoices.length === 0) {
        this.logger.log('✅ No hay pagos pendientes para verificar');
        return;
      }

      this.logger.log(`📋 Encontradas ${pendingInvoices.length} facturas con links de pago pendientes`);

      let checkedCount = 0;
      let paidCount = 0;
      let errorCount = 0;

      for (const invoice of pendingInvoices) {
        try {
          // Extraer el payment link ID del URL
          const paymentLinkId = this.extractPaymentLinkId(invoice.boldPaymentLink);
          
          if (!paymentLinkId) {
            this.logger.warn(`⚠️ No se pudo extraer payment link ID de: ${invoice.boldPaymentLink}`);
            continue;
          }

          // Verificar si ya lo revisamos recientemente (últimos 5 minutos)
          const lastChecked = this.monitoredLinks.get(invoice.id);
          if (lastChecked) {
            const minutesSinceLastCheck = (Date.now() - lastChecked.getTime()) / 1000 / 60;
            if (minutesSinceLastCheck < 5) {
              continue; // Skip, lo revisamos hace poco
            }
          }

          this.logger.log(`🔍 Verificando estado de pago: ${invoice.invoiceNumber} (${paymentLinkId})`);

          // Consultar estado en Bold
          const paymentStatus = await this.boldService.getPaymentStatus(paymentLinkId);

          // Actualizar timestamp de última verificación
          this.monitoredLinks.set(invoice.id, new Date());

          checkedCount++;

          // Si el pago fue exitoso, procesarlo
          if (paymentStatus.status === 'APPROVED' || paymentStatus.status === 'approved') {
            this.logger.log(`💰 ¡Pago detectado! Procesando factura ${invoice.invoiceNumber}`);

            // Procesar el pago manualmente
            await this.paymentsService.create({
              amount: invoice.total,
              paymentMethod: 'other' as any,
              paymentDate: paymentStatus.paidAt?.toISOString() || new Date().toISOString(),
              invoiceId: invoice.id,
              tenantId: invoice.tenantId,
              notes: `Pago detectado por sistema de monitoreo - Bold Payment Link: ${paymentLinkId} - Webhook no recibido`,
              boldTransactionId: paymentLinkId,
              boldPaymentMethod: paymentStatus.paymentMethod || 'Bold Checkout',
              boldPaymentData: {
                ...paymentStatus,
                detectedByMonitoring: true,
                detectedAt: new Date().toISOString(),
              },
            });

            paidCount++;

            // Enviar alerta al Super Admin
            await this.sendPaymentDetectedAlert(invoice, paymentLinkId);

            this.logger.log(`✅ Pago procesado exitosamente para factura ${invoice.invoiceNumber}`);
          }

        } catch (error) {
          errorCount++;
          this.logger.error(`❌ Error al verificar factura ${invoice.invoiceNumber}:`, error.message);
        }
      }

      this.logger.log(`✅ Verificación completada:`);
      this.logger.log(`   - Facturas verificadas: ${checkedCount}`);
      this.logger.log(`   - Pagos detectados: ${paidCount}`);
      this.logger.log(`   - Errores: ${errorCount}`);

      // Limpiar links antiguos del mapa (más de 24 horas)
      this.cleanupOldMonitoredLinks();

    } catch (error) {
      this.logger.error('❌ Error en verificación de pagos pendientes:', error);
    }
  }

  /**
   * Verificar pagos que llevan mucho tiempo sin procesarse
   * Se ejecuta 1 vez al día a las 9:00 AM (hora Colombia UTC-5)
   * Envía un solo correo consolidado con todos los pagos atascados
   */
  @Cron('0 9 * * *', {
    timeZone: 'America/Bogota',
  })
  async checkStuckPayments(): Promise<void> {
    try {
      this.logger.log('🔍 Verificación diaria de pagos atascados (9:00 AM Colombia)...');

      // Buscar facturas con link de pago creado hace más de 1 hora pero sin pagar
      // Solo las creadas en las últimas 7 días
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const stuckInvoices = await this.invoicesRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.tenant', 'tenant')
        .where('invoice.status IN (:...statuses)', { 
          statuses: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
        })
        .andWhere('invoice.boldPaymentLink IS NOT NULL')
        .andWhere('invoice.createdAt <= :oneHourAgo', { oneHourAgo })
        .andWhere('invoice.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .orderBy('invoice.tenant.name', 'ASC')
        .addOrderBy('invoice.createdAt', 'DESC')
        .getMany();

      if (stuckInvoices.length > 0) {
        this.logger.warn(`⚠️ Encontradas ${stuckInvoices.length} facturas con pagos atascados`);
        
        // Agrupar por tenant para mejor visualización
        const byTenant = new Map<string, Invoice[]>();
        for (const invoice of stuckInvoices) {
          const tenantName = invoice.tenant?.name || 'Desconocido';
          if (!byTenant.has(tenantName)) {
            byTenant.set(tenantName, []);
          }
          byTenant.get(tenantName).push(invoice);
        }

        this.logger.log(`📊 Pagos atascados por tenant:`);
        for (const [tenantName, invoices] of byTenant.entries()) {
          this.logger.log(`   - ${tenantName}: ${invoices.length} factura(s)`);
        }
        
        // Enviar UN SOLO correo consolidado al Super Admin
        await this.sendStuckPaymentsAlert(stuckInvoices);
        
        this.logger.log('✅ Correo de reporte diario enviado');
      } else {
        this.logger.log('✅ No hay pagos atascados - Todo en orden');
      }

    } catch (error) {
      this.logger.error('❌ Error al verificar pagos atascados:', error);
    }
  }

  /**
   * Obtener lista de pagos pendientes para el dashboard
   */
  async getPendingPaymentLinks(): Promise<PendingPaymentLink[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pendingInvoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tenant', 'tenant')
      .where('invoice.status IN (:...statuses)', { 
        statuses: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
      })
      .andWhere('invoice.boldPaymentLink IS NOT NULL')
      .andWhere('invoice.createdAt >= :since', { since: twentyFourHoursAgo })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();

    return pendingInvoices.map(invoice => {
      const minutesSinceCreation = Math.floor(
        (Date.now() - invoice.createdAt.getTime()) / 1000 / 60
      );

      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        tenantId: invoice.tenantId,
        tenantName: invoice.tenant?.name || 'Desconocido',
        boldPaymentLink: invoice.boldPaymentLink,
        boldPaymentReference: invoice.boldPaymentReference,
        amount: invoice.total,
        createdAt: invoice.createdAt,
        minutesSinceCreation,
      };
    });
  }

  /**
   * Verificar manualmente el estado de un pago específico
   */
  async checkPaymentStatus(invoiceId: string): Promise<{
    success: boolean;
    message: string;
    paymentStatus?: any;
  }> {
    try {
      const invoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId },
        relations: ['tenant'],
      });

      if (!invoice) {
        return {
          success: false,
          message: 'Factura no encontrada',
        };
      }

      if (!invoice.boldPaymentLink) {
        return {
          success: false,
          message: 'Esta factura no tiene un link de pago de Bold',
        };
      }

      const paymentLinkId = this.extractPaymentLinkId(invoice.boldPaymentLink);
      
      if (!paymentLinkId) {
        return {
          success: false,
          message: 'No se pudo extraer el ID del link de pago',
        };
      }

      this.logger.log(`🔍 Verificación manual de pago: ${invoice.invoiceNumber}`);

      const paymentStatus = await this.boldService.getPaymentStatus(paymentLinkId);

      // Si está pagado, procesarlo
      if (paymentStatus.status === 'APPROVED' || paymentStatus.status === 'approved') {
        await this.paymentsService.create({
          amount: invoice.total,
          paymentMethod: 'other' as any,
          paymentDate: paymentStatus.paidAt?.toISOString() || new Date().toISOString(),
          invoiceId: invoice.id,
          tenantId: invoice.tenantId,
          notes: `Pago verificado manualmente - Bold Payment Link: ${paymentLinkId}`,
          boldTransactionId: paymentLinkId,
          boldPaymentMethod: paymentStatus.paymentMethod || 'Bold Checkout',
          boldPaymentData: {
            ...paymentStatus,
            manualVerification: true,
            verifiedAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: 'Pago detectado y procesado exitosamente',
          paymentStatus,
        };
      }

      return {
        success: true,
        message: `Estado del pago: ${paymentStatus.status}`,
        paymentStatus,
      };

    } catch (error) {
      this.logger.error('❌ Error al verificar estado de pago:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  /**
   * Extraer el payment link ID del URL de Bold
   */
  private extractPaymentLinkId(url: string): string | null {
    if (!url) return null;
    
    // Formato: https://checkout.bold.co/payment/LNK_XXXXXX
    const match = url.match(/LNK_[A-Z0-9]+/i);
    return match ? match[0] : null;
  }

  /**
   * Limpiar links monitoreados antiguos
   */
  private cleanupOldMonitoredLinks(): void {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const [invoiceId, lastChecked] of this.monitoredLinks.entries()) {
      if (lastChecked.getTime() < twentyFourHoursAgo) {
        this.monitoredLinks.delete(invoiceId);
      }
    }
  }

  /**
   * Enviar alerta cuando se detecta un pago por monitoreo
   */
  private async sendPaymentDetectedAlert(invoice: Invoice, paymentLinkId: string): Promise<void> {
    try {
      await this.mailService.sendPaymentMonitoringAlert({
        invoiceNumber: invoice.invoiceNumber,
        tenantName: invoice.tenant?.name || 'Desconocido',
        amount: invoice.total,
        paymentLinkId,
        message: 'El sistema de monitoreo detectó un pago que no fue procesado por webhook',
      });
    } catch (error) {
      this.logger.error('Error al enviar alerta de pago detectado:', error);
    }
  }

  /**
   * Enviar alerta de pagos atascados
   */
  private async sendStuckPaymentsAlert(invoices: Invoice[]): Promise<void> {
    try {
      const pendingLinks = invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        tenantName: inv.tenant?.name || 'Desconocido',
        amount: inv.total,
        minutesSinceCreation: Math.floor(
          (Date.now() - inv.createdAt.getTime()) / 1000 / 60
        ),
        boldPaymentLink: inv.boldPaymentLink,
      }));

      await this.mailService.sendStuckPaymentsAlert(pendingLinks);
    } catch (error) {
      this.logger.error('Error al enviar alerta de pagos atascados:', error);
    }
  }
}
