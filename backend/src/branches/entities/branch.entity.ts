import { Entity, Column, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.branches, { nullable: true })
  tenant: Tenant;

  @ManyToMany(() => User, (user) => user.branches)
  users: User[];

  @OneToMany(() => Consent, (consent) => consent.branch)
  consents: Consent[];
}
