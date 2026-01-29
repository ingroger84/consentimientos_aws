import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Client } from '../../clients/entities/client.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { Anamnesis } from './anamnesis.entity';
import { PhysicalExam } from './physical-exam.entity';
import { Diagnosis } from './diagnosis.entity';
import { Evolution } from './evolution.entity';
import { MedicalRecordConsent } from './medical-record-consent.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'branch_id', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // Datos básicos
  @Column({ name: 'record_number', unique: true })
  recordNumber: string;

  @Column({ name: 'admission_date' })
  admissionDate: Date;

  @Column({ name: 'admission_type' })
  admissionType: string; // consulta, urgencia, hospitalización

  // Estado
  @Column({ name: 'status', default: 'active' })
  status: string; // active, closed, archived

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  // Relaciones con componentes de la HC
  @OneToMany(() => Anamnesis, (anamnesis) => anamnesis.medicalRecord, {
    cascade: true,
  })
  anamnesis: Anamnesis[];

  @OneToMany(() => PhysicalExam, (exam) => exam.medicalRecord, {
    cascade: true,
  })
  physicalExams: PhysicalExam[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.medicalRecord, {
    cascade: true,
  })
  diagnoses: Diagnosis[];

  @OneToMany(() => Evolution, (evolution) => evolution.medicalRecord, {
    cascade: true,
  })
  evolutions: Evolution[];

  @OneToMany(() => MedicalRecordConsent, (consent) => consent.medicalRecord, {
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

  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'closed_by' })
  closer: User;

  // Validaciones
  @BeforeUpdate()
  validateBeforeUpdate() {
    if (this.isLocked) {
      throw new Error('No se puede modificar una historia clínica bloqueada');
    }

    if (this.status === 'closed') {
      throw new Error('No se puede modificar una historia clínica cerrada');
    }
  }
}
