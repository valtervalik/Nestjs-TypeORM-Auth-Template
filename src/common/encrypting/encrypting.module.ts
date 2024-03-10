import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { EncryptingService } from './encrypting.service';
import { KeysService } from './keys.service';

@Module({
  providers: [
    { provide: EncryptingService, useClass: CryptoService },
    KeysService,
  ],
  exports: [
    { provide: EncryptingService, useClass: CryptoService },
    KeysService,
  ],
})
export class EncryptingModule {}
