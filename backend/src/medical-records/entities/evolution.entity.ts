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

@Entity('evolutions')
export class Evolution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.evolutions)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Contenido SOAP
  @Column()
  evolutionDate: Date;

  @Column('text', { nullable: true })
  subjective: string; // S - Subjetivo

  @Column('text', { nullable: true })
  objective: string; // O - Objetivo

  @Column('text', { nullable: true })
  assessment: string; // A - Análisis

  @Column('text', { nullable: true })
  plan: string; // P - Plan

  // Tipo de nota
  @Column({ default: 'evolution' })
  noteType: string; // evolution, interconsulta, epicrisis

  // Firma digital
  @Column({ nullable: true })
  signedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'signedBy' })
  signer: User;

  @Column({ nullable: true })
  signedAt: Date;

  @Column({ nullable: true })
  signatureHash: string;

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
