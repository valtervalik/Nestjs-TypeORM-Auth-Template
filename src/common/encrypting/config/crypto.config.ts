import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { CryptoConfig } from './crypto-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  PRIVATE_KEY_PATH: string;

  @IsString()
  PUBLIC_KEY_PATH: string;
}

export default registerAs<CryptoConfig>('crypto', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    privateKey: process.env.PRIVATE_KEY_PATH,
    publicKey: process.env.PUBLIC_KEY_PATH,
  };
});
