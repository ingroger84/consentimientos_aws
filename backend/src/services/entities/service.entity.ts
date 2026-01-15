import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Question } from '../../questions/entities/question.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'pdf_template_url', nullable: true })
  pdfTemplateUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.services, { nullable: true })
  tenant: Tenant;

  @OneToMany(() => Question, (question) => question.service)
  questions: Question[];

  @OneToMany(() => Consent, (consent) => consent.service)
  consents: Consent[];
}
