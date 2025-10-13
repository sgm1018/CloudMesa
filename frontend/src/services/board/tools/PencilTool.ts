/**
 * PencilTool.ts
 * 
 * Herramienta para dibujo libre (freehand).
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point, BoardElement } from '../../../types/board.types';

export class PencilTool extends BaseTool {
  name = 'pencil';
  icon = 'Pencil';
  cursor = 'crosshair';

  private previewElement: BoardElement | null = null;
  private points: Point[] = [];

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    this.points = [point];
    
    // Crear elemento preview
    this.previewElement = {
      id: `preview_${Date.now()}`,
      type: 'freehand',
      x: point.x,
      y: point.y,
      rotation: 0,
      zIndex: 0,
      points: [{ x: 0, y: 0 }],
      stroke: this.toolOptions?.stroke || '#000000',
      strokeWidth: this.toolOptions?.strokeWidth || 2,
      opacity: this.toolOptions?.opacity || 1,
      locked: false,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('PencilTool: started drawing at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    this.currentPoint = point;
    
    // Añadir punto al trazo
    this.points.push(point);
    
    // Calcular puntos relativos al origen
    const minX = Math.min(...this.points.map(p => p.x));
    const minY = Math.min(...this.points.map(p => p.y));
    
    this.previewElement.x = minX;
    this.previewElement.y = minY;
    this.previewElement.points = this.points.map(p => ({
      x: p.x - minX,
      y: p.y - minY,
    }));
  }

  onMouseUp(_point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    // Verificar que haya suficientes puntos
    if (this.points.length < 2) {
      console.log('PencilTool: not enough points, cancelled');
      this.cleanup();
      return;
    }

    // Verificar que tengamos callbacks disponibles
    if (!this.callbacks) {
      console.error('PencilTool: callbacks not set');
      this.cleanup();
      return;
    }

    // Generar ID único para el elemento final
    const finalElement: BoardElement = {
      ...this.previewElement,
      id: `freehand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Agregar elemento al board a través del contexto
    this.callbacks.addElement(finalElement);
    
    console.log('PencilTool: created freehand drawing', finalElement);
    
    this.cleanup();
  }

  private cleanup(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.previewElement = null;
    this.points = [];
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;
    return null; // TODO: Implementar con componente FreehandElement
  }

  getPreviewElement(): BoardElement | null {
    return this.previewElement;
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'draw',
      shortcut: 'p',
    };
  }
}
