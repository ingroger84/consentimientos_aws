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

  @Column({ nullable: true })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Acción
  @Column()
  action: string; // create, update, view, delete, sign

  @Column()
  entityType: string; // medical_record, evolution, prescription, etc

  @Column({ nullable: true })
  entityId: string;

  // Cambios
  @Column('jsonb', { nullable: true })
  oldValues: Record<string, any>;

  @Column('jsonb', { nullable: true })
  newValues: Record<string, any>;

  // Usuario
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userRole: string;

  // Contexto
  @Column({ nullable: true })
  ipAddress: string;

  @Column('text', { nullable: true })
  userAgent: string;

  // Timestamp
  @CreateDateColumn()
  createdAt: Date;
}
