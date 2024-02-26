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

    return user;
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Req() request, @Res({ passthrough: true }) response: Response) {
    return await this.authenticationService.generateTokens(
      request.user,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
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
    return await this.twoFactorAuthService.disableTFAForUser(activeUser.email);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { message: 'Logout successful' };
  }
}
