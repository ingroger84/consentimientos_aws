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

@Entity('epicrisis')
export class Epicrisis {
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

  // Fechas
  @Column({ name: 'admission_date' })
  admissionDate: Date;

  @Column({ name: 'discharge_date' })
  dischargeDate: Date;

  // Motivo de ingreso
  @Column('text')
  admissionReason: string;

  // Resumen clínico
  @Column('text')
  clinicalSummary: string;

  // Diagnóstico de ingreso
  @Column('text')
  admissionDiagnosis: string;

  // Diagnóstico de egreso (final)
  @Column('text')
  dischargeDiagnosis: string;

  // Tratamiento proporcionado
  @Column('text')
  treatmentProvided: string;

  // Procedimientos realizados
  @Column('text', { nullable: true })
  proceduresPerformed: string;

  // Condición al egreso
  @Column('text')
  dischargeCondition: string;

  // Tipo de egreso
  @Column({ name: 'discharge_type' })
  dischargeType: 'home' | 'transfer' | 'death' | 'voluntary' | 'other';

  // Recomendaciones al egreso
  @Column('text')
  dischargeRecommendations: string;

  // Medicamentos al egreso
  @Column('text', { nullable: true })
  dischargeMedications: string;

  // Controles y seguimiento
  @Column('text', { nullable: true })
  followUpInstructions: string;

  // Signos de alarma
  @Column('text', { nullable: true })
  warningSigns: string;

  // Auditoría
  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
