import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum WebhookStatus {
  RECEIVED = 'received',
  PROCESSED = 'processed',
  FAILED = 'failed',
  INVALID_SIGNATURE = 'invalid_signature',
}

export enum WebhookProvider {
  BOLD = 'bold',
  OTHER = 'other',
}

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WebhookProvider,
    default: WebhookProvider.BOLD,
  })
  provider: WebhookProvider;

  @Column()
  event: string;

  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.RECEIVED,
  })
  status: WebhookStatus;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'jsonb', nullable: true })
  headers: any;

  @Column({ nullable: true })
  signature: string;

  @Column({ type: 'boolean', default: false })
  signatureValid: boolean;

  @Column({ nullable: true })
  invoiceId: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  processingResult: any;

  @Column({ type: 'int', nullable: true })
  processingTimeMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
