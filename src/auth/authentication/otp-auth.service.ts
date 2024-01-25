import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { EncryptingService } from 'src/encrypting/encrypting.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OtpAuthService {
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

    const { id } = await this.userRepository.findOneOrFail({
      where: { email },
      select: { id: true },
    });

    if (!id) {
      throw new BadRequestException('User not found');
    }

    await this.userRepository.update(
      { id },
      { tfaSecret: encrypted, isTFAEnabled: true },
    );
  }
}
