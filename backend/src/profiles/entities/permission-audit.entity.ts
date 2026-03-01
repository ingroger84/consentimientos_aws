import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity('permission_audit')
export class PermissionAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  profileId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  action: string; // created, updated, deleted, assigned, revoked

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @CreateDateColumn({ name: 'performed_at' })
  performedAt: Date;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;
}
