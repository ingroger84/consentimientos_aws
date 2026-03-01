import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ModuleAction } from './module-action.entity';

@Entity('system_modules')
export class SystemModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ length: 200, nullable: true })
  route: string;

  @Column({ name: 'parent_module_id', type: 'uuid', nullable: true })
  parentModuleId: string;

  @ManyToOne(() => SystemModule, { nullable: true })
  @JoinColumn({ name: 'parent_module_id' })
  parentModule: SystemModule;

  @OneToMany(() => SystemModule, (module) => module.parentModule)
  subModules: SystemModule[];

  @OneToMany(() => ModuleAction, (action) => action.module)
  actions: ModuleAction[];

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
