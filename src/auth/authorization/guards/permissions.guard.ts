import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionType } from '../permission.type';
import { PERMISSIONS_KEY, REQUEST_USER_KEY } from 'src/auth/auth.constants';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!contextPermissions) return true;

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    return contextPermissions.every(
      (permission) => user.permission && user.permission[permission],
    );
  }
}
