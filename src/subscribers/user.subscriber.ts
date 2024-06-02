import { HashingService } from 'src/common/hashing/hashing.service';
import { User } from 'src/users/entities/user.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    dataSource: DataSource,
    private readonly hashingService: HashingService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    const { password } = event.entity;

    password
      ? (event.entity.password = await this.hashingService.hash(password))
      : null;
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    const { password } = event.entity;

    password
      ? (event.entity.password = await this.hashingService.hash(password))
      : null;
  }
}
