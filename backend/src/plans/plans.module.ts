import { Module, forwardRef } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [forwardRef(() => TenantsModule)],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
