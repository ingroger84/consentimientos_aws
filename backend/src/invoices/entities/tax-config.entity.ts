import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaxApplicationType {
  INCLUDED = 'included', // Impuesto incluido en el precio
  ADDITIONAL = 'additional', // Impuesto adicional al precio
}

@Entity('tax_configs')
export class TaxConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  rate: number; // Tasa del impuesto (ej: 19.00 para 19%)

  @Column({
    type: 'enum',
    enum: TaxApplicationType,
    default: TaxApplicationType.ADDITIONAL,
  })
  applicationType: TaxApplicationType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // Si es el impuesto por defecto

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
