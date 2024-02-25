import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv } from 'crypto';
import { AllConfigType } from 'src/config/config.type';
import { EncryptingService } from './encrypting.service';

@Injectable()
export class CryptoService implements EncryptingService {
  private readonly algorithm = this.configService.get<string>(
    'crypto.algorithm',
    { infer: true },
  );
  private readonly key = Buffer.from(
    this.configService.get<string>('crypto.key', { infer: true }),
    'hex',
  );
  private readonly iv = Buffer.from(
    this.configService.get<string>('crypto.iv', { infer: true }),
    'hex',
  );
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async encrypt(str: string): Promise<string> {
    let cipher = createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async decrypt(encryptedStr: string): Promise<string> {
    let decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedStr, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
