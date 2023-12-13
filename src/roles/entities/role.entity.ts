import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @JoinTable()
  @OneToMany((type) => User, (user) => user.role)
  user: User[];
}
