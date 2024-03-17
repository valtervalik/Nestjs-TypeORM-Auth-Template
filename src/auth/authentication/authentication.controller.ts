import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { toFileStream } from 'qrcode';
import { TypedEventEmitter } from 'src/common/types/typed-event-emitter/typed-event-emitter.class';
import { User } from 'src/users/entities/user.entity';
import { apiResponseHandler } from 'src/utils/apiResponseHandler';
import { REFRESH_TOKEN_KEY } from '../auth.constants';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators/auth.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authenticationService.create(signUpDto);

    this.eventEmitter.emit('user.welcome', {
      email: signUpDto.email,
    });

    return apiResponseHandler('User registered successfully', 201, user);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.authenticationService.generateTokens(
      request.user as User,
      response,
    );

    return apiResponseHandler('Login successful', 200, accessToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies[REFRESH_TOKEN_KEY];
    return this.authenticationService.refreshToken(refreshToken, response);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/generate')
  async generateQrCode(
    @ActiveUser() activeUser: ActiveUserData,
    @Res() response: Response,
  ) {
    const { secret, uri } = await this.twoFactorAuthService.generateSecret(
      activeUser.email,
    );

    await this.twoFactorAuthService.enableTFAForUser(activeUser.email, secret);
    response.type('png');
    return toFileStream(response, uri);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/disable')
  async disableTFA(@ActiveUser() activeUser: ActiveUserData) {
    await this.twoFactorAuthService.disableTFAForUser(activeUser.email);

    return apiResponseHandler(
      'Two-factor authentication disabled successfully',
      200,
    );
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(REFRESH_TOKEN_KEY);
    return apiResponseHandler('Logout successful', 200);
  }
}
