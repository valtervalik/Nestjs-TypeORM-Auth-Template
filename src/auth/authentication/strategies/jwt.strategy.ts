import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.secret', { infer: true }),
    });
  }

  async validate(payload: ActiveUserData) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permission: payload.permission,
    };
  }
}
