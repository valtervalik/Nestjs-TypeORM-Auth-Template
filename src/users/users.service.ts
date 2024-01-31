import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { BaseService } from 'src/base/base.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User>(User) {
  generatePassword(length: number): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const all = uppercase + lowercase + numbers + symbols;

    let password = '';
    for (let i = 0; i < length; i++) {
      password += all[randomInt(all.length)];
    }

    return password;
  }
}
