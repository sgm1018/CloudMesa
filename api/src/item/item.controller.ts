import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, BadRequestException, UploadedFile } from '@nestjs/common';
import { ItemsService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';
import { User, UserDecoratorClass } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationParams } from 'src/shared/responses/paginationParams';
import { Item } from './entities/item.entity';
import { Types } from 'mongoose';
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
  @ApiQuery({ name: 'parentId', description: 'ID del elemento padre', type: String, required: false })
  @ApiQuery({ name: 'page', description: 'Número de página', type: Number, required: false })
  @ApiQuery({ name: 'limit', description: 'Elementos por página', type: Number, required: false })
  @Get('parent')
  async getItemsByIdPaginated(@User() user: UserDecoratorClass, @Query() paginationParams: PaginationParams) {
    if (paginationParams.page == 0 || paginationParams.page == null){
      paginationParams.page = 1;
    }
    if (paginationParams.limit == 0 || paginationParams.limit == null){
      paginationParams.limit = 10;
    }
    const typeArray = typeof paginationParams.itemTypes === 'string' ? JSON.parse(paginationParams.itemTypes) : paginationParams.itemTypes;
    const result = await this.itemsService.findPaginated({ userId: user.userId, parentId: paginationParams.parentId, type: { $in : typeArray} }, paginationParams);
    if (!result.isSuccess()){
      throw new BadRequestException('Error getting items');
    } 
    return result.list;
  }
  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @ApiQuery({ name: 'parentId', description: 'ID del elemento padre', type: String, required: false })
  @ApiQuery({ name: 'type', description: 'Tipo de item', type: String, required: true })
  @Get('count')
  async countItems(@User() user: UserDecoratorClass, @Query() query : { parentId?: string, type: string }) {
    const typeArray = typeof query.type === 'string' ? JSON.parse(query.type) : query.type;
    const result = await this.itemsService.countItems(user.userId, typeArray, query.parentId);
    if (!result.isSuccess()){
      throw new BadRequestException('Error counting items');
    } 
    return result.value;

  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @ApiQuery({ name: 'itemName', description: 'Nombre del item', type: String, required: true })
  @Get('search')
  async findSearchItems(@User() user: UserDecoratorClass, @Query() query: { itemName: string }) {

    const result = await this.itemsService.findContainName(user.userId, query.itemName);
    if (!result.isSuccess()){
      throw new BadRequestException('Error getting items');
    } 
    return result.list;
  }


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
  @Get('find/:id')
  async findOne(@Param('id') id: string, @User() user: UserDecoratorClass) {
    const result = await this.itemsService.findOne({_id: new Types.ObjectId(id), userId: user.userId});
    if (!result.isSuccess()) {
      throw new BadRequestException(`Item with ID "${id}" not found for user "${user.userId}"`);
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

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Post('upload')
  async uploadFile(@User() user : UserDecoratorClass , @Body() createItem: Item, @UploadedFile() file: Express.Multer.File) {
    const result = await this.itemsService.uploadFile(user.userId , createItem, file);
    if (!result.isSuccess()) {
      throw new BadRequestException('Error creating item');
    }
    return result.value;
  }

}  