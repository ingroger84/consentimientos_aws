import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Tenant } from '../tenants/entities/tenant.entity';
import { ResourceLimitGuard } from './guards/resource-limit.guard';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    ConfigModule,
  ],
  providers: [ResourceLimitGuard, StorageService],
  controllers: [StorageController],
  exports: [ResourceLimitGuard, StorageService],
})
export class CommonModule {}
