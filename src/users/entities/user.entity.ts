import { Base } from 'src/base/base.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User extends Base {
  @Generated('uuid')
  @Column()
  uuid: string;

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

  @OneToOne(() => User, (user) => user.created_by)
  @JoinColumn()
  created_by: User;

  @OneToOne(() => User, (user) => user.deleted_by)
  @JoinColumn()
  deleted_by: User;

  @OneToOne(() => User, (user) => user.updated_by)
  @JoinColumn()
  updated_by: User;

  @OneToOne(() => User, (user) => user.restored_by)
  @JoinColumn()
  restored_by: User;
}
