import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BoldService } from './bold.service';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { BillingHistory } from '../billing/entities/billing-history.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Tenant, BillingHistory]),
    MailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, BoldService],
  exports: [PaymentsService, BoldService],
})
export class PaymentsModule {}
