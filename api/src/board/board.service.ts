import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Types } from 'mongoose';
import { Board, BoardDocument } from './entities/board.entity';
import { CreateBoardDto, UpdateBoardDto, ShareBoardDto, RemoveShareDto } from './dto';
import { BaseService } from '../base/base.service';

@Injectable()
export class BoardService extends BaseService<Board> {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {
    super(boardModel as any);
  }

  /**
   * Crear un nuevo board
   */
  async createBoard(userId: string, createBoardDto: CreateBoardDto): Promise<Board> {

    const newBoard = new Board();
    newBoard._id = new Types.ObjectId();
    newBoard.name = createBoardDto.name;
    newBoard.owner = userId;
    newBoard.elements = createBoardDto.elements || [];
    newBoard.viewport = createBoardDto.viewport || { x: 0, y: 0, zoom: 1 };
    newBoard.sharedConfig = [
      {
        userId,
        role: 'owner',
        },
    ];
    newBoard.cursors = [];
    newBoard.isDeleted = false;

    await this.boardModel.create(newBoard);
    // const newBoard = new this.boardModel({
    //   _id: new Types.ObjectId(),
    //   ...createBoardDto,
    //   owner: userId,
    //   elements: createBoardDto.elements || [],
    //   viewport: createBoardDto.viewport || { x: 0, y: 0, zoom: 1 },
    //   sharedConfig: [
    //     {
    //       userId,
    //       role: 'owner',
    //     },
    //   ],
    //   cursors: [],
    //   isDeleted: false,
    // });

    return newBoard;
  }

  /**
   * Obtener todos los boards del usuario (propios y compartidos)
   */
  async findAllBoards(userId: string): Promise<Board[]> {
    return await this.boardModel
      .find({
        $or: [
          { owner: userId, isDeleted: false },
          { 'sharedConfig.userId': userId, isDeleted: false },
        ],
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Obtener boards propios del usuario
   */
  async findOwn(userId: string): Promise<Board[]> {
    return await this.boardModel
      .find({
        owner: userId,
        isDeleted: false,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Obtener boards compartidos con el usuario
   */
  async findShared(userId: string): Promise<Board[]> {
    return await this.boardModel
      .find({
        'sharedConfig.userId': userId,
        owner: { $ne: userId },
        isDeleted: false,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Obtener un board por ID
   */
  async findOneBoard(boardId: string, userId: string): Promise<BoardDocument> {
    const board = await this.boardModel.findOne({
      _id: new Types.ObjectId(boardId),
      isDeleted: false,
    }).exec();

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Verificar permisos
    const hasAccess = this.checkUserAccess(board, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  /**
   * Actualizar un board
   */
  async updateBoard(
    boardId: string,
    userId: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    // Verificar permisos de escritura
    const canEdit = this.checkUserPermission(board, userId, 'write');
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this board');
    }

    // Actualizar board
    Object.assign(board, updateBoardDto);
    board.updatedAt = new Date();

    return await board.save();
  }

  /**
   * Actualizar solo los elementos del board (optimizado para WebSocket)
   */
  async updateElements(
    boardId: string,
    userId: string,
    elements: any[],
  ): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    const canEdit = this.checkUserPermission(board, userId, 'write');
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this board');
    }

    board.elements = elements;
    board.updatedAt = new Date();

    return await board.save();
  }

  /**
   * Actualizar viewport del board
   */
  async updateViewport(
    boardId: string,
    userId: string,
    viewport: { x: number; y: number; zoom: number },
  ): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    board.viewport = viewport;
    board.updatedAt = new Date();

    return await board.save();
  }

  /**
   * Soft delete de un board
   */
  async removeBoard(boardId: string, userId: string): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    // Solo el owner puede eliminar
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can delete this board');
    }

    board.isDeleted = true;
    board.deletedAt = new Date();

    return await board.save();
  }

  /**
   * Compartir board con otro usuario
   */
  async share(
    boardId: string,
    userId: string,
    shareBoardDto: ShareBoardDto,
  ): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    // Solo owner puede compartir
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can share this board');
    }

    // Verificar si el usuario ya tiene acceso
    const existingShare = board.sharedConfig.find(
      (config) => config.userId === shareBoardDto.userId,
    );

    if (existingShare) {
      // Actualizar rol existente
      existingShare.role = shareBoardDto.role;
      if (shareBoardDto.encryptedKey) {
        existingShare.encryptedKey = shareBoardDto.encryptedKey;
      }
      if (shareBoardDto.publicKey) {
        existingShare.publicKey = shareBoardDto.publicKey;
      }
    } else {
      // Añadir nuevo share
      board.sharedConfig.push({
        userId: shareBoardDto.userId,
        role: shareBoardDto.role,
        encryptedKey: shareBoardDto.encryptedKey,
        publicKey: shareBoardDto.publicKey,
      });
    }

    board.updatedAt = new Date();
    return await board.save();
  }

  /**
   * Remover acceso de un usuario
   */
  async removeShare(
    boardId: string,
    userId: string,
    removeShareDto: RemoveShareDto,
  ): Promise<Board> {
    const board = await this.findOneBoard(boardId, userId);

    // Solo owner puede remover accesos
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can remove access');
    }

    // No permitir remover al owner
    if (removeShareDto.userId === userId) {
      throw new ForbiddenException('Cannot remove owner access');
    }

    board.sharedConfig = board.sharedConfig.filter(
      (config) => config.userId !== removeShareDto.userId,
    );

    board.updatedAt = new Date();
    return await board.save();
  }

  /**
   * Actualizar cursores de colaboradores
   */
  async updateCursor(
    boardId: string,
    userId: string,
    username: string,
    x: number,
    y: number,
  ): Promise<void> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) return;

    const cursorIndex = board.cursors.findIndex((c) => c.userId === userId);
    
    const cursorData = {
      userId,
      username,
      color: this.getUserColor(userId),
      x,
      y,
      lastUpdate: new Date(),
    };

    if (cursorIndex >= 0) {
      board.cursors[cursorIndex] = cursorData;
    } else {
      board.cursors.push(cursorData);
    }

    // Limpiar cursores inactivos (>30 segundos)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    board.cursors = board.cursors.filter(
      (c) => c.lastUpdate > thirtySecondsAgo,
    );

    await board.save();
  }

  /**
   * Verificar si el usuario tiene acceso al board
   */
  private checkUserAccess(board: BoardDocument, userId: string): boolean {
    return board.owner === userId || board.sharedConfig.some((config) => config.userId === userId);
  }

  /**
   * Verificar permisos del usuario
   */
  private checkUserPermission(
    board: BoardDocument,
    userId: string,
    permission: 'read' | 'write' | 'delete' | 'share',
  ): boolean {
    const userConfig = board.sharedConfig.find(
      (config) => config.userId === userId,
    );

    if (!userConfig) return false;

    const { role } = userConfig;

    switch (permission) {
      case 'read':
        return ['owner', 'editor', 'viewer'].includes(role);
      case 'write':
        return ['owner', 'editor'].includes(role);
      case 'delete':
      case 'share':
        return role === 'owner';
      default:
        return false;
    }
  }

  /**
   * Generar color único para cada usuario basado en su ID
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];
    
    // Hash simple del userId para seleccionar color consistente
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Buscar boards por nombre
   */
  async search(userId: string, query: string): Promise<Board[]> {
    return await this.boardModel
      .find({
        $and: [
          {
            $or: [
              { owner: userId },
              { 'sharedConfig.userId': userId },
            ],
          },
          { name: { $regex: query, $options: 'i' } },
          { isDeleted: false },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .exec();
  }
}
