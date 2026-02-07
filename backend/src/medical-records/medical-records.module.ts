import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { PhysicalExam } from './entities/physical-exam.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Evolution } from './entities/evolution.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { MedicalRecordConsent } from './entities/medical-record-consent.entity';
import { MedicalOrder } from './entities/medical-order.entity';
import { Prescription } from './entities/prescription.entity';
import { Procedure } from './entities/procedure.entity';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { Epicrisis } from './entities/epicrisis.entity';
import { MedicalRecordDocument } from './entities/medical-record-document.entity';
import { MedicalRecordsService } from './medical-records.service';
import { AnamnesisService } from './anamnesis.service';
import { PhysicalExamService } from './physical-exam.service';
import { DiagnosisService } from './diagnosis.service';
import { EvolutionService } from './evolution.service';
import { MedicalOrdersService } from './medical-orders.service';
import { PrescriptionsService } from './prescriptions.service';
import { ProceduresService } from './procedures.service';
import { TreatmentPlansService } from './treatment-plans.service';
import { EpicrisisService } from './epicrisis.service';
import { MedicalRecordDocumentsService } from './medical-record-documents.service';
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
      MedicalOrder,
      Prescription,
      Procedure,
      TreatmentPlan,
      Epicrisis,
      MedicalRecordDocument,
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
    MedicalOrdersService,
    PrescriptionsService,
    ProceduresService,
    TreatmentPlansService,
    EpicrisisService,
    MedicalRecordDocumentsService,
  ],
  exports: [
    MedicalRecordsService,
    AnamnesisService,
    PhysicalExamService,
    DiagnosisService,
    EvolutionService,
    MedicalOrdersService,
    PrescriptionsService,
    ProceduresService,
    TreatmentPlansService,
    EpicrisisService,
    MedicalRecordDocumentsService,
  ],
})
export class MedicalRecordsModule {}
