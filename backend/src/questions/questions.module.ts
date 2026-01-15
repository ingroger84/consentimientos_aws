import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Tenant])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [TypeOrmModule, QuestionsService],
})
export class QuestionsModule {}
