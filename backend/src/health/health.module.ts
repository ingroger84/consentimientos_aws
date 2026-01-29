import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
