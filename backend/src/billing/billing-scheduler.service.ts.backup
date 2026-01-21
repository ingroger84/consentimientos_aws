import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { PaymentReminderService } from './payment-reminder.service';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    private billingService: BillingService,
    private paymentReminderService: PaymentReminderService,
  ) {}

  // Generar facturas mensuales - Diario a las 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleGenerateInvoices() {
    this.logger.log('Ejecutando tarea: Generar facturas mensuales');
    
    try {
      const result = await this.billingService.generateMonthlyInvoices();
      this.logger.log(`Facturas generadas: ${result.generated}`);
      
      if (result.errors.length > 0) {
        this.logger.error(`Errores al generar facturas: ${result.errors.length}`);
        result.errors.forEach(error => this.logger.error(error));
      }
    } catch (error) {
      this.logger.error('Error al ejecutar generación de facturas:', error);
    }
  }

  // Enviar recordatorios de pago - Diario a las 09:00
  @Cron('0 9 * * *')
  async handleSendReminders() {
    this.logger.log('Ejecutando tarea: Enviar recordatorios de pago');
    
    try {
      const result = await this.paymentReminderService.sendScheduledReminders();
      this.logger.log(`Recordatorios enviados: ${result.sent}`);
      
      if (result.errors.length > 0) {
        this.logger.error(`Errores al enviar recordatorios: ${result.errors.length}`);
        result.errors.forEach(error => this.logger.error(error));
      }
    } catch (error) {
      this.logger.error('Error al ejecutar envío de recordatorios:', error);
    }
  }

  // Suspender tenants morosos - Diario a las 23:00
  @Cron('0 23 * * *')
  async handleSuspendOverdue() {
    this.logger.log('Ejecutando tarea: Suspender tenants morosos');
    
    try {
      const result = await this.billingService.suspendOverdueTenants();
      this.logger.log(`Tenants suspendidos: ${result.suspended}`);
      
      if (result.errors.length > 0) {
        this.logger.error(`Errores al suspender tenants: ${result.errors.length}`);
        result.errors.forEach(error => this.logger.error(error));
      }
    } catch (error) {
      this.logger.error('Error al ejecutar suspensión de tenants:', error);
    }
  }

  // Limpiar recordatorios antiguos - Domingos a las 02:00
  @Cron('0 2 * * 0')
  async handleCleanupReminders() {
    this.logger.log('Ejecutando tarea: Limpiar recordatorios antiguos');
    
    try {
      const result = await this.paymentReminderService.cleanupOldReminders();
      this.logger.log(`Recordatorios eliminados: ${result.deleted}`);
    } catch (error) {
      this.logger.error('Error al ejecutar limpieza de recordatorios:', error);
    }
  }

  // Actualizar estado de facturas vencidas - Diario a las 01:00
  @Cron('0 1 * * *')
  async handleUpdateOverdueStatus() {
    this.logger.log('Ejecutando tarea: Actualizar estado de facturas vencidas');
    
    try {
      const count = await this.billingService.suspendOverdueTenants();
      this.logger.log(`Facturas actualizadas: ${count}`);
    } catch (error) {
      this.logger.error('Error al actualizar facturas vencidas:', error);
    }
  }
}
