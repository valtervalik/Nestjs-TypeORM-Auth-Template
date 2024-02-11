import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { EncryptingService } from 'src/common/encrypting/encrypting.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly encryptingService: EncryptingService,
  ) {}

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.getOrThrow('TFA_APP_NAME');
    const uri = authenticator.keyuri(email, appName, secret);

    return { secret, uri };
  }

  async verifyCode(code: string, encryptedSecret: string) {
    const decrypted = await this.encryptingService.decrypt(encryptedSecret);

    return authenticator.verify({ token: code, secret: decrypted });
  }

  async enableTFAForUser(email: string, secret: string) {
    const encrypted = await this.encryptingService.encrypt(secret);

    try {
      await this.userRepository.update(
        { email },
        { tfaSecret: encrypted, isTFAEnabled: true },
      );
    } catch (err) {
      throw new NotFoundException('No user found');
    }
  }

  async disableTFAForUser(email: string) {
    try {
      await this.userRepository.update({ email }, { isTFAEnabled: false });
      return;
    } catch {
      throw new NotFoundException('No user found');
    }
  }
}
