import {
  BoardElement,
  BoardElementType,
  ToolOptions,
  Point,
} from '../../types/board.types';

/**
 * Factory para crear elementos del Board
 * Centraliza la creación de elementos con validación y valores por defecto
 */
class BoardFactory {
  private userId: string;
  private nextZIndex: number = 0;

  constructor() {
    this.userId = localStorage.getItem('userId') || 'anonymous';
  }

  /**
   * Actualizar userId (cuando el usuario cambie)
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Actualizar el siguiente z-index
   */
  setNextZIndex(zIndex: number): void {
    this.nextZIndex = zIndex;
  }

  /**
   * Generar ID único para elemento
   */
  private generateId(): string {
    return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener timestamp actual
   */
  private now(): Date {
    return new Date();
  }

  /**
   * Crear base común para todos los elementos
   */
  private createBase(
    type: BoardElementType,
    x: number,
    y: number,
    options: Partial<ToolOptions>
  ): BoardElement {
    return {
      id: this.generateId(),
      type,
      x,
      y,
      zIndex: this.nextZIndex++,
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 2,
      fill: options.fill || '#ffffff',
      opacity: options.opacity || 1,
      fillStyle: options.fillStyle || 'solid',
      locked: false,
      createdBy: this.userId,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
  }

  // ============================================================================
  // SHAPE CREATORS
  // ============================================================================

  /**
   * Crear rectángulo
   */
  createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('rectangle', x, y, options),
      width,
      height,
      rotation: 0,
    };
  }

  /**
   * Crear círculo
   */
  createCircle(
    x: number,
    y: number,
    radius: number,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('circle', x, y, options),
      radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  /**
   * Crear diamante (rombo)
   */
  createDiamond(
    x: number,
    y: number,
    width: number,
    height: number,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('diamond', x, y, options),
      width,
      height,
      rotation: 0,
    };
  }

  // ============================================================================
  // LINE & ARROW CREATORS
  // ============================================================================

