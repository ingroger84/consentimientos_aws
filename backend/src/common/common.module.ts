import { Module, Global } from '@nestjs/common';
import { GeoDetectionService } from './services/geo-detection.service';
import { StorageService } from './services/storage.service';
import { PDFGeneratorService } from './services/pdf-generator.service';
import { TemplateRendererService } from './services/template-renderer.service';

@Global()
@Module({
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
