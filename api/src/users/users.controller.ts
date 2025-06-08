import { Types } from 'mongoose';
import { Observable } from 'rxjs';
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginGuard } from '../auth/guards/login.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationParams } from 'src/shared/responses/paginationParams';
import { User, UserDecoratorClass } from 'src/auth/decorators/user.decorator';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}



  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @ApiQuery({ name: 'page', description: 'Número de página', type: Number, required: false })
  @ApiQuery({ name: 'limit', description: 'Elementos por página', type: Number, required: false })
  @Get()
  async findUsersPaginated(@Query() paginationParams: PaginationParams) {
    const result = await this.usersService.findPaginated({}, paginationParams);
    if (!result.isSuccess()) {
      throw new Error('Error fetching users');
    }
    return result.list;
  }
  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Get('publickey')
  async getPublicKey(@User() user: UserDecoratorClass) {
    const result = await this.usersService.findOne({ _id: new Types.ObjectId(user.userId) });
    if (!result.isSuccess()) {
      throw new Error('User not found');
    }
    return result.value?.publicKey;
  }
  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Put('publickey')
  async updatePublicKey(@User() user: UserDecoratorClass, @Query('publicKey') publicKey: string) {
    const result = await this.usersService.updatatePublicKey(user.userId, publicKey);
    if (!result.isSuccess()) {
      throw new Error('Error updating public key');
    }
    return result.value;    

  }

  // @UseGuards(LoginGuard, RolesGuard)
  // @Roles('admin')
  // @Post()
  // async create(@Body() userDto: User) {
  //   const result = await this.usersService.create(userDto);
  //   if (!result.isSuccess()) {
  //     throw new Error('Error creating user');
  //   }
  //   return result.value;
  // }

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