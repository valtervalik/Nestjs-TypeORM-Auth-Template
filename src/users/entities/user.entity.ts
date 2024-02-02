import { Base } from 'src/base/base.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
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

  @JoinTable()
  @OneToMany(() => Permission, (permission) => permission.created_by, {
    cascade: true,
  })
  @OneToMany(() => Permission, (permission) => permission.deleted_by, {
    cascade: true,
  })
  @OneToMany(() => Permission, (permission) => permission.updated_by, {
    cascade: true,
  })
  @OneToMany(() => Permission, (permission) => permission.restored_by, {
    cascade: true,
  })
  @JoinColumn()
  @OneToOne(() => Permission, (permission) => permission.user)
  permission: Permission;

  @Column({ default: false })
  isTFAEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret?: string;

  @Column({ nullable: true })
  googleId?: string;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.created_by)
  created_by: User;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.deleted_by)
  deleted_by: User;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.updated_by)
  updated_by: User;

  @JoinTable()
  @ManyToOne(() => User, (user) => user.restored_by)
  restored_by: User;
}
