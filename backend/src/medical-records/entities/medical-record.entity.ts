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

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  // Datos básicos
  @Column({ unique: true })
  recordNumber: string;

  @Column()
  admissionDate: Date;

  @Column()
  admissionType: string; // consulta, urgencia, hospitalización

  // Estado
  @Column({ default: 'active' })
  status: string; // active, closed, archived

  @Column({ default: false })
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

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ nullable: true })
  closedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'closedBy' })
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
