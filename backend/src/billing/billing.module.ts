import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingSchedulerService } from './billing-scheduler.service';
import { PaymentReminderService } from './payment-reminder.service';
import { PaymentReminder } from './entities/payment-reminder.entity';
import { BillingHistory } from './entities/billing-history.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentReminder,
      BillingHistory,
      Invoice,
      Tenant,
    ]),
    ScheduleModule.forRoot(),
    InvoicesModule,
    MailModule,
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    BillingSchedulerService,
    PaymentReminderService,
  ],
  exports: [BillingService, PaymentReminderService],
})
export class BillingModule {}
