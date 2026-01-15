import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN_GENERAL = 'ADMIN_GENERAL',
  ADMIN_SEDE = 'ADMIN_SEDE',
  OPERADOR = 'OPERADOR',
}

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: RoleType })
  type: RoleType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: '' })
  permissions: string[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
