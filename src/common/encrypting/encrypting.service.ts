import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class EncryptingService {
  abstract setKeys(privateKeyPath: string, publicKeyPath: string): void;
  abstract encryptWithPublicKey(str: string): Promise<string>;
  abstract encryptWithPrivateKey(str: string): Promise<string>;
  abstract decryptWithPublicKey(encryptedStr: string): Promise<string>;
  abstract decryptWithPrivateKey(encryptedStr: string): Promise<string>;
}
