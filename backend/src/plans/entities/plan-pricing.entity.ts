import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_pricing')
export class PlanPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_id' })
  planId: string; // free, basic, professional, enterprise, custom

  @Column({ length: 10 })
  region: string; // CO, US, DEFAULT

  @Column({ name: 'region_name', length: 50 })
  regionName: string; // Colombia, United States, International

  @Column({ length: 3 })
  currency: string; // COP, USD

  @Column({ name: 'currency_symbol', length: 5 })
  currencySymbol: string; // $, USD

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2 })
  priceMonthly: number;

  @Column({ name: 'price_annual', type: 'decimal', precision: 10, scale: 2 })
  priceAnnual: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number; // 0.19 para Colombia (19%), 0.08 para USA (8%)

  @Column({ name: 'tax_name', length: 50, default: 'Tax' })
  taxName: string; // IVA, Sales Tax, Tax

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
