import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum ReminderType {
  EMAIL = 'email',
  IN_APP = 'in_app',
  BOTH = 'both',
}

export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('payment_reminders')
export class PaymentReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
    default: ReminderType.BOTH,
  })
  reminderType: ReminderType;

  @Column()
  daysBeforeDue: number;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
