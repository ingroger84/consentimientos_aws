import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { PhysicalExam } from './entities/physical-exam.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Evolution } from './entities/evolution.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { MedicalRecordConsent } from './entities/medical-record-consent.entity';
import { MedicalRecordsService } from './medical-records.service';
import { AnamnesisService } from './anamnesis.service';
import { PhysicalExamService } from './physical-exam.service';
import { DiagnosisService } from './diagnosis.service';
import { EvolutionService } from './evolution.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsPdfService } from './medical-records-pdf.service';
import { ClientsModule } from '../clients/clients.module';
import { ConsentsModule } from '../consents/consents.module';
import { MRConsentTemplatesModule } from '../medical-record-consent-templates/mr-consent-templates.module';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../mail/mail.module';
import { CommonModule } from '../common/common.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecord,
      Anamnesis,
      PhysicalExam,
      Diagnosis,
      Evolution,
      MedicalRecordAudit,
      MedicalRecordConsent,
    ]),
    ClientsModule,
    ConsentsModule,
    MRConsentTemplatesModule,
    SettingsModule,
    MailModule,
    CommonModule,
    forwardRef(() => TenantsModule),
  ],
  controllers: [MedicalRecordsController],
  providers: [
    MedicalRecordsService,
    MedicalRecordsPdfService,
    AnamnesisService,
    PhysicalExamService,
    DiagnosisService,
    EvolutionService,
  ],
  exports: [
    MedicalRecordsService,
    AnamnesisService,
    PhysicalExamService,
    DiagnosisService,
    EvolutionService,
  ],
})
export class MedicalRecordsModule {}
