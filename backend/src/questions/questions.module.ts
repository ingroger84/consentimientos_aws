import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Tenant]),
    ProfilesModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [TypeOrmModule, QuestionsService],
})
export class QuestionsModule {}
