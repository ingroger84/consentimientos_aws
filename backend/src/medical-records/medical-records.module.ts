import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { PhysicalExam } from './entities/physical-exam.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Evolution } from './entities/evolution.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { MedicalRecordsService } from './medical-records.service';
import { AnamnesisService } from './anamnesis.service';
import { MedicalRecordsController } from './medical-records.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecord,
      Anamnesis,
      PhysicalExam,
      Diagnosis,
      Evolution,
      MedicalRecordAudit,
    ]),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, AnamnesisService],
  exports: [MedicalRecordsService, AnamnesisService],
})
export class MedicalRecordsModule {}
