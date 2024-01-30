import { Injectable } from '@nestjs/common';
import { EncryptingService } from './encrypting.service';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomInt } from 'crypto';

@Injectable()
export class CryptoService implements EncryptingService {
  private readonly algorithm =
    this.configService.get<string>('CRYPTO_ALGORITHM');
  private readonly key = Buffer.from(
    this.configService.get<string>('CRYPTO_KEY'),
    'hex',
  );
  private readonly iv = Buffer.from(
    this.configService.get<string>('CRYPTO_IV'),
    'hex',
  );
  constructor(private readonly configService: ConfigService) {}

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

  async generatePassword(length: number): Promise<string> {
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
