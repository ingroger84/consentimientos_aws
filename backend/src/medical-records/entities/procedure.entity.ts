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

@Entity('procedures')
export class Procedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Código CUPS del procedimiento
  @Column({ name: 'procedure_code', nullable: true })
  procedureCode: string;

  // Nombre del procedimiento
  @Column()
  name: string;

  // Descripción detallada
  @Column('text')
  description: string;

  // Tipo de procedimiento
  @Column({ name: 'procedure_type', nullable: true })
  procedureType: string; // "quirúrgico", "diagnóstico", "terapéutico", etc.

  // Estado
  @Column({ default: 'scheduled' })
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  // Fecha programada
  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  // Fecha de realización
  @Column({ name: 'performed_at', nullable: true })
  performedAt: Date;

  // Hallazgos
  @Column('text', { nullable: true })
  findings: string;

  // Complicaciones
  @Column('text', { nullable: true })
  complications: string;

  // Recomendaciones post-procedimiento
  @Column('text', { nullable: true })
  postProcedureRecommendations: string;

  // Consentimiento informado asociado
  @Column({ name: 'consent_id', nullable: true })
  consentId: string;

  // Auditoría
  @Column({ name: 'scheduled_by' })
  scheduledBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'scheduled_by' })
  scheduler: User;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
