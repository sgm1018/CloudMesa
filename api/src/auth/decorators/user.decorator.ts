import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UserDecoratorClass {
  public userId: string;
  public email: string;
  public roles: string[];
  public name: string;
  public isVerified: boolean;
  public isActive: boolean;
  constructor( 
    userId: string,
    email: string,
    roles: string[],
    name: string,
    isVerified: boolean,
    isActive: boolean,
  ) {
    this.userId = userId;
    this.email = email;
    this.roles = roles;
    this.name = name;
    this.isVerified = isVerified;
    this.isActive = isActive;
  }
}


export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);