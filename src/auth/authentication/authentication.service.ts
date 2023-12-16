import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import {
  InvalidateRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { OtpAuthService } from './otp-auth.service';
import { Response } from 'express';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly otpAuthService: OtpAuthService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = this.userRepository.create({
        email: signUpDto.email,
        password: await this.hashingService.hash(signUpDto.password),
      });
      await this.userRepository.save(user);
    } catch (e) {
      const pgUniqueViolationCode = '23505';
      if (e.code === pgUniqueViolationCode) {
        throw new ConflictException();
      }
      throw e;
    }
  }

  async signIn(signInDto: SignInDto, response: Response) {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
      relations: { role: true, permission: true },
      select: ['id', 'email', 'password', 'isTFAEnabled', 'tfaSecret'],
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (!user.password) {
      if (user.googleId) {
        throw new UnauthorizedException('Login with your Google account');
      }
      throw new UnauthorizedException();
    }

    const isValidPassword = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Password does not match');
    }

    if (
      user.isTFAEnabled &&
      !this.otpAuthService.verifyCode(signInDto.tfaCode, user.tfaSecret)
    ) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return await this.generateTokens(user, response);
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

      const user = await this.userRepository.findOne({
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
}
