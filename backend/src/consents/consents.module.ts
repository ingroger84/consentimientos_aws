import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentsService } from './consents.service';
import { ConsentsController } from './consents.controller';
import { Consent } from './entities/consent.entity';
import { Answer } from '../answers/entities/answer.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PdfService } from './pdf.service';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consent, Answer, Tenant]),
    SettingsModule,
    MailModule,
  ],
  controllers: [ConsentsController],
  providers: [ConsentsService, PdfService],
  exports: [ConsentsService],
})
export class ConsentsModule {}
