import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../auth/authentication/decorators/auth.decorator';
import { GoogleTokenDto } from '../auth/authentication/dto/google-token.dto';
import { AuthType } from '../auth/authentication/enums/auth-type.enum';
import { GoogleAuthService } from './google-auth.service';

@Auth(AuthType.None)
@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post()
  authenticate(
    @Body() tokenDto: GoogleTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.googleAuthService.authenticate(tokenDto.token, response);
  }
}
