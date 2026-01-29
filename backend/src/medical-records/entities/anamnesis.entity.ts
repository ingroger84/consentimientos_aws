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

@Entity('anamnesis')
export class Anamnesis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.anamnesis)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Motivo de consulta
  @Column({ name: 'chief_complaint', type: 'text' })
  chiefComplaint: string;

  @Column({ name: 'current_illness', type: 'text', nullable: true })
  currentIllness: string;

  // Antecedentes (texto simple, no JSONB)
  @Column({ name: 'personal_history', type: 'text', nullable: true })
  personalHistory: string;

  @Column({ name: 'family_history', type: 'text', nullable: true })
  familyHistory: string;

  @Column({ name: 'allergies', type: 'text', nullable: true })
  allergies: string;

  @Column({ name: 'current_medications', type: 'text', nullable: true })
  currentMedications: string;

  // Auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
