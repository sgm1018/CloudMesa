import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ItemsService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationParams } from 'src/shared/responses/paginationParams';
import { CreateItemDto } from './dto/create-item.dto';
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
    const result = await this.itemsService.findOne({userId: id});
    if (!result.isSuccess()) {
      throw new BadRequestException(`Item with ID "${id}" not found for user "${user}"`);
    }
    return result.value;

  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.itemsService.remove(id);
    if (!result.isSuccess()) {
      throw new BadRequestException('Error deleting item');
    }
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Get('user/:id')
  async getItemsByIdPaginated(@User() user: string, @Param('id') id: string, PaginationParams : PaginationParams) {
    const result = await this.itemsService.findItemwByUserByParentIdPagination(user, id, PaginationParams)
    if (!result.isSuccess()){
      throw new BadRequestException('Error getting items');
    }
    return result.value;
  }

  @Public()
  @UseGuards(LoginGuard)
  @Post('random')
  async createRandom(@Body() createItem: CreateItemDto ) {
    const result = await this.itemsService.create(createItem.toClass());
    if (!result.isSuccess()) {
      throw new BadRequestException('Error creating item');
    }
    return result.value;
  }

}