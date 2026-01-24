import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentTemplatesService } from './consent-templates.service';
import { ConsentTemplatesController } from './consent-templates.controller';
import { ConsentTemplate } from './entities/consent-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentTemplate])],
  controllers: [ConsentTemplatesController],
  providers: [ConsentTemplatesService],
  exports: [ConsentTemplatesService],
})
export class ConsentTemplatesModule {}
