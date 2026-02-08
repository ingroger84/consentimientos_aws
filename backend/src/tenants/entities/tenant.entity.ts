import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Service } from '../../services/entities/service.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Client } from '../../clients/entities/client.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { MedicalRecordConsent } from '../../medical-records/entities/medical-record-consent.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.FREE })
  plan: TenantPlan;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'plan_price' })
  planPrice: number;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY, name: 'billing_cycle' })
  billingCycle: BillingCycle;

  @Column({ type: 'timestamp', nullable: true, name: 'plan_started_at' })
  planStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'plan_expires_at' })
  planExpiresAt: Date;

  @Column({ type: 'int', default: 1, name: 'billing_day' })
  billingDay: number; // Día del mes para corte de facturación (1-28)

  @Column({ type: 'boolean', default: true, name: 'auto_renew' })
  autoRenew: boolean;

  // Campos de Multi-Región
  @Column({ type: 'varchar', length: 2, default: 'CO', name: 'region' })
  region: string; // Código de país: CO, US, DEFAULT

  @Column({ type: 'varchar', length: 3, default: 'COP', name: 'currency' })
  currency: string; // Moneda: COP, USD

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'plan_price_original' })
  planPriceOriginal: number; // Precio original al momento de suscripción

  @Column({ type: 'boolean', default: false, name: 'price_locked' })
  priceLocked: boolean; // Si true, el precio no cambia con actualizaciones de plan

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  // Límites de recursos
  @Column({ type: 'int', default: 2, name: 'max_users' })
  maxUsers: number;

  @Column({ type: 'int', default: 50, name: 'max_consents' })
  maxConsents: number;

  @Column({ type: 'int', default: 1, name: 'max_branches' })
  maxBranches: number;

  @Column({ type: 'int', default: 3, name: 'max_services' })
  maxServices: number;

  @Column({ type: 'int', default: 5, name: 'max_questions' })
  maxQuestions: number;

  @Column({ type: 'int', default: 5, name: 'max_medical_records' })
  maxMedicalRecords: number;

  @Column({ type: 'int', default: 2, name: 'max_mr_consent_templates' })
  maxMRConsentTemplates: number;

  @Column({ type: 'int', default: 3, name: 'max_consent_templates' })
  maxConsentTemplates: number;

  @Column({ type: 'int', default: 100, name: 'storage_limit_mb' })
  storageLimitMb: number;

  // Features del plan (JSON)
  @Column({ type: 'jsonb', nullable: true })
  features: {
    watermark?: boolean;
    customization?: boolean;
    advancedReports?: boolean;
    apiAccess?: boolean;
    prioritySupport?: boolean;
    customDomain?: boolean;
    whiteLabel?: boolean;
    backup?: string; // 'none', 'weekly', 'daily'
  };

  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relaciones
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Branch, (branch) => branch.tenant)
  branches: Branch[];

  @OneToMany(() => Service, (service) => service.tenant)
  services: Service[];

  @OneToMany(() => Consent, (consent) => consent.tenant)
  consents: Consent[];

  @OneToMany(() => Client, (client) => client.tenant)
  clients: Client[];

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.tenant)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => MedicalRecordConsent, (mrConsent) => mrConsent.medicalRecord)
  medicalRecordConsents: MedicalRecordConsent[];
}
