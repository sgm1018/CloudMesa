import { Roles } from './../decorators/roles.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRoles : string[] = request.user.roles;
    if (this.matchRoles(['admin'], userRoles)) {
      return true;
    }
    return userRoles && this.matchRoles(roles, userRoles);
  }

  private matchRoles(roles: string[], userRoles: string[]): boolean {
    return roles.some(role => userRoles.includes(role));
  }
}