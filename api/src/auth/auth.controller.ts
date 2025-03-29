import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginGuard } from './guards/login.guard';
import { RolesGuard } from './guards/roles.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('JWT-auth')  // El mismo nombre que usaste en main.ts
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Post('protected')
  @Roles('user') // Example role
  async protectedRoute() {
    return { message: 'This route is protected' };
  }
}