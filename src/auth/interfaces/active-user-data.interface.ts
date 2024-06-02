import { UUID } from 'crypto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';

export interface ActiveUserData {
  sub: UUID;

  email: string;

  role: Role;

  permission: Permission;
}
