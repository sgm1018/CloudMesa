import { Document } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginTokenDto } from './dto/loginToken.dto';
import { UserGetDto } from 'src/users/dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}



  async register(registerDto: RegisterDto) {
    const userExist =  await this.usersService.findOne({email : registerDto.email})
    if (userExist.isSuccess()){
      throw new Error('User already exists');
    }
  
    const passwordHash = await this.hashPassword(registerDto.password);
    const user : User = new User();
    user.name = registerDto.name;
    user.surname = registerDto.surname;
    user.email = registerDto.email;
    user.publicKey = registerDto.publicKey; 
    user.passwordHash = passwordHash;
    user.maxSize = 1000000; // 1MB
    user.isActive = true;
    user.isVerified = false;
    user.roles = ['user']; // Default role
    user.avatar = ''; // Default avatar
    const userCreado = await this.usersService.create(user);
    if (!userCreado.isSuccess()) {
      throw new Error('Error creating user');
    }
    const payload = { 
      email: userCreado.value!.email, 
      sub: userCreado.value!._id,
      roles: userCreado.value!.roles,
      name: userCreado.value!.name,
      isVerified: userCreado.value!.isVerified,
      isActive: userCreado.value!.isActive
    };
    return new LoginTokenDto().createFromUser(
      userCreado.value!, 
      this.jwtService.sign(payload)
    );
  }


  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (user) {
      const payload = { 
        email: user.email, 
        sub: user._id,
        roles: user.roles,
        name: user.name,
        isVerified: user.isVerified,
        isActive: user.isActive
      };
      return new LoginTokenDto().createFromUser(user, this.jwtService.sign(payload));
    }
    throw new Error('Invalid credentials');
  }

  private async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne({ email: email });
    if (!user.isSuccess()){
      throw new Error('Error finding user');
    }
    if ( await bcrypt.compare(password, user.value!.passwordHash)) {
      return user.value!;
    }
    return null;
  }


  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}