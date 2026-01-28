import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Tenant } from '../tenants/entities/tenant.entity';
import { ResourceLimitGuard } from './guards/resource-limit.guard';
import { StorageService } from './services/storage.service';
import { TemplateRendererService } from './services/template-renderer.service';
import { PDFGeneratorService } from './services/pdf-generator.service';
import { StorageController } from './controllers/storage.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    ConfigModule,
  ],
  providers: [
    ResourceLimitGuard,
    StorageService,
    TemplateRendererService,
    PDFGeneratorService,
  ],
  controllers: [StorageController],
  exports: [
    ResourceLimitGuard,
    StorageService,
    TemplateRendererService,
    PDFGeneratorService,
  ],
})
export class CommonModule {}
