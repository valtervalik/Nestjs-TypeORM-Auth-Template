import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from 'src/auth/auth.constants';
import { UserRoles } from 'src/roles/enums/user-roles.enum';

export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
