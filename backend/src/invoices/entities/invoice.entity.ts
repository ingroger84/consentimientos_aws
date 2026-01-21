import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { TaxConfig } from './tax-config.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOIDED = 'voided', // Anulada
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => TaxConfig, { nullable: true, eager: false })
  @JoinColumn({ name: 'taxConfigId' })
  taxConfig: TaxConfig;

  @Column({ nullable: true })
  taxConfigId: string;

  @Column({ default: false })
  taxExempt: boolean; // Nueva columna para facturas exentas

  @Column({ type: 'text', nullable: true })
  taxExemptReason: string; // Razón de la exención

  @Column({ unique: true })
  invoiceNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'COP' })
  currency: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'jsonb' })
  items: InvoiceItem[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  // Campos específicos de Bold
  @Column({ type: 'text', nullable: true })
  boldPaymentLink: string;

  @Column({ nullable: true })
  boldTransactionId: string;

  @Column({ nullable: true })
  boldPaymentReference: string;

  @OneToMany(() => Payment, payment => payment.invoice)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateInvoiceNumber() {
    if (!this.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.invoiceNumber = `INV-${year}${month}-${random}`;
    }
  }
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
