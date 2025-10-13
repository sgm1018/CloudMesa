/**
 * ITool.ts
 * 
 * Interface base para todas las herramientas del Board.
 * Define el contrato que deben cumplir todas las herramientas.
 */

import { Point, ToolOptions, BoardElement } from '../../../types/board.types';

/**
 * Configuración de una herramienta
 */
export interface ToolConfig {
  requiresSelection?: boolean;      // Si la herramienta requiere elementos seleccionados
  supportsMultiSelect?: boolean;    // Si soporta selección múltiple
  showInToolbar?: boolean;          // Si se muestra en la barra de herramientas
  shortcut?: string;                // Atajo de teclado (ej: 'r', 's', 'v')
  category?: 'draw' | 'shape' | 'text' | 'utility';  // Categoría de la herramienta
}

/**
 * Callbacks para interactuar con el contexto del Board
 */
export interface ToolCallbacks {
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  deleteElement: (id: string) => void;
}

/**
 * Interface para todas las herramientas
 */
export interface ITool {
  name: string;                     // Nombre único de la herramienta
  icon: string;                     // Nombre del icono (lucide-react)
  cursor: string;                   // CSS cursor cuando la herramienta está activa
  
  // Lifecycle hooks
  onActivate(): void;               // Se ejecuta al activar la herramienta
  onDeactivate(): void;             // Se ejecuta al desactivar la herramienta
  
  // Event handlers
  onMouseDown(point: Point, event: MouseEvent): void;
  onMouseMove(point: Point, event: MouseEvent): void;
  onMouseUp(point: Point, event: MouseEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  
  // Renderizado
  renderPreview(): JSX.Element | null;  // Renderiza preview mientras se dibuja
  getPreviewElement(): BoardElement | null;  // Obtiene el elemento preview actual
  
  // Configuración
  getConfig(): ToolConfig;
  
  // Callbacks
  setCallbacks(callbacks: ToolCallbacks): void;
}

/**
 * Clase base abstracta para herramientas
 * Proporciona implementación común para todas las herramientas
 */
export abstract class BaseTool implements ITool {
  protected isActive = false;
  protected startPoint: Point | null = null;
  protected currentPoint: Point | null = null;
  protected toolOptions: ToolOptions | null = null;
  protected callbacks: ToolCallbacks | null = null;

  abstract name: string;
  abstract icon: string;
  abstract cursor: string;

  /**
   * Establece los callbacks para interactuar con el contexto
   */
  setCallbacks(callbacks: ToolCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Activa la herramienta
   */
  onActivate(): void {
    this.isActive = true;
    console.log(`Tool activated: ${this.name}`);
  }

  /**
   * Desactiva la herramienta
   */
  onDeactivate(): void {
    this.isActive = false;
    this.startPoint = null;
    this.currentPoint = null;
    console.log(`Tool deactivated: ${this.name}`);
  }

  /**
   * Establece las opciones de la herramienta
   */
  setToolOptions(options: ToolOptions): void {
    this.toolOptions = options;
  }

  /**
   * Obtiene las opciones actuales
   */
  getToolOptions(): ToolOptions | null {
    return this.toolOptions;
  }

  // Métodos abstractos que deben implementar las herramientas concretas
  abstract onMouseDown(point: Point, event: MouseEvent): void;
  abstract onMouseMove(point: Point, event: MouseEvent): void;
  abstract onMouseUp(point: Point, event: MouseEvent): void;

  /**
   * Handler de teclado (opcional, puede ser sobreescrito)
   */
  onKeyDown(_event: KeyboardEvent): void {
    // Override si es necesario
  }

  /**
   * Renderiza preview (opcional)
   */
  renderPreview(): JSX.Element | null {
    return null;
  }

  /**
   * Obtiene el elemento preview actual (debe ser implementado por cada herramienta)
   */
  getPreviewElement(): BoardElement | null {
    return null;
  }

  /**
   * Configuración por defecto
   */
  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'draw',
    };
  }

  /**
   * Calcula el rectángulo entre dos puntos
   */
  protected calculateRect(start: Point, end: Point): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return { x, y, width, height };
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  protected distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Verifica si un clic fue muy pequeño (probablemente un clic simple)
   */
  protected isClick(start: Point, end: Point, threshold = 5): boolean {
    return this.distance(start, end) < threshold;
  }
}
