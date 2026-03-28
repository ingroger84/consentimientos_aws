import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BoldService } from './bold.service';
import { PaymentMonitorService } from './payment-monitor.service';
import { PaymentMonitorController } from './payment-monitor.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { BillingHistory } from '../billing/entities/billing-history.entity';
import { MailModule } from '../mail/mail.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Tenant, BillingHistory]),
    MailModule,
    forwardRef(() => InvoicesModule),
  ],
  controllers: [PaymentsController, PaymentMonitorController],
  providers: [PaymentsService, BoldService, PaymentMonitorService],
  exports: [PaymentsService, BoldService, PaymentMonitorService],
})
export class PaymentsModule {}
