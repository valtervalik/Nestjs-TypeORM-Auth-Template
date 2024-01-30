import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { EncryptingService } from './encrypting.service';

@Module({
  providers: [{ provide: EncryptingService, useClass: CryptoService }],
  exports: [{ provide: EncryptingService, useClass: CryptoService }],
})
export class EncryptingModule {}
