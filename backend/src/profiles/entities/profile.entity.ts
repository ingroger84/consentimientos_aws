import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

interface Permission {
  module: string;
  actions: string[];
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.profile)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  /**
   * Verificar si el perfil tiene un permiso específico
   */
  hasPermission(moduleCode: string, action: string): boolean {
    // Permiso global (super admin)
    const globalPermission = this.permissions.find(
      (p) => p.module === '*' && p.actions.includes('*'),
    );
    if (globalPermission) {
      return true;
    }

    // Permiso específico del módulo
    const modulePermission = this.permissions.find((p) => p.module === moduleCode);
    if (!modulePermission) {
      return false;
    }

    // Acción global en el módulo
    if (modulePermission.actions.includes('*')) {
      return true;
    }

    // Acción específica
    return modulePermission.actions.includes(action);
  }

  /**
   * Obtener todos los permisos como array plano
   */
  getFlatPermissions(): string[] {
    const flatPermissions: string[] = [];

    for (const permission of this.permissions) {
      if (permission.module === '*' && permission.actions.includes('*')) {
        flatPermissions.push('*:*');
      } else if (permission.actions.includes('*')) {
        flatPermissions.push(`${permission.module}:*`);
      } else {
        for (const action of permission.actions) {
          flatPermissions.push(`${permission.module}:${action}`);
        }
      }
    }

    return flatPermissions;
  }
}
