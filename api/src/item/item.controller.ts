import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';
import { User, UserDecoratorClass } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { PaginationParams } from 'src/shared/responses/paginationParams';
import { Item } from './entities/item.entity';
import { ChunkUploadDto, FinishUploadDto } from './dto/chunk-upload.dto';
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
  async uploadFile(@User() user : UserDecoratorClass , @Body() createItem: Item, @UploadedFile() encryptedFile: Express.Multer.File) {
    const result = await this.itemsService.uploadFile(user.userId , createItem, encryptedFile);
    if (!result.isSuccess()) {
      throw new BadRequestException('Error creating item');
    }
    return result.value;
  }

  // ============ CHUNK UPLOAD ENDPOINTS ============

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Post('chunk-upload/init')
  @ApiBody({
    description: 'Inicializar subida en chunks',
    schema: {
      type: 'object',
      properties: {
        totalSize: { type: 'number', example: 1048576 },
        totalChunks: { type: 'number', example: 5 }
      },
      required: ['totalSize', 'totalChunks']
    }
  })
  async initChunkUpload(
    @User() user: UserDecoratorClass,
    @Body() body: { totalSize: number; totalChunks: number }
  ) {
    const result = await this.itemsService.initializeChunkUpload(
      user.userId,
      body.totalSize,
      body.totalChunks
    );
    
    if (!result.isSuccess()) {
      throw new BadRequestException(result.message);
    }
    
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Post('chunk-upload/chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Subir un chunk del archivo',
    schema: {
      type: 'object',
      properties: {
        uploadId: { type: 'string', example: 'upload_123456789' },
        chunkNumber: { type: 'number', example: 0 },
        totalChunks: { type: 'number', example: 5 },
        totalSize: { type: 'number', example: 1048576 },
        chunk: { type: 'string', format: 'binary' }
      },
      required: ['uploadId', 'chunkNumber', 'totalChunks', 'totalSize', 'chunk']
    }
  })
  async uploadChunk(
    @User() user: UserDecoratorClass,
    @Body() chunkData: ChunkUploadDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Chunk file is required');
    }

    const result = await this.itemsService.uploadChunk(user.userId, chunkData, file);
    
    if (!result.isSuccess()) {
      throw new BadRequestException(result.message);
    }
    
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Post('chunk-upload/finish')
  @ApiBody({
    description: 'Finalizar subida en chunks y crear el archivo',
    type: FinishUploadDto
  })
  async finishChunkUpload(
    @User() user: UserDecoratorClass,
    @Body() body: { uploadId: string; itemData: any },
  ) {   
    const { uploadId, itemData } = body;
    const result = await this.itemsService.finishChunkUpload(user.userId, uploadId, itemData);
    
    if (!result.isSuccess()) {
      throw new BadRequestException(result.message);
    }
    
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Get('chunk-upload/status/:uploadId')
  @ApiParam({ name: 'uploadId', description: 'ID de la subida', type: String })
  async getChunkUploadStatus(
    @User() user: UserDecoratorClass,
    @Param('uploadId') uploadId: string
  ) {
    const result = await this.itemsService.getChunkUploadStatus(user.userId, uploadId);
    
    if (!result.isSuccess()) {
      throw new BadRequestException(result.message);
    }
    
    return result.value;
  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Delete('chunk-upload/cancel/:uploadId')
  @ApiParam({ name: 'uploadId', description: 'ID de la subida a cancelar', type: String })
  async cancelChunkUpload(
    @User() user: UserDecoratorClass,
    @Param('uploadId') uploadId: string
  ) {
    const result = await this.itemsService.cancelChunkUpload(user.userId, uploadId);
    
    if (!result.isSuccess()) {
      throw new BadRequestException(result.message);
    }
    
    return result.value;
  }

}  