import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { TaxConfigService } from './tax-config.service';
import { Invoice } from './entities/invoice.entity';
import { TaxConfig } from './entities/tax-config.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Payment } from '../payments/entities/payment.entity';
import { BillingHistory } from '../billing/entities/billing-history.entity';
import { MailModule } from '../mail/mail.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, TaxConfig, Tenant, Payment, BillingHistory]),
    MailModule,
    PaymentsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService, TaxConfigService],
  exports: [InvoicesService, InvoicePdfService, TaxConfigService],
})
export class InvoicesModule {}
