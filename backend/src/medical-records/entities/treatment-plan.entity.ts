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
import { Evolution } from './evolution.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('treatment_plans')
export class TreatmentPlan {
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

  // Vincular con evolución (opcional)
  @Column({ name: 'evolution_id', nullable: true })
  evolutionId: string;

  @ManyToOne(() => Evolution)
  @JoinColumn({ name: 'evolution_id' })
  evolution: Evolution;

  // Objetivo del tratamiento
  @Column('text', { nullable: true })
  objective: string;

  // Tratamiento farmacológico (JSON)
  @Column('jsonb', { nullable: true })
  pharmacologicalTreatment: {
    medications: Array<{
      name: string;
      dose: string;
      frequency: string;
      duration: string;
      route: string;
    }>;
  };

  // Tratamiento no farmacológico
  @Column('text', { nullable: true })
  nonPharmacologicalTreatment: string;

  // Educación al paciente
  @Column('text', { nullable: true })
  patientEducation: string;

  // Criterios de seguimiento
  @Column('text', { nullable: true })
  followUpCriteria: string;

  // Próxima cita programada
  @Column({ name: 'next_appointment', nullable: true })
  nextAppointment: Date;

  // Recomendaciones generales
  @Column('text', { nullable: true })
  recommendations: string;

  // Restricciones o precauciones
  @Column('text', { nullable: true })
  restrictions: string;

  // Estado del plan
  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'modified' | 'cancelled';

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
