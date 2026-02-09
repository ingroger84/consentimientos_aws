import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { TenantsModule } from '../tenants/tenants.module';
import { PlanPricing } from './entities/plan-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanPricing]),
    forwardRef(() => TenantsModule),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
