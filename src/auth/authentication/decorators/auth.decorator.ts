import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY } from 'src/auth/auth.constants';
import { AuthType } from '../enums/auth-type.enum';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
