import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Tenant]),
    TenantsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
