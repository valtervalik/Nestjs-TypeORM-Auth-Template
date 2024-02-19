import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { BaseService } from 'src/base/base.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import {
  InvalidateRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage/refresh-token-ids.storage';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';

@Injectable()
export class AuthenticationService extends BaseService<User>(User) {
  constructor(
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {
    super();
  }

  async refreshToken(refreshToken: string, response: Response) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.genericRepository.findOne({
        where: { id: sub },
        relations: { role: true, permission: true },
      });

      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh token is invalid');
      }

      return await this.generateTokens(user, response);
    } catch (e) {
      if (e instanceof InvalidateRefreshTokenError) {
        //TODO: notify the user that his refresh token might have been stolen
        throw new UnauthorizedException('Access denied');
      }

      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async generateTokens(user: User, response: Response) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTTL,
        { email: user.email, role: user.role, permission: user.permission },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTTL, {
        refreshTokenId,
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/auth/refresh-token',
      maxAge: this.jwtConfiguration.refreshTokenTTL * 1000,
      secure: true,
    });
    return { accessToken };
  }

  async validateUser(
    email: string,
    pass: string,
    tfaCode?: string,
  ): Promise<User> {
    const user = await this.genericRepository.findOne({
      where: { email },
      relations: { role: true, permission: true },
      select: ['id', 'email', 'password', 'isTFAEnabled', 'tfaSecret'],
    });

    if (!user) {
      throw new UnauthorizedException('Bad credentials');
    }

    if (!user.password) {
      if (user.googleId) {
        throw new UnauthorizedException('Login with your Google account');
      }
      throw new UnauthorizedException();
    }

    const isValidPassword = await this.hashingService.compare(
      pass,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Bad credentials');
    }

    if (
      user.isTFAEnabled &&
      !(await this.twoFactorAuthService.verifyCode(tfaCode, user.tfaSecret))
    ) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const { password, ...rest } = user;

    return rest;
  }
}
