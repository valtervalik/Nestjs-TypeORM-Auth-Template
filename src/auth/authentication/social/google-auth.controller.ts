import { Body, Controller, Post, Res } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { Response } from 'express';

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
