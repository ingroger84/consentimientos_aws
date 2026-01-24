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

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.physicalExams)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Signos vitales
  @Column({ nullable: true })
  bloodPressureSystolic: number;

  @Column({ nullable: true })
  bloodPressureDiastolic: number;

  @Column({ nullable: true })
  heartRate: number;

  @Column({ nullable: true })
  respiratoryRate: number;

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column({ nullable: true })
  oxygenSaturation: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  height: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  bmi: number;

  // Examen físico
  @Column('text', { nullable: true })
  generalAppearance: string;

  @Column('jsonb', { default: {} })
  physicalExamData: Record<string, any>;

  @Column('text', { nullable: true })
  otherFindings: string;

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
