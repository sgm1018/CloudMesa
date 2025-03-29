import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import { Reflector } from '@nestjs/core';
import { LoginGuard } from './guards/login.guard';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ 
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService],
  exports: [AuthService],
})
export class AuthModule {}