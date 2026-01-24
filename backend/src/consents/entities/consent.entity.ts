import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Service } from '../../services/entities/service.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Client } from '../../clients/entities/client.entity';

export enum ConsentStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('consents')
export class Consent extends BaseEntity {
  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'client_email' })
  clientEmail: string;

  @Column({ name: 'client_phone', nullable: true })
  clientPhone: string;

  @Column({ name: 'signature_data', type: 'text', nullable: true })
  signatureData: string;

  @Column({ name: 'client_photo', type: 'text', nullable: true })
  clientPhoto: string;

  @Column({ name: 'signed_at', nullable: true })
  signedAt: Date;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @Column({ name: 'pdf_data_treatment_url', nullable: true })
  pdfDataTreatmentUrl: string;

  @Column({ name: 'pdf_image_rights_url', nullable: true })
  pdfImageRightsUrl: string;

  @Column({
    type: 'enum',
    enum: ConsentStatus,
    default: ConsentStatus.DRAFT,
  })
  status: ConsentStatus;

  @Column({ name: 'email_sent_at', nullable: true })
  emailSentAt: Date;

  @ManyToOne(() => Service, (service) => service.consents, { eager: true })
  service: Service;

  @ManyToOne(() => Branch, (branch) => branch.consents, { eager: true })
  branch: Branch;

  @ManyToOne(() => Tenant, (tenant) => tenant.consents, { nullable: true })
  tenant: Tenant;

  @ManyToOne(() => Client, (client) => client.consents, { nullable: true })
  @JoinColumn({ name: 'client_uuid' })
  client: Client;

  @OneToMany(() => Answer, (answer) => answer.consent, { eager: true })
  answers: Answer[];
}
