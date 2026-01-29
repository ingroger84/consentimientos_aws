import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('physical_exams')
export class PhysicalExam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.physicalExams)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Signos vitales (JSONB)
  @Column('jsonb', { name: 'vital_signs', nullable: true })
  vitalSigns: Record<string, any>;

  // Apariencia general
  @Column('text', { name: 'general_appearance', nullable: true })
  generalAppearance: string;

  // Revisión por sistemas (JSONB)
  @Column('jsonb', { name: 'systems_review', nullable: true })
  systemsReview: Record<string, any>;

  // Hallazgos
  @Column('text', { nullable: true })
  findings: string;

  // Auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
