import { BaseService } from '../BaseService';
import {
  Board,
  CreateBoardDto,
  UpdateBoardDto,
  ShareBoardDto,
  RemoveShareDto,
  BoardElement,
  Viewport,
} from '../../types/board.types';

/**
 * Servicio HTTP para interactuar con la API de Boards
 */
class BoardService extends BaseService {
  private static instance: BoardService;

  private constructor() {
    super('boards');
  }

  public static getInstance(): BoardService {
    if (!BoardService.instance) {
      BoardService.instance = new BoardService();
    }
    return BoardService.instance;
  }

  /**
   * Crear un nuevo board
   */
  async createBoard(dto: CreateBoardDto): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error('Error creating board');
    return await response.json();
  }

  /**
   * Obtener todos los boards del usuario
   * @param filter - 'own' | 'shared' | undefined (all)
   */
  async getBoards(filter?: 'own' | 'shared'): Promise<Board[]> {
    const params = filter ? `?filter=${filter}` : '';
    const response = await fetch(`${this.baseUrl}${this.controller}${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error fetching boards');
    return await response.json();
  }

  /**
   * Obtener un board por ID
   */
  async getBoard(id: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error fetching board');
    return await response.json();
  }

  /**
   * Actualizar un board
   */
  async updateBoard(id: string, dto: UpdateBoardDto): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error('Error updating board');
    return await response.json();
  }

  /**
   * Actualizar solo los elementos del board (optimizado)
   */
  async updateElements(id: string, elements: BoardElement[]): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/elements`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ elements }),
    });

    if (!response.ok) throw new Error('Error updating elements');
    return await response.json();
  }

  /**
   * Actualizar viewport del board
   */
  async updateViewport(id: string, viewport: Viewport): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/viewport`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(viewport),
    });

    if (!response.ok) throw new Error('Error updating viewport');
    return await response.json();
  }

  /**
   * Eliminar un board (soft delete)
   */
  async deleteBoard(id: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error deleting board');
    return await response.json();
  }

  /**
   * Compartir board con otro usuario
   */
  async shareBoard(id: string, dto: ShareBoardDto): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error('Error sharing board');
    return await response.json();
  }

  /**
   * Remover acceso de un usuario
   */
  async removeShare(id: string, dto: RemoveShareDto): Promise<Board> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/share`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error('Error removing share');
    return await response.json();
  }

  /**
   * Buscar boards por nombre
   */
  async searchBoards(query: string): Promise<Board[]> {
    const response = await fetch(`${this.baseUrl}${this.controller}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error searching boards');
    return await response.json();
  }

  /**
   * Exportar board a diferentes formatos
   */
  async exportBoard(id: string, format: 'png' | 'svg' | 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/export?format=${format}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error exporting board');
    return await response.blob();
  }

  /**
   * Obtener estadísticas del board
   */
  async getBoardStats(id: string): Promise<{
    elementCount: number;
    collaboratorCount: number;
    lastModified: Date;
    size: number;
  }> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Error fetching board stats');
    return await response.json();
  }

  /**
   * Generar diagrama Mermaid usando IA
   */
  async generateMermaid(
    boardId: string,
    dto: { prompt: string; type: string }
  ): Promise<{ mermaidCode: string }> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${boardId}/generate-mermaid`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) throw new Error('Error generating mermaid diagram');
    return await response.json();
  }
}

// Singleton instance
export const boardService = BoardService.getInstance();

export default boardService;
