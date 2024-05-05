import { Base } from 'src/base/base.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ default: false })
  isTFAEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret?: string;

  @Column({ nullable: true })
  googleId?: string;

  @OneToOne(() => Permission, (permission) => permission.user)
  permission: Permission;

  @ManyToOne((type) => Role)
  role: Role;

  @ManyToOne(() => User, (user) => user.created_by)
  created_by: User;

  @ManyToOne(() => User, (user) => user.deleted_by)
  deleted_by: User;

  @ManyToOne(() => User, (user) => user.updated_by)
  updated_by: User;

  @ManyToOne(() => User, (user) => user.restored_by)
  restored_by: User;
}
