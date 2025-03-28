import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginTokenDto } from './dto/loginToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}



  async register(registerDto: RegisterDto) {
    if (await this.usersService.findOne({email : registerDto.email})) {
      throw new Error('User already exists');
    }
    const passwordHash = await this.hashPassword(registerDto.password);
    const user : User = registerDto.toEntidad();
    user.passwordHash = passwordHash;
    user.maxSize = 1000000; // 1MB
    const userCreado = await this.usersService.create(user);
    return new LoginTokenDto().createFromUser(userCreado, this.jwtService.sign({ email: user.email, sub: user._id }));
  }


  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (user) {
      const payload = { email: user.email, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new Error('Invalid credentials');
  }

  private async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({ email: email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }


  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}