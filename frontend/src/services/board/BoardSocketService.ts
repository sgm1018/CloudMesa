import { io, Socket } from 'socket.io-client';
import {
  BoardElement,
  Viewport,
  Collaborator,
} from '../../types/board.types';

/**
 * Tipos de eventos WebSocket
 */
type EventCallback = (...args: any[]) => void;

interface JoinBoardData {
  boardId: string;
  userId: string;
  username: string;
}

interface ElementCreatedData {
  element: BoardElement;
  userId: string;
  username: string;
}

interface ElementUpdatedData {
  elementId: string;
  updates: Partial<BoardElement>;
  userId: string;
  username: string;
}

interface ElementDeletedData {
  elementId: string;
  userId: string;
  username: string;
}

interface CursorMovedData {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
}

interface UserJoinedData {
  userId: string;
  username: string;
  color: string;
}

interface UserLeftData {
  userId: string;
  username: string;
}

interface BoardStateData {
  elements: BoardElement[];
  viewport: Viewport;
}

interface ElementsSyncedData {
  elements: BoardElement[];
  userId: string;
  username: string;
}

interface ElementSelectedData {
  userId: string;
  username: string;
  color: string;
  elementId: string;
}

/**
 * Servicio WebSocket para colaboración en tiempo real
 */
class BoardSocketService {
  private socket: Socket | null = null;
  private currentBoardId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = localStorage.getItem('token');
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    this.socket = io(`${wsUrl}/board`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupConnectionHandlers();
    console.log('Socket.IO client initialized');
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentBoardId = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Unirse a un board
   */
  joinBoard(boardId: string, userId: string, username: string): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    const data: JoinBoardData = { boardId, userId, username };
    this.socket.emit('join-board', data);
    this.currentBoardId = boardId;
    console.log(`Joining board: ${boardId}`);
  }

  /**
   * Salir de un board
   */
  leaveBoard(boardId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave-board', { boardId });
    this.currentBoardId = null;
    console.log(`Left board: ${boardId}`);
  }

  /**
   * Emitir que se creó un elemento
   */
  emitElementCreated(element: BoardElement): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('element-created', {
      boardId: this.currentBoardId,
      element,
    });
  }

  /**
   * Emitir que se actualizó un elemento
   */
  emitElementUpdated(elementId: string, updates: Partial<BoardElement>): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('element-updated', {
      boardId: this.currentBoardId,
      elementId,
      updates,
    });
  }

  /**
   * Emitir que se eliminó un elemento
   */
  emitElementDeleted(elementId: string): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('element-deleted', {
      boardId: this.currentBoardId,
      elementId,
    });
  }

  /**
   * Emitir movimiento de cursor
   */
  emitCursorMoved(x: number, y: number): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('cursor-moved', {
      boardId: this.currentBoardId,
      x,
      y,
    });
  }

  /**
   * Emitir sincronización de elementos
   */
  emitSyncElements(elements: BoardElement[]): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('sync-elements', {
      boardId: this.currentBoardId,
      elements,
    });
  }

  /**
   * Emitir actualización de viewport
   */
  emitViewportUpdated(viewport: Viewport): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('viewport-updated', {
      boardId: this.currentBoardId,
      viewport,
    });
  }

  /**
   * Emitir que se seleccionó un elemento
   */
  emitElementSelected(elementId: string): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('element-selected', {
      boardId: this.currentBoardId,
      elementId,
    });
  }

  /**
   * Emitir que se deseleccionó un elemento
   */
  emitElementDeselected(elementId: string): void {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit('element-deselected', {
      boardId: this.currentBoardId,
      elementId,
    });
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Escuchar cuando un usuario se une
   */
  onUserJoined(callback: (data: UserJoinedData) => void): void {
    this.on('user-joined', callback);
  }

  /**
   * Escuchar cuando un usuario sale
   */
  onUserLeft(callback: (data: UserLeftData) => void): void {
    this.on('user-left', callback);
  }

  /**
   * Escuchar lista de usuarios activos
   */
  onActiveUsers(callback: (users: Collaborator[]) => void): void {
    this.on('active-users', callback);
  }

  /**
   * Escuchar estado inicial del board
   */
  onBoardState(callback: (data: BoardStateData) => void): void {
    this.on('board-state', callback);
  }

  /**
   * Escuchar cuando se crea un elemento
   */
  onElementCreated(callback: (data: ElementCreatedData) => void): void {
    this.on('element-created', callback);
  }

  /**
   * Escuchar cuando se actualiza un elemento
   */
  onElementUpdated(callback: (data: ElementUpdatedData) => void): void {
    this.on('element-updated', callback);
  }

  /**
   * Escuchar cuando se elimina un elemento
   */
  onElementDeleted(callback: (data: ElementDeletedData) => void): void {
    this.on('element-deleted', callback);
  }

  /**
   * Escuchar cuando se mueve un cursor
   */
  onCursorMoved(callback: (data: CursorMovedData) => void): void {
    this.on('cursor-moved', callback);
  }

  /**
   * Escuchar cuando se sincronizan elementos
   */
  onElementsSynced(callback: (data: ElementsSyncedData) => void): void {
    this.on('elements-synced', callback);
  }

  /**
   * Escuchar cuando se selecciona un elemento
   */
  onElementSelected(callback: (data: ElementSelectedData) => void): void {
    this.on('element-selected', callback);
  }

  /**
   * Escuchar cuando se deselecciona un elemento
   */
  onElementDeselected(callback: (data: { userId: string; elementId: string }) => void): void {
    this.on('element-deselected', callback);
  }

  /**
   * Escuchar errores del servidor
   */
  onError(callback: (error: { message: string }) => void): void {
    this.on('error', callback);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Registrar un listener de evento
   */
  private on(event: string, callback: EventCallback): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remover un listener de evento
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Configurar manejadores de conexión
   */
  private setupConnectionHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Reintegrarse al board si estábamos en uno
      if (this.currentBoardId) {
        const userId = localStorage.getItem('userId') || '';
        const username = localStorage.getItem('username') || 'Anonymous';
        this.joinBoard(this.currentBoardId, userId, username);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
    });
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener ID del socket actual
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Obtener ID del board actual
   */
  getCurrentBoardId(): string | null {
    return this.currentBoardId;
  }
}

// Singleton instance
export const boardSocketService = new BoardSocketService();

export default boardSocketService;
