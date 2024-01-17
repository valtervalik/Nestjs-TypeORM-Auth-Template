import { ApiKey } from 'src/api-keys/entities/api-key.entity';
import { Base } from 'src/base/base.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @ManyToOne((type) => Role, (role) => role.user)
  role: Role;

  @OneToOne(() => Permission, (permission) => permission.user, {
    cascade: true,
  })
  @JoinColumn()
  permission: Permission;

  @Column({ default: false })
  isTFAEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret?: string;

  @Column({ nullable: true })
  googleId?: string;

  @JoinTable()
  @OneToMany((type) => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];
}
