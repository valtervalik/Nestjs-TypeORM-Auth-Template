import { Injectable } from '@nestjs/common';
import {
  privateDecrypt,
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
} from 'crypto';
import { EncryptingService } from './encrypting.service';
import { KeysService } from './keys.service';

@Injectable()
export class CryptoService implements EncryptingService {
  constructor(private keyService: KeysService) {}

  setKeys(privateKeyPath: string, publicKeyPath: string): void {
    this.keyService.setPrivateKeyPath(privateKeyPath);
    this.keyService.setPublicKeyPath(publicKeyPath);
  }

  async encryptWithPublicKey(str: string): Promise<string> {
    const buffer = Buffer.from(str, 'utf8');
    const encrypted = publicEncrypt(this.keyService.getPublicKey(), buffer);
    return encrypted.toString('base64');
  }

  async encryptWithPrivateKey(str: string): Promise<string> {
    const buffer = Buffer.from(str, 'utf8');
    const encrypted = privateEncrypt(this.keyService.getPrivateKey(), buffer);
    return encrypted.toString('base64');
  }

  async decryptWithPublicKey(encryptedStr: string): Promise<string> {
    const buffer = Buffer.from(encryptedStr, 'base64');
    const decrypted = publicDecrypt(this.keyService.getPublicKey(), buffer);
    return decrypted.toString('utf8');
  }

  async decryptWithPrivateKey(encryptedStr: string): Promise<string> {
    const buffer = Buffer.from(encryptedStr, 'base64');
    const decrypted = privateDecrypt(this.keyService.getPrivateKey(), buffer);
    return decrypted.toString('utf8');
  }
}
