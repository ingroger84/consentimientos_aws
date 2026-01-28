import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Evolution } from './evolution.entity';
import { User } from '../../users/entities/user.entity';

@Entity('medical_record_consents')
export class MedicalRecordConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @Column({ name: 'consent_id', nullable: true })
  consentId: string;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'consent_number', length: 100, nullable: true })
  consentNumber: string;

  @Column({ name: 'consent_metadata', type: 'jsonb', nullable: true })
  consentMetadata: any;

  @Column({ name: 'evolution_id', nullable: true })
  evolutionId: string;

  @Column({ name: 'created_during_consultation', default: true })
  createdDuringConsultation: boolean;

  @Column({ name: 'required_for_procedure', default: false })
  requiredForProcedure: boolean;

  @Column({ name: 'procedure_name', nullable: true })
  procedureName: string;

  @Column({ name: 'diagnosis_code', length: 10, nullable: true })
  diagnosisCode: string;

  @Column({ name: 'diagnosis_description', type: 'text', nullable: true })
  diagnosisDescription: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  // Relaciones
  @ManyToOne(() => MedicalRecord, (record) => record.consents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @ManyToOne(() => Consent, { nullable: true })
  @JoinColumn({ name: 'consent_id' })
  consent: Consent;

  @ManyToOne(() => Evolution, { nullable: true })
  @JoinColumn({ name: 'evolution_id' })
  evolution: Evolution;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
