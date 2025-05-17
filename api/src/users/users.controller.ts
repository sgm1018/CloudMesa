import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginGuard } from '../auth/guards/login.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}



  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAll() {
    const result = await this.usersService.findAll();
    if (!result.isSuccess()) {
      throw new Error('Error fetching users');
    }
    return result.list;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() userDto: User) {
    const result = await this.usersService.create(userDto);
    if (!result.isSuccess()) {
      throw new Error('Error creating user');
    }
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
     const result = await this.usersService.findOne({id: id});
     if (!result.isSuccess()) {
        throw new Error('User not found');
      }
      return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    if (!result.isSuccess()) {
      throw new Error('Error deleting user');
    }
    return result.value;
  }
}