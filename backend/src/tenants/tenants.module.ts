import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MRConsentTemplatesModule } from '../medical-record-consent-templates/mr-consent-templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, Role]),
    forwardRef(() => SettingsModule),
    MailModule,
    NotificationsModule,
    forwardRef(() => MRConsentTemplatesModule),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
