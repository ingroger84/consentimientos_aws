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

  @Column({ 
    type: 'text',
    default: '',
    transformer: {
      to: (value: string[]) => {
        if (!value || value.length === 0) return '';
        // Si ya es un string, retornarlo tal cual
        if (typeof value === 'string') return value;
        // Si es un array, convertirlo a string separado por comas
        return value.join(',');
      },
      from: (value: string) => {
        if (!value) return [];
        // Si es un string separado por comas, convertirlo a array
        if (typeof value === 'string') {
          // Intentar parsear como JSON primero (por compatibilidad)
          if (value.startsWith('[') || value.startsWith('{')) {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              // Si falla, asumir que es un string separado por comas
              return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
            }
          }
          // String separado por comas
          return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
        }
        // Si ya es un array, retornarlo
        return Array.isArray(value) ? value : [];
      }
    }
  })
  permissions: string[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
