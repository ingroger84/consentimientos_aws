import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PaymentReminder, ReminderStatus, ReminderType } from './entities/payment-reminder.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { BillingHistory, BillingAction } from './entities/billing-history.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentReminderService {
  constructor(
    @InjectRepository(PaymentReminder)
    private remindersRepository: Repository<PaymentReminder>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(BillingHistory)
    private billingHistoryRepository: Repository<BillingHistory>,
    private mailService: MailService,
  ) {}

  async createRemindersForInvoice(invoice: Invoice): Promise<PaymentReminder[]> {
    const reminderDays = (process.env.BILLING_REMINDER_DAYS || '7,5,3,1')
      .split(',')
      .map(d => parseInt(d.trim()));

    const reminders: PaymentReminder[] = [];

    for (const days of reminderDays) {
      const scheduledDate = new Date(invoice.dueDate);
      scheduledDate.setDate(scheduledDate.getDate() - days);

      // Solo crear recordatorio si la fecha programada es futura
      if (scheduledDate > new Date()) {
        const reminder = this.remindersRepository.create({
          tenantId: invoice.tenantId,
          invoiceId: invoice.id,
          reminderType: ReminderType.BOTH,
          daysBeforeDue: days,
          scheduledDate,
          status: ReminderStatus.PENDING,
        });

        const savedReminder = await this.remindersRepository.save(reminder);
        reminders.push(savedReminder);
      }
    }

    console.log(`[PaymentReminderService] Creados ${reminders.length} recordatorios para factura ${invoice.invoiceNumber}`);

    return reminders;
  }

  async sendScheduledReminders(): Promise<{ sent: number; errors: string[] }> {
    console.log('[PaymentReminderService] Iniciando envío de recordatorios programados...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar recordatorios pendientes para hoy
    const reminders = await this.remindersRepository.find({
      where: {
        status: ReminderStatus.PENDING,
        scheduledDate: LessThanOrEqual(today),
      },
      relations: ['tenant', 'invoice'],
    });

    console.log(`[PaymentReminderService] Encontrados ${reminders.length} recordatorios para enviar`);

    let sent = 0;
    const errors: string[] = [];

    for (const reminder of reminders) {
      try {
        const invoice = reminder.invoice;

        // Verificar que la factura siga pendiente
        if (invoice.status !== InvoiceStatus.PENDING) {
          reminder.status = ReminderStatus.SENT;
          reminder.sentAt = new Date();
          await this.remindersRepository.save(reminder);
          continue;
        }

        // Enviar email si corresponde
        if (reminder.reminderType === ReminderType.EMAIL || reminder.reminderType === ReminderType.BOTH) {
          try {
            await this.mailService.sendPaymentReminderEmail(
              reminder.tenant,
              invoice,
              reminder.daysBeforeDue,
            );
          } catch (emailError) {
            console.error(`[PaymentReminderService] Error al enviar email:`, emailError);
            throw emailError;
          }
        }

        // TODO: Crear notificación in-app si corresponde
        // if (reminder.reminderType === ReminderType.IN_APP || reminder.reminderType === ReminderType.BOTH) {
        //   await this.createInAppNotification(reminder);
        // }

        // Marcar como enviado
        reminder.status = ReminderStatus.SENT;
        reminder.sentAt = new Date();
        await this.remindersRepository.save(reminder);

        // Registrar en historial
        await this.billingHistoryRepository.save({
          tenantId: reminder.tenantId,
          action: BillingAction.REMINDER_SENT,
          description: `Recordatorio de pago enviado - ${reminder.daysBeforeDue} días antes del vencimiento`,
          metadata: {
            reminderId: reminder.id,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            daysBeforeDue: reminder.daysBeforeDue,
            dueDate: invoice.dueDate,
          },
        });

        sent++;
        console.log(`[PaymentReminderService] Recordatorio enviado para tenant ${reminder.tenant.name}`);
      } catch (error) {
        const errorMsg = `Error al enviar recordatorio para tenant ${reminder.tenant.name}: ${error.message}`;
        console.error(`[PaymentReminderService] ${errorMsg}`);
        
        // Marcar como fallido
        reminder.status = ReminderStatus.FAILED;
        reminder.errorMessage = error.message;
        await this.remindersRepository.save(reminder);
        
        errors.push(errorMsg);
      }
    }

    console.log(`[PaymentReminderService] Envío completado: ${sent} recordatorios enviados, ${errors.length} errores`);

    return { sent, errors };
  }

  async cleanupOldReminders(): Promise<{ deleted: number }> {
    console.log('[PaymentReminderService] Iniciando limpieza de recordatorios antiguos...');

    // Eliminar recordatorios de hace más de 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.remindersRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: ninetyDaysAgo })
      .andWhere('status != :status', { status: ReminderStatus.PENDING })
      .execute();

    console.log(`[PaymentReminderService] Eliminados ${result.affected} recordatorios antiguos`);

    return { deleted: result.affected || 0 };
  }

  async getPendingReminders(tenantId?: string): Promise<PaymentReminder[]> {
    const query = this.remindersRepository.createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.invoice', 'invoice')
      .leftJoinAndSelect('reminder.tenant', 'tenant')
      .where('reminder.status = :status', { status: ReminderStatus.PENDING })
      .orderBy('reminder.scheduledDate', 'ASC');

    if (tenantId) {
      query.andWhere('reminder.tenantId = :tenantId', { tenantId });
    }

    return await query.getMany();
  }
}