  /**
   * Crear línea
   */
  createLine(
    startPoint: Point,
    endPoint: Point,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('line', startPoint.x, startPoint.y, options),
      startPoint,
      endPoint,
      points: [startPoint, endPoint],
    };
  }

  /**
   * Crear flecha
   */
  createArrow(
    startPoint: Point,
    endPoint: Point,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('arrow', startPoint.x, startPoint.y, options),
      startPoint,
      endPoint,
      points: [startPoint, endPoint],
    };
  }

  // ============================================================================
  // TEXT CREATOR
  // ============================================================================

  /**
   * Crear texto
   */
  createText(
    x: number,
    y: number,
    text: string,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    const fontSize = options.fontSize || 16;
    const fontFamily = options.fontFamily || 'Inter, sans-serif';
    
    // Calcular ancho aproximado basado en el texto
    const estimatedWidth = text.length * fontSize * 0.6;
    const estimatedHeight = fontSize * 1.4;

    return {
      ...this.createBase('text', x, y, options),
      text,
      fontSize,
      fontFamily,
      textAlign: 'left',
      width: estimatedWidth,
      height: estimatedHeight,
      fill: 'transparent', // Texto no tiene fill
      stroke: options.stroke || '#000000',
    };
  }

  // ============================================================================
  // IMAGE CREATOR
  // ============================================================================

  /**
   * Crear imagen
   */
  createImage(
    x: number,
    y: number,
    width: number,
    height: number,
    imageUrl: string,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('image', x, y, options),
      width,
      height,
      imageUrl,
      fill: 'transparent',
      stroke: 'transparent',
    };
  }

  /**
   * Crear imagen desde data URL (base64)
   */
  createImageFromData(
    x: number,
    y: number,
    width: number,
    height: number,
    imageData: string,
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    return {
      ...this.createBase('image', x, y, options),
      width,
      height,
      imageData,
      fill: 'transparent',
      stroke: 'transparent',
    };
  }

  // ============================================================================
  // FREEHAND CREATOR
  // ============================================================================

  /**
   * Crear dibujo libre
   */
  createFreehand(
    points: Point[],
    options: Partial<ToolOptions> = {}
  ): BoardElement {
    if (points.length === 0) {
      throw new Error('Freehand must have at least one point');
    }

    // Calcular bounds
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    // Generar SVG path
    const path = this.pointsToSVGPath(points);

    return {
      ...this.createBase('freehand', minX, minY, options),
      points,
      path,
      width: maxX - minX,
      height: maxY - minY,
      fill: 'transparent',
    };
  }

  /**
   * Convertir puntos a SVG path
   */
  private pointsToSVGPath(points: Point[]): string {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clonar elemento con nuevo ID
   */
  cloneElement(element: BoardElement, offsetX = 20, offsetY = 20): BoardElement {
    return {
      ...element,
      id: this.generateId(),
      x: element.x + offsetX,
      y: element.y + offsetY,
      zIndex: this.nextZIndex++,
      createdBy: this.userId,
      createdAt: this.now(),
      updatedAt: this.now(),
      groupId: undefined, // Reset group
    };
  }

  /**
   * Crear múltiples elementos (bulk)
   */
  createElements(
    type: BoardElementType,
    positions: Point[],
    options: Partial<ToolOptions> = {}
  ): BoardElement[] {
    return positions.map(pos => {
      switch (type) {
        case 'rectangle':
          return this.createRectangle(pos.x, pos.y, 100, 100, options);
        case 'circle':
          return this.createCircle(pos.x, pos.y, 50, options);
        case 'diamond':
          return this.createDiamond(pos.x, pos.y, 100, 100, options);
        case 'text':
          return this.createText(pos.x, pos.y, 'Text', options);
        default:
          return this.createRectangle(pos.x, pos.y, 100, 100, options);
      }
    });
  }

  /**
   * Validar elemento
   */
  validateElement(element: BoardElement): boolean {
    // Validaciones básicas
    if (!element.id || !element.type) return false;
    if (typeof element.x !== 'number' || typeof element.y !== 'number') return false;
    if (typeof element.zIndex !== 'number') return false;

    // Validaciones específicas por tipo
    switch (element.type) {
      case 'rectangle':
      case 'diamond':
        return !!(element.width && element.height);
      case 'circle':
        return !!element.radius;
      case 'line':
      case 'arrow':
        return !!(element.startPoint && element.endPoint);
      case 'text':
        return !!element.text;
      case 'image':
        return !!(element.imageUrl || element.imageData);
      case 'freehand':
        return !!(element.points && element.points.length > 0);
      default:
        return false;
    }
  }

  /**
   * Calcular bounds de un elemento
   */
  getElementBounds(element: BoardElement): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    switch (element.type) {
      case 'rectangle':
      case 'diamond':
      case 'image':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 0,
          height: element.height || 0,
        };

      case 'circle':
        const radius = element.radius || 0;
        return {
          x: element.x - radius,
          y: element.y - radius,
          width: radius * 2,
          height: radius * 2,
        };

      case 'line':
      case 'arrow':
        if (!element.startPoint || !element.endPoint) {
          return { x: element.x, y: element.y, width: 0, height: 0 };
        }
        const minX = Math.min(element.startPoint.x, element.endPoint.x);
        const minY = Math.min(element.startPoint.y, element.endPoint.y);
        const maxX = Math.max(element.startPoint.x, element.endPoint.x);
        const maxY = Math.max(element.startPoint.y, element.endPoint.y);
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        };

      case 'text':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 100,
          height: element.height || 20,
        };

      case 'freehand':
        if (!element.points || element.points.length === 0) {
          return { x: element.x, y: element.y, width: 0, height: 0 };
        }
        const xs = element.points.map(p => p.x);
        const ys = element.points.map(p => p.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };

      default:
        return { x: element.x, y: element.y, width: 0, height: 0 };
    }
  }

  /**
   * Calcular centro de un elemento
   */
  getElementCenter(element: BoardElement): Point {
    const bounds = this.getElementBounds(element);
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  /**
   * Verificar si un punto está dentro de un elemento
   */
  isPointInElement(point: Point, element: BoardElement, tolerance = 5): boolean {
    const bounds = this.getElementBounds(element);
    
    return (
      point.x >= bounds.x - tolerance &&
      point.x <= bounds.x + bounds.width + tolerance &&
      point.y >= bounds.y - tolerance &&
      point.y <= bounds.y + bounds.height + tolerance
    );
  }

  /**
   * Calcular distancia entre dos puntos
   */
  distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Snap punto al grid
   */
  snapToGrid(point: Point, gridSize: number): Point {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }

  /**
   * Rotar punto alrededor de un centro
   */
  rotatePoint(point: Point, center: Point, angle: number): Point {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  /**
   * Calcular ángulo entre dos puntos
   */
  angleBetweenPoints(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }

  /**
   * Reset z-index counter
   */
  resetZIndex(): void {
    this.nextZIndex = 0;
  }

  /**
   * Obtener siguiente z-index sin incrementar
   */
  getNextZIndex(): number {
    return this.nextZIndex;
  }
}

// Singleton instance
export const boardFactory = new BoardFactory();

export default boardFactory;
