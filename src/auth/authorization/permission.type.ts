import { UserPermissions } from 'src/users/enums/user.permissions';

export const Permission = {
  ...UserPermissions,
};

export type PermissionType = UserPermissions;
