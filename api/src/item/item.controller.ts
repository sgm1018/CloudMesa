import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ItemsService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('items')
@ApiBearerAuth('JWT-auth')  
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // @Public()
  // @Post()
  // create(@Body() fileDto: ) {

  // }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: string) {
    const result = await this.itemsService.findOne({id: id});
    if (!result.isSuccess()) {
      throw new Error('Item not found');
    }
    return result.value;

  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.itemsService.remove(id);
    if (!result.isSuccess()) {
      throw new Error('Error deleting item');
    }
    return result.value;
  }
}