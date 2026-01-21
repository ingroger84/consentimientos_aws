import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { PaymentsModule } from '../payments/payments.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [PaymentsModule, InvoicesModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
