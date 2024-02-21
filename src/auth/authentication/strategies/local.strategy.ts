import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(
    email: string,
    password: string,
    tfaCode: string,
  ): Promise<any> {
    return await this.authenticationService.validateUser(
      email,
      password,
      tfaCode,
    );
  }
}
