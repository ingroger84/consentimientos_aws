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

@Entity('prescriptions')
export class Prescription {
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

  // Información del medicamento
  @Column({ name: 'medication_name' })
  medicationName: string;

  @Column({ name: 'active_ingredient', nullable: true })
  activeIngredient: string;

  @Column({ name: 'presentation', nullable: true })
  presentation: string; // "Tabletas", "Jarabe", "Inyectable", etc.

  // Dosificación
  @Column()
  dose: string; // "500mg", "10ml", etc.

  @Column()
  route: string; // "oral", "intravenosa", "intramuscular", "tópica", etc.

  @Column()
  frequency: string; // "cada 8 horas", "cada 12 horas", "3 veces al día", etc.

  @Column()
  duration: string; // "7 días", "14 días", "hasta terminar", etc.

  @Column('int')
  quantity: number; // Cantidad a dispensar

  // Indicaciones
  @Column('text')
  indications: string;

  // Recomendaciones especiales
  @Column('text', { nullable: true })
  specialInstructions: string;

  // Estado
  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'suspended' | 'cancelled';

  // Auditoría
  @Column({ name: 'prescribed_by' })
  prescribedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribed_by' })
  prescriber: User;

  @CreateDateColumn({ name: 'prescribed_at' })
  prescribedAt: Date;

  @Column({ name: 'suspended_at', nullable: true })
  suspendedAt: Date;

  @Column({ name: 'suspended_by', nullable: true })
  suspendedBy: string;

  @Column({ name: 'suspension_reason', nullable: true })
  suspensionReason: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
