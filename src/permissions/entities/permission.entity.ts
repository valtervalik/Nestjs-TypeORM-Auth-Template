import { Base } from 'src/base/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

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

  @JoinColumn()
  @OneToOne(() => User, (user) => user.permission)
  user: User;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => User)
  deleted_by: User;

  @ManyToOne(() => User)
  updated_by: User;

  @ManyToOne(() => User)
  restored_by: User;
}
