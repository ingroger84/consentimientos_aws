import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SystemModule } from './system-module.entity';

@Entity('module_actions')
export class ModuleAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @ManyToOne(() => SystemModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: SystemModule;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
