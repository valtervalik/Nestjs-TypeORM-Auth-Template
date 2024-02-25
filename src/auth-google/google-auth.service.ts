import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { TypedEventEmitter } from 'src/common/types/typed-event-emitter/typed-event-emitter.class';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../auth/authentication/authentication.service';
import googleConfig from './config/google.config';

@Injectable()
export class GoogleAuthService {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly eventEmitter: TypedEventEmitter,
  ) {
    const clientId = this.googleConfiguration.clientId;
    const clientSecret = this.googleConfiguration.clientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string, response: Response) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      const { email, sub: googleId } = loginTicket.getPayload();

      const user = await this.userRepository.findOneBy({ googleId });
      if (user) {
        return this.authenticationService.generateTokens(user, response);
      } else {
        const newUser = await this.userRepository.save({ email, googleId });

        this.eventEmitter.emit('user.welcome', {
          email: newUser.email,
        });

        return this.authenticationService.generateTokens(newUser, response);
      }
    } catch (err) {
      const pgUniqueViolationCode = '23505';
      if (err.code === pgUniqueViolationCode) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
