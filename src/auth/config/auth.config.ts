import { registerAs } from '@nestjs/config';
import { IsNumber, IsString, Min } from 'class-validator';
import { AuthConfig } from 'src/auth/config/auth-config.type';
import validateConfig from '../../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_TOKEN_AUDIENCE: string;

  @IsString()
  JWT_TOKEN_ISSUER: string;

  @IsNumber()
  @Min(0)
  JWT_ACCESS_TOKEN_TTL: number;

  @IsNumber()
  @Min(0)
  JWT_REFRESH_TOKEN_TTL: number;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    secret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTTL: parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10),
    refreshTokenTTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL, 10),
  };
});
