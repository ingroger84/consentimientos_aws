import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { Invoice } from './entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Payment } from '../payments/entities/payment.entity';
import { BillingHistory } from '../billing/entities/billing-history.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Tenant, Payment, BillingHistory]),
    MailModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
  exports: [InvoicesService, InvoicePdfService],
})
export class InvoicesModule {}
