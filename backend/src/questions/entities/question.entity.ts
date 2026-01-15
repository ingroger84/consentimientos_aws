import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Service } from '../../services/entities/service.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum QuestionType {
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
}

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ type: 'text' })
  questionText: string;

  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.YES_NO })
  type: QuestionType;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: false })
  isCritical: boolean;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Service, (service) => service.questions)
  service: Service;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant: Tenant;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
