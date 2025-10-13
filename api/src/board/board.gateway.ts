import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardService } from './board.service';
import { Logger } from '@nestjs/common';

/**
 * Datos del cliente conectado
 */
interface ClientData {
  userId: string;
  username: string;
  boardId: string;
  color: string;
}

/**
 * WebSocket Gateway para colaboración en tiempo real en Boards
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Ajustar en producción
  },
  namespace: '/board',
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BoardGateway.name);
  private clients: Map<string, ClientData> = new Map();

  constructor(private readonly boardService: BoardService) {}

  /**
   * Evento cuando un cliente se conecta
   */
  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Evento cuando un cliente se desconecta
   */
  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const clientData = this.clients.get(client.id);
    if (clientData) {
      // Notificar a otros usuarios en el board
      client.to(clientData.boardId).emit('user-left', {
        userId: clientData.userId,
        username: clientData.username,
      });
      
      this.clients.delete(client.id);
    }
  }

  /**
   * Unirse a un board
   */
  @SubscribeMessage('join-board')
  async handleJoinBoard(
    @MessageBody() data: { boardId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, userId, username } = data;

      // Verificar que el usuario tenga acceso al board
      const board = await this.boardService.findOneBoard(boardId, userId);

      if (!board) {
        client.emit('error', { message: 'Board not found or access denied' });
        return;
      }

      // Unirse a la room del board
      await client.join(boardId);

      // Generar color único para el usuario
      const color = this.getUserColor(userId);

      // Guardar información del cliente
      this.clients.set(client.id, {
        userId,
        username,
        boardId,
        color,
      });

      // Notificar a otros usuarios
      client.to(boardId).emit('user-joined', {
        userId,
        username,
        color,
      });

      // Enviar lista de usuarios activos al cliente
      const activeUsers = Array.from(this.clients.values())
        .filter((c) => c.boardId === boardId && c.userId !== userId)
        .map((c) => ({ userId: c.userId, username: c.username, color: c.color }));

      client.emit('active-users', activeUsers);

      // Enviar estado actual del board
      client.emit('board-state', {
        elements: board.elements,
        viewport: board.viewport,
      });

      this.logger.log(`User ${username} (${userId}) joined board ${boardId}`);
    } catch (error) {
      this.logger.error('Error joining board:', error);
      client.emit('error', { message: 'Failed to join board' });
    }
  }

  /**
   * Salir de un board
   */
  @SubscribeMessage('leave-board')
  async handleLeaveBoard(
    @MessageBody() data: { boardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId } = data;
    const clientData = this.clients.get(client.id);

    if (clientData) {
      await client.leave(boardId);
      
      client.to(boardId).emit('user-left', {
        userId: clientData.userId,
        username: clientData.username,
      });

      this.clients.delete(client.id);
      this.logger.log(`User ${clientData.username} left board ${boardId}`);
    }
  }

  /**
   * Elemento creado
   */
  @SubscribeMessage('element-created')
  async handleElementCreated(
    @MessageBody() data: { boardId: string; element: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, element } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) {
        client.emit('error', { message: 'Not connected to any board' });
        return;
      }

      // Broadcast a otros usuarios (excepto al emisor)
      client.to(boardId).emit('element-created', {
        element,
        userId: clientData.userId,
        username: clientData.username,
      });

      this.logger.debug(`Element created in board ${boardId} by ${clientData.username}`);
    } catch (error) {
      this.logger.error('Error creating element:', error);
      client.emit('error', { message: 'Failed to create element' });
    }
  }

  /**
   * Elemento actualizado
   */
  @SubscribeMessage('element-updated')
  async handleElementUpdated(
    @MessageBody() data: { boardId: string; elementId: string; updates: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, elementId, updates } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) {
        client.emit('error', { message: 'Not connected to any board' });
        return;
      }

      // Broadcast a otros usuarios
      client.to(boardId).emit('element-updated', {
        elementId,
        updates,
        userId: clientData.userId,
        username: clientData.username,
      });

      this.logger.debug(`Element ${elementId} updated in board ${boardId}`);
    } catch (error) {
      this.logger.error('Error updating element:', error);
      client.emit('error', { message: 'Failed to update element' });
    }
  }

  /**
   * Elemento eliminado
   */
  @SubscribeMessage('element-deleted')
  async handleElementDeleted(
    @MessageBody() data: { boardId: string; elementId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, elementId } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) {
        client.emit('error', { message: 'Not connected to any board' });
        return;
      }

      // Broadcast a otros usuarios
      client.to(boardId).emit('element-deleted', {
        elementId,
        userId: clientData.userId,
        username: clientData.username,
      });

      this.logger.debug(`Element ${elementId} deleted from board ${boardId}`);
    } catch (error) {
      this.logger.error('Error deleting element:', error);
      client.emit('error', { message: 'Failed to delete element' });
    }
  }

  /**
   * Cursor movido
   */
  @SubscribeMessage('cursor-moved')
  async handleCursorMoved(
    @MessageBody() data: { boardId: string; x: number; y: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, x, y } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) return;

      // Actualizar cursor en la base de datos (throttled)
      await this.boardService.updateCursor(
        boardId,
        clientData.userId,
        clientData.username,
        x,
        y,
      );

      // Broadcast a otros usuarios (sin esperar respuesta)
      client.to(boardId).emit('cursor-moved', {
        userId: clientData.userId,
        username: clientData.username,
        color: clientData.color,
        x,
        y,
      });
    } catch (error) {
      // No loggear errores de cursor para no saturar logs
    }
  }

  /**
   * Sincronización completa de elementos
   */
  @SubscribeMessage('sync-elements')
  async handleSyncElements(
    @MessageBody() data: { boardId: string; elements: any[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, elements } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) {
        client.emit('error', { message: 'Not connected to any board' });
        return;
      }

      // Guardar en base de datos
      await this.boardService.updateElements(boardId, clientData.userId, elements);

      // Broadcast a otros usuarios
      client.to(boardId).emit('elements-synced', {
        elements,
        userId: clientData.userId,
        username: clientData.username,
      });

      this.logger.debug(`Elements synced in board ${boardId} by ${clientData.username}`);
    } catch (error) {
      this.logger.error('Error syncing elements:', error);
      client.emit('error', { message: 'Failed to sync elements' });
    }
  }

  /**
   * Viewport actualizado (zoom/pan)
   */
  @SubscribeMessage('viewport-updated')
  async handleViewportUpdated(
    @MessageBody() data: { boardId: string; viewport: { x: number; y: number; zoom: number } },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { boardId, viewport } = data;
      const clientData = this.clients.get(client.id);

      if (!clientData) return;

      // Actualizar en base de datos
      await this.boardService.updateViewport(boardId, clientData.userId, viewport);

      // Opcional: Broadcast viewport a otros usuarios
      // client.to(boardId).emit('viewport-updated', { userId: clientData.userId, viewport });
    } catch (error) {
      this.logger.error('Error updating viewport:', error);
    }
  }

  /**
   * Elemento seleccionado (para mostrar indicador)
   */
  @SubscribeMessage('element-selected')
  async handleElementSelected(
    @MessageBody() data: { boardId: string; elementId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, elementId } = data;
    const clientData = this.clients.get(client.id);

    if (!clientData) return;

    client.to(boardId).emit('element-selected', {
      userId: clientData.userId,
      username: clientData.username,
      color: clientData.color,
      elementId,
    });
  }

  /**
   * Elemento deseleccionado
   */
  @SubscribeMessage('element-deselected')
  async handleElementDeselected(
    @MessageBody() data: { boardId: string; elementId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, elementId } = data;
    const clientData = this.clients.get(client.id);

    if (!clientData) return;

    client.to(boardId).emit('element-deselected', {
      userId: clientData.userId,
      elementId,
    });
  }

  /**
   * Generar color único para usuario
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }
}
