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

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'enum', enum: RoleType })
  type: RoleType;

  @Column({ nullable: true })
  description: string;

  @Column({ 
    type: 'text',
    default: '',
    transformer: {
      to: (value: string[]) => {
        // Convertir array a string separado por comas
        if (!value || value.length === 0) return '';
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.join(',');
        return '';
      },
      from: (value: string) => {
        // Convertir string separado por comas a array
        if (!value || typeof value !== 'string') return [];
        // Simplemente dividir por comas y limpiar
        return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }
    }
  })
  permissions: string[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
