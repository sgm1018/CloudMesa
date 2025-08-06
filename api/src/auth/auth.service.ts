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
import { RefreshToken } from 'src/users/entities/RefreshToken.entity';
import { UserDecoratorClass } from './decorators/user.decorator';
import { ApiResponse } from 'src/shared/responses/ApiResponse';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) : Promise<ApiResponse<LoginTokenDto>> {
    const userExist = await this.usersService.findOne({
      email: registerDto.email,
    });
    if (userExist.isSuccess()) {
      return ApiResponse.error(-1, 'User already exists with this email');
    }

    const passwordHash = await this.hashPassword(registerDto.password);
    const user: User = new User();
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
      return ApiResponse.error(-1, 'Error creating user');
    }
    const tokens = await this.generateTokens(userCreado.value!);
    if (!tokens) {
      return ApiResponse.error(-1, 'Error generating tokens');
    }

    const loginDto = new LoginTokenDto().createFromUser(
      userCreado.value!,
      tokens.accessToken,
      tokens.refreshToken,
    );
    return ApiResponse.item(loginDto);
  }

  async login(loginDto: LoginDto) : Promise<ApiResponse<LoginTokenDto>> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return ApiResponse.error(-1, 'Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    if (!tokens) {
      return ApiResponse.error(-1, 'Error generating tokens');
    }
    const loginTokenDto = new LoginTokenDto().createFromUser(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
    return ApiResponse.item(loginTokenDto);
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOne({ email: email });
    if (!user.isSuccess()) {
      return null;
    }
    if (await bcrypt.compare(password, user.value!.passwordHash)) {
      return user.value!;
    }
    return null;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.generatePayload(user);

    // Crear access token (corta duración)
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '28800000'), // 15 minutes = 900000, for development 8hours = 28800000: 
      },
    );

    // Crear refresh token (larga duración)
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '28800000'), // 8 hours
      },
    );

    const refreshTokenObj = new RefreshToken();
    refreshTokenObj.token = refreshToken;
    refreshTokenObj.revoked = false;
    refreshTokenObj.expiresAt = new Date(
      Date.now() +
        parseInt(this.configService.get('JWT_REFRESH_EXPIRATION', '28800000')),
    ); // 8 hours
    refreshTokenObj.createdAt = new Date();

    // update token
    await this.usersService.updateRefreshToken(
      user._id!.toString(),
      refreshTokenObj,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId : string, refreshTokenStr: string) : Promise<ApiResponse<LoginTokenDto>> {
    const userResult =
      await this.usersService.findOneByRefreshToken(userId, refreshTokenStr);
    if (!userResult.isSuccess()) {
      return ApiResponse.empty<LoginTokenDto>();
    }

    const user = userResult.value!;

    if (
      !user.refreshToken ||
      user.refreshToken.token !== refreshTokenStr ||
      user.refreshToken.revoked
    ) {
      return ApiResponse.empty<LoginTokenDto>();
    }

    // verify token
    try {
      const payload = this.jwtService.verify(refreshTokenStr);
      if (payload.type != 'refresh') {
        return ApiResponse.empty<LoginTokenDto>();
      }
    } catch (error) {
      return ApiResponse.empty<LoginTokenDto>();
    }

    // reovoke token
    await this.usersService.revokeRefreshToken(user._id?.toString()!);

    // gen new tokens
    const tokens = await this.generateTokens(user);

    const userLoginDto = new LoginTokenDto().createFromUser(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
    return ApiResponse.item(userLoginDto);
  }

  public async logout(userId: string, refreshTokenStr: string) : Promise<ApiResponse<string>> {
    const userResult =
      await this.usersService.findOneByRefreshToken(userId, refreshTokenStr);
    if (!userResult.isSuccess()) {
      return ApiResponse.empty<string>('Invalid refresh token');
    }

    const user = userResult.value!;

    if (
      !user.refreshToken ||
      user.refreshToken.token !== refreshTokenStr ||
      user.refreshToken.revoked
    ) {
      return ApiResponse.empty<string>('Invalid refresh token');
    }

    // revoke token
    await this.usersService.revokeRefreshToken(user._id?.toString()!);
    return ApiResponse.item('Logout successful');
  }

  public generatePayload(user: User): UserDecoratorClass {
    const userDecoratorClass = new UserDecoratorClass(user._id!.toString(), user.email, user.roles, user.name, user.isVerified, user.isActive);
    return userDecoratorClass;
  }
}
