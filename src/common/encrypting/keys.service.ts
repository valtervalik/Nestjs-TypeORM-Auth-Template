import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class KeysService {
  private privateKeyPath: string;
  private publicKeyPath: string;

  setPrivateKeyPath(path: string) {
    this.privateKeyPath = path;
  }

  setPublicKeyPath(path: string) {
    this.publicKeyPath = path;
  }

  getPrivateKey(): string {
    return fs.readFileSync(this.privateKeyPath, 'utf8');
  }

  getPublicKey(): string {
    return fs.readFileSync(this.publicKeyPath, 'utf8');
  }
}
