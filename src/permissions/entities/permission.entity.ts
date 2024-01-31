import { Base } from 'src/base/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Permission extends Base {
  @Column({ default: false })
  create_user: boolean;

  @Column({ default: false })
  read_user: boolean;

  @Column({ default: false })
  update_user: boolean;

  @Column({ default: false })
  delete_user: boolean;

  @OneToOne(() => User, (user) => user.permission)
  @JoinColumn()
  created_by: User;

  @OneToOne(() => User, (user) => user.permission)
  @JoinColumn()
  deleted_by: User;

  @OneToOne(() => User, (user) => user.permission)
  @JoinColumn()
  updated_by: User;

  @OneToOne(() => User, (user) => user.permission)
  @JoinColumn()
  restored_by: User;
}
