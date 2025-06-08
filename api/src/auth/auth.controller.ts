import { ConfigService } from '@nestjs/config';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginGuard } from './guards/login.guard';
import { RolesGuard } from './guards/roles.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User, UserDecoratorClass } from './decorators/user.decorator';

@Controller('auth')
@ApiBearerAuth('JWT-auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    if (!result.isSuccess()) {
      throw new Error('Registration failed');
    }
    return result.value;
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {

    const result = await this.authService.login(loginDto);
    if (!result.isSuccess()){
      throw new Error(result.message);
    }
    return result.value;
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@User() user : UserDecoratorClass ,@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(user.userId, refreshTokenDto.refreshToken);
    if (!result.isSuccess()) {
      throw new Error(result.message);
    }
    return result.value;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: RefreshTokenDto })
  @UseGuards(LoginGuard)
  async logout(@User() user : UserDecoratorClass,  @Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.  authService.logout(user.userId ,refreshTokenDto.refreshToken);
    if (!result.isSuccess()) {
      throw new Error(result.message);
    }
    return result.value;
  }


  @UseGuards(LoginGuard, RolesGuard)
  @Post('protected')
  @Roles('user')
  async protectedRoute() {
    return { message: 'This route is protected' };
  }
}