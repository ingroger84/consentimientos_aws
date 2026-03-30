import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum PaymentAttemptStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  SUCCEEDED = 'succeeded',
  EXPIRED = 'expired',
}

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'bold_payment_link', nullable: true, length: 500 })
  boldPaymentLink: string;

  @Column({ name: 'bold_payment_reference', nullable: true, length: 255 })
  boldPaymentReference: string;

  @Column({ name: 'bold_payment_link_id', nullable: true, length: 100 })
  boldPaymentLinkId: string;

  @Column({ type: 'varchar', length: 50 })
  status: PaymentAttemptStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'bold_response', type: 'jsonb', nullable: true })
  boldResponse: any;

  @Column({ name: 'attempted_at', type: 'timestamp', default: () => 'NOW()' })
  attemptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
