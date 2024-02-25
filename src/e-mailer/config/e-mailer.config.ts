import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { EMailerConfig } from './e-mailer-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  EMAIL_USER: string;

  @IsString()
  EMAIL_PASSKEY: string;

  @IsString()
  EMAIL_USERNAME: string;

  @IsString()
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
