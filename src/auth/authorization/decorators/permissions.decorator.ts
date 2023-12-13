import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../permission.type';
import { PERMISSIONS_KEY } from 'src/auth/auth.constants';

export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
