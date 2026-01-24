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

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.diagnoses)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Diagnóstico
  @Column()
  cie10Code: string;

  @Column('text')
  cie10Description: string;

  @Column({ default: 'principal' })
  diagnosisType: string; // principal, relacionado, complicación

  // Clasificación
  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: true })
  isPresumptive: boolean;

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
