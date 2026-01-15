import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum BillingAction {
  INVOICE_CREATED = 'invoice_created',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  REMINDER_SENT = 'reminder_sent',
  TENANT_SUSPENDED = 'tenant_suspended',
  TENANT_ACTIVATED = 'tenant_activated',
  INVOICE_CANCELLED = 'invoice_cancelled',
  REFUND_ISSUED = 'refund_issued',
}

@Entity('billing_history')
export class BillingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: BillingAction,
  })
  action: BillingAction;

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
