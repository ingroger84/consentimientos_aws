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

@Entity('medical_orders')
export class MedicalOrder {
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

  // Tipo de orden
  @Column({ name: 'order_type' })
  orderType: 'laboratory' | 'imaging' | 'procedure' | 'other';

  // Código CUPS (Clasificación Única de Procedimientos en Salud)
  @Column({ name: 'order_code', nullable: true })
  orderCode: string;

  // Descripción de la orden
  @Column('text')
  description: string;

  // Indicación clínica
  @Column('text', { nullable: true })
  indication: string;

  // Estado de la orden
  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  // Prioridad
  @Column({ default: 'routine' })
  priority: 'routine' | 'urgent' | 'stat';

  // Resultados
  @Column('text', { nullable: true })
  results: string;

  // URL del documento de resultados (si aplica)
  @Column({ name: 'results_document_url', nullable: true })
  resultsDocumentUrl: string;

  // Notas adicionales
  @Column('text', { nullable: true })
  notes: string;

  // Auditoría
  @Column({ name: 'ordered_by' })
  orderedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ordered_by' })
  orderer: User;

  @CreateDateColumn({ name: 'ordered_at' })
  orderedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'completed_by', nullable: true })
  completedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'completed_by' })
  completer: User;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
