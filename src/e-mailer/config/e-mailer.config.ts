import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { EMailerConfig } from './e-mailer-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  EMAIL_USER: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSKEY: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME: string;

  @IsString()
  @IsOptional()
  EMAIL_SERVICE: string;
}

export default registerAs<EMailerConfig>('emailer', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    user: process.env.EMAIL_USER,
    passkey: process.env.EMAIL_PASSKEY,
    username: process.env.EMAIL_USERNAME,
    service: process.env.EMAIL_SERVICE,
  };
});
