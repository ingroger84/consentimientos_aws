import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MRConsentTemplatesService } from './mr-consent-templates.service';
import { MRConsentTemplatesController } from './mr-consent-templates.controller';
import { MRConsentTemplate } from './entities/mr-consent-template.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MRConsentTemplate, Tenant]),
    forwardRef(() => TenantsModule),
  ],
  controllers: [MRConsentTemplatesController],
  providers: [MRConsentTemplatesService],
  exports: [MRConsentTemplatesService],
})
export class MRConsentTemplatesModule {}
