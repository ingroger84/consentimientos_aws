import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamiaErpService } from './dynamiaerp.service';

@Module({
  imports: [ConfigModule],
  providers: [DynamiaErpService],
  exports: [DynamiaErpService],
})
export class DynamiaErpModule {}
