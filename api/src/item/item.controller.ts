import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ItemsService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';
import { User, UserDecoratorClass } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationParams } from 'src/shared/responses/paginationParams';
import { Item } from './entities/item.entity';
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
  @Get()
  async getAll() {
    const result = await this.itemsService.findAll();
    if (!result.isSuccess()) {
      throw new BadRequestException(`Error getting items`);
    }
    return result.list;

  }

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
  @ApiParam({ name: 'id', description: 'ID del elemento padre', type: String })
  @ApiQuery({ name: 'page', description: 'Número de página', type: Number, required: false })
  @ApiQuery({ name: 'limit', description: 'Elementos por página', type: Number, required: false })
  @Get('parent/:id')
  async getItemsByIdPaginated(@User() user: UserDecoratorClass, @Param('id') parentId: string, @Query() paginationParams: PaginationParams) {
    const result = await this.itemsService.findPaginated({ userId: user.userId, parentId: parentId }, paginationParams);
    if (!result.isSuccess()){
      throw new BadRequestException('Error getting items');
    } 
    return result.list;
  }

  @Public()
  @UseGuards(LoginGuard)
  @Post('random')
  async createRandom(@Body() createItem: Item ) {
    const result = await this.itemsService.create(createItem);
    if (!result.isSuccess()) {
      throw new BadRequestException('Error creating item');
    }
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Post('create')
  async create(@User() user , @Body() createItem: Item) {
    const result = await this.itemsService.create(createItem);
    if (!result.isSuccess()) {
      throw new BadRequestException('Error creating item');
    }
    return result.value;
  }

}  