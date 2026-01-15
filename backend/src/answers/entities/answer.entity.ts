import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('answers')
export class Answer extends BaseEntity {
  @Column({ type: 'text' })
  value: string;

  @ManyToOne(() => Consent, (consent) => consent.answers)
  consent: Consent;

  @ManyToOne(() => Question, (question) => question.answers, { eager: true })
  question: Question;
}
