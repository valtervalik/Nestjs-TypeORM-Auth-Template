import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { CryptoConfig } from './crypto-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  CRYPTO_ALGORITHM: string;

  @IsString()
  @IsOptional()
  CRYPTO_KEY: string;

  @IsString()
  @IsOptional()
  CRYPTO_IV: string;
}

export default registerAs<CryptoConfig>('crypto', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    algorithm: process.env.CRYPTO_ALGORITHM,
    key: process.env.CRYPTO_KEY,
    iv: process.env.CRYPTO_IV,
  };
});
