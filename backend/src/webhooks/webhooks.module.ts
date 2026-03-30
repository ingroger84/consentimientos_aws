import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhookLog } from './entities/webhook-log.entity';
import { PaymentsModule } from '../payments/payments.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookLog]),
    PaymentsModule,
    InvoicesModule,
    MailModule,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
