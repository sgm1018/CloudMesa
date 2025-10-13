import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto, UpdateBoardDto, ShareBoardDto, RemoveShareDto } from './dto';

// Nota: Usar el guard de autenticación que ya tienes en tu proyecto
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
// @UseGuards(JwtAuthGuard) // Descomentar cuando integres con autenticación
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  async create(@Request() req, @Body() createBoardDto: CreateBoardDto) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id'; // Ajustar según tu auth
    return await this.boardService.createBoard(userId, createBoardDto);
  }

  @Get()
  async findAll(@Request() req, @Query('filter') filter?: string) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    
    if (filter === 'own') {
      return await this.boardService.findOwn(userId);
    } else if (filter === 'shared') {
      return await this.boardService.findShared(userId);
    }
    
    return await this.boardService.findAllBoards(userId);
  }

  @Get('search')
  async search(@Request() req, @Query('q') query: string) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.search(userId, query);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.findOneBoard(id, userId);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.updateBoard(id, userId, updateBoardDto);
  }

  @Patch(':id/elements')
  async updateElements(
    @Request() req,
    @Param('id') id: string,
    @Body('elements') elements: any[],
  ) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.updateElements(id, userId, elements);
  }

  @Patch(':id/viewport')
  async updateViewport(
    @Request() req,
    @Param('id') id: string,
    @Body() viewport: { x: number; y: number; zoom: number },
  ) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.updateViewport(id, userId, viewport);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.removeBoard(id, userId);
  }

  @Post(':id/share')
  async share(
    @Request() req,
    @Param('id') id: string,
    @Body() shareBoardDto: ShareBoardDto,
  ) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.share(id, userId, shareBoardDto);
  }

  @Delete(':id/share')
  async removeShare(
    @Request() req,
    @Param('id') id: string,
    @Body() removeShareDto: RemoveShareDto,
  ) {
    const userId = req.user?.userId || req.user?.id || 'temp-user-id';
    return await this.boardService.removeShare(id, userId, removeShareDto);
  }
}
