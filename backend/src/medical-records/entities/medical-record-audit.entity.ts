import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('medical_record_audit')
export class MedicalRecordAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id', nullable: false })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Acción
  @Column()
  action: string; // create, update, view, delete, sign

  @Column({ name: 'entity_type' })
  entityType: string; // medical_record, evolution, prescription, etc

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  // Cambios (la BD usa una sola columna 'changes')
  @Column({ name: 'changes', type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  // Usuario
  @Column({ name: 'performed_by' })
  performedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  user: User;

  // Timestamp
  @CreateDateColumn({ name: 'performed_at' })
  performedAt: Date;
}
