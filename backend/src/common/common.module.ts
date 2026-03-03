import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoDetectionService } from './services/geo-detection.service';
import { StorageService } from './services/storage.service';
import { PDFGeneratorService } from './services/pdf-generator.service';
import { TemplateRendererService } from './services/template-renderer.service';
import { User } from '../users/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    GeoDetectionService,
    StorageService,
    PDFGeneratorService,
    TemplateRendererService,
  ],
  exports: [
    GeoDetectionService,
    StorageService,
    PDFGeneratorService,
    TemplateRendererService,
  ],
})
export class CommonModule {}
