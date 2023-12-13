import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY, ROLES_KEY } from 'src/auth/auth.constants';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { UserRoles } from 'src/roles/enums/user-roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!contextRoles) return true;

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    return contextRoles.some((role) => user.role?.name === role);
  }
}
