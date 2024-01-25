import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingService } from './hashing.service';

@Module({
  providers: [{ provide: HashingService, useClass: BcryptService }],
  exports: [{ provide: HashingService, useClass: BcryptService }],
})
export class HashingModule {}
