import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    const isPublic = this.reflector.get<string[]>('isPublic', context.getHandler());
    if (!isPublic) {
      return true;
    }
    if (!token) {
      return false;
    }
    try {
      const user = this.jwtService.verify(token);
      request.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}