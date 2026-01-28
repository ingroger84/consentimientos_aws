import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentTemplatesService } from './consent-templates.service';
import { ConsentTemplatesController } from './consent-templates.controller';
import { ConsentTemplate } from './entities/consent-template.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConsentTemplate, Tenant]),
    forwardRef(() => TenantsModule),
  ],
  controllers: [ConsentTemplatesController],
  providers: [ConsentTemplatesService],
  exports: [ConsentTemplatesService],
})
export class ConsentTemplatesModule {}
