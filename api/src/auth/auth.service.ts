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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const userExist = await this.usersService.findOne({
      email: registerDto.email,
    });
    if (userExist.isSuccess()) {
      throw new Error('User already exists');
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
      throw new Error('Error creating user');
    }
    const tokens = await this.generateTokens(userCreado.value!);
    if (!tokens) {
      throw new Error('Error generating tokens');
    }

    return new LoginTokenDto().createFromUser(
      userCreado.value!,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    if (!tokens) {
      throw new Error('Error generating tokens');
    }
    return new LoginTokenDto().createFromUser(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOne({ email: email });
    if (!user.isSuccess()) {
      throw new Error('Error finding user');
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
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '900000'), // 15 minutes
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

  async refreshTokens(refreshTokenStr: string) {
    const userResult =
      await this.usersService.findOneByRefreshToken(refreshTokenStr);
    if (!userResult.isSuccess()) {
      throw new Error('Invalid refresh token');
    }

    const user = userResult.value!;

    if (
      !user.refreshToken ||
      user.refreshToken.token !== refreshTokenStr ||
      user.refreshToken.revoked
    ) {
      throw new Error('Invalid or expired refresh token');
    }

    // verify token
    try {
      const payload = this.jwtService.verify(refreshTokenStr);
      if (payload.type != 'refresh') {
        throw new Error('Invalid token type');
      }
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // reovoke token
    await this.usersService.revokeRefreshToken(user._id?.toString()!);

    // gen new tokens
    const tokens = await this.generateTokens(user);

    return new LoginTokenDto().createFromUser(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  public async logout(refreshTokenStr: string) {
    const userResult =
      await this.usersService.findOneByRefreshToken(refreshTokenStr);
    if (!userResult.isSuccess()) {
      throw new Error('Invalid refresh token');
    }

    const user = userResult.value!;

    if (
      !user.refreshToken ||
      user.refreshToken.token !== refreshTokenStr ||
      user.refreshToken.revoked
    ) {
      throw new Error('Invalid or expired refresh token');
    }

    // revoke token
    await this.usersService.revokeRefreshToken(user._id?.toString()!);

    return { message: 'Logout successful' };
  }

  public async generatePayload(user: User): Promise<any> {
    return {
      userId: user._id,
      email: user.email,
      sub: user._id,
      roles: user.roles,
      name: user.name,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  }
}
