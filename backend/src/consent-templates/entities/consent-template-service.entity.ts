import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConsentTemplate } from './consent-template.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('consent_template_services')
export class ConsentTemplateService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  consentTemplateId: string;

  @Column()
  serviceId: string;

  @ManyToOne(() => ConsentTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consentTemplateId' })
  consentTemplate: ConsentTemplate;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @CreateDateColumn()
  createdAt: Date;
}
