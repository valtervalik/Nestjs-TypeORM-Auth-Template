import { Base } from 'src/base/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, OneToMany } from 'typeorm';

@Entity()
export class Role extends Base {
  @Column()
  name: string;

  @JoinTable()
  @OneToMany((type) => User, (user) => user.role)
  user: User[];
}
