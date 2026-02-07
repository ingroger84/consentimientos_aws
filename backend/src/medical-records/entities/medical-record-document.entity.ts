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

@Entity('medical_record_documents')
export class MedicalRecordDocument {
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

  // Tipo de documento
  @Column({ name: 'document_type' })
  documentType: 'lab_result' | 'imaging' | 'epicrisis' | 'consent' | 'prescription' | 'other';

  // Información del archivo
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  // Descripción
  @Column('text', { nullable: true })
  description: string;

  // Relación con otras entidades (opcional)
  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType: string; // "medical_order", "prescription", "procedure", etc.

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: string;

  // Auditoría
  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
