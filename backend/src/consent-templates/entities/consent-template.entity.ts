import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Service } from '../../services/entities/service.entity';

export enum TemplateType {
  PROCEDURE = 'procedure',
  DATA_TREATMENT = 'data_treatment',
  IMAGE_RIGHTS = 'image_rights',
}

@Entity('consent_templates')
export class ConsentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
  })
  type: TemplateType;

  @Column('text')
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column('text', { nullable: true })
  description: string;

  @ManyToMany(() => Service, { eager: true })
  @JoinTable({
    name: 'consent_template_services',
    joinColumn: { name: 'consentTemplateId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'serviceId', referencedColumnName: 'id' },
  })
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
