import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class EncryptingService {
  abstract encrypt(str: string): Promise<string>;
  abstract decrypt(encryptedStr: string): Promise<string>;
  abstract generatePassword(length: number): Promise<string>;
}
