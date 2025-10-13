/**
 * RectangleTool.ts
 * 
 * Herramienta para crear rectángulos.
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point, BoardElement } from '../../../types/board.types';

export class RectangleTool extends BaseTool {
  name = 'rectangle';
  icon = 'Square';
  cursor = 'crosshair';

  private previewElement: BoardElement | null = null;

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    
    // Crear elemento preview
    this.previewElement = {
      id: `preview_${Date.now()}`,
      type: 'rectangle',
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      rotation: 0,
      zIndex: 0,
      stroke: this.toolOptions?.stroke || '#000000',
      fill: this.toolOptions?.fill || 'transparent',
      fillStyle: this.toolOptions?.fillStyle || 'solid',
      strokeWidth: this.toolOptions?.strokeWidth || 2,
      opacity: this.toolOptions?.opacity || 1,
      locked: false,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('RectangleTool: started at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    this.currentPoint = point;
    
    // Calcular dimensiones del rectángulo
    const rect = this.calculateRect(this.startPoint, point);
    this.previewElement.x = rect.x;
    this.previewElement.y = rect.y;
    this.previewElement.width = rect.width;
    this.previewElement.height = rect.height;
  }

  onMouseUp(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    // Verificar que no sea un clic simple (sin arrastre)
    if (this.isClick(this.startPoint, point)) {
      console.log('RectangleTool: click too small, cancelled');
      this.cleanup();
      return;
    }

    // Verificar que tengamos callbacks disponibles
    if (!this.callbacks) {
      console.error('RectangleTool: callbacks not set');
      this.cleanup();
      return;
    }

    // Generar ID único para el elemento final
    const finalElement: BoardElement = {
      ...this.previewElement,
      id: `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Agregar elemento al board a través del contexto
    this.callbacks.addElement(finalElement);
    
    console.log('RectangleTool: created rectangle', finalElement);
    
    this.cleanup();
  }

  private cleanup(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.previewElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;

    // TODO: Renderizar elemento preview en SVG
    // Por ahora retornar null, se implementará con componente RectangleElement
    return null;
  }

  getPreviewElement(): BoardElement | null {
    return this.previewElement;
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'shape',
      shortcut: 'r',
    };
  }
}
