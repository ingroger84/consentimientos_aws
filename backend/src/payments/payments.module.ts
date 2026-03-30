import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentAttemptsService } from './payment-attempts.service';
import { BoldService } from './bold.service';
import { PaymentMonitorService } from './payment-monitor.service';
import { PaymentMonitorController } from './payment-monitor.controller';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { BillingHistory } from '../billing/entities/billing-history.entity';
import { MailModule } from '../mail/mail.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentAttempt, Invoice, Tenant, BillingHistory]),
    MailModule,
    forwardRef(() => InvoicesModule),
  ],
  controllers: [PaymentsController, PaymentMonitorController],
  providers: [PaymentsService, PaymentAttemptsService, BoldService, PaymentMonitorService],
  exports: [PaymentsService, PaymentAttemptsService, BoldService, PaymentMonitorService],
})
export class PaymentsModule {}
