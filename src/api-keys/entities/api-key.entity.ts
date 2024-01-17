import { Base } from 'src/base/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class ApiKey extends Base {
  @Column()
  key: string;

  @Column()
  uuid: string;

  @ManyToOne((type) => User, (user) => user.apiKeys)
  user: User;
}
