import { Module, Global } from '@nestjs/common';
import { GeoDetectionService } from './services/geo-detection.service';

@Global()
@Module({
  providers: [GeoDetectionService],
  exports: [GeoDetectionService],
})
export class CommonModule {}
