import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Anamnesis } from './anamnesis.entity';
import { PhysicalExam } from './physical-exam.entity';
import { Diagnosis } from './diagnosis.entity';
import { Evolution } from './evolution.entity';
import { MedicalRecordConsent } from './medical-record-consent.entity';

export enum AdmissionType {
  PRIMERA_VEZ = 'primera_vez',
  CONTROL = 'control',
  URGENCIA = 'urgencia',
  HOSPITALIZACION = 'hospitalizacion',
  CIRUGIA = 'cirugia',
  PROCEDIMIENTO = 'procedimiento',
  TELEMEDICINA = 'telemedicina',
  DOMICILIARIA = 'domiciliaria',
  INTERCONSULTA = 'interconsulta',
  OTRO = 'otro',
}

export enum AdmissionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('admissions')
export class Admission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con HC
  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (mr) => mr.admissions)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Datos de la admisión
  @Column({ name: 'admission_number', unique: true })
  admissionNumber: string;

  @Column({ name: 'admission_date' })
  admissionDate: Date;

  @Column({
    name: 'admission_type',
    type: 'varchar',
    length: 50,
  })
  admissionType: AdmissionType;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  // Estado
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: AdmissionStatus.ACTIVE,
  })
  status: AdmissionStatus;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  // Cierre
  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'closed_by' })
  closer: User;

  @Column({ name: 'closure_notes', type: 'text', nullable: true })
  closureNotes: string;

  // Relaciones con componentes de la admisión
  @OneToMany(() => Anamnesis, (anamnesis) => anamnesis.admission, {
    cascade: true,
  })
  anamnesis: Anamnesis[];

  @OneToMany(() => PhysicalExam, (exam) => exam.admission, {
    cascade: true,
  })
  physicalExams: PhysicalExam[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.admission, {
    cascade: true,
  })
  diagnoses: Diagnosis[];

  @OneToMany(() => Evolution, (evolution) => evolution.admission, {
    cascade: true,
  })
  evolutions: Evolution[];

  @OneToMany(() => MedicalRecordConsent, (consent) => consent.admission, {
    cascade: true,
  })
  consents: MedicalRecordConsent[];

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
