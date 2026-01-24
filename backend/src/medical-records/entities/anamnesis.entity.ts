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

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.anamnesis)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Motivo de consulta
  @Column('text')
  chiefComplaint: string;

  @Column('text', { nullable: true })
  currentIllness: string;

  // Antecedentes (JSONB)
  @Column('jsonb', { default: {} })
  personalHistory: Record<string, any>;

  @Column('jsonb', { default: {} })
  familyHistory: Record<string, any>;

  @Column('jsonb', { default: {} })
  habits: Record<string, any>;

  @Column('jsonb', { nullable: true })
  gynecologicalHistory: Record<string, any>;

  @Column('jsonb', { default: {} })
  systemsReview: Record<string, any>;

  // Auditoría
  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
