import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { ResourceLimitGuard } from './guards/resource-limit.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [ResourceLimitGuard],
  exports: [ResourceLimitGuard],
})
export class CommonModule {}
