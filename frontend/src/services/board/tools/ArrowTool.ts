/**
 * ArrowTool.ts
 * 
 * Herramienta para crear flechas.
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point, BoardElement } from '../../../types/board.types';

export class ArrowTool extends BaseTool {
  name = 'arrow';
  icon = 'ArrowRight';
  cursor = 'crosshair';

  private previewElement: BoardElement | null = null;

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    
    // Crear elemento preview
    this.previewElement = {
      id: `preview_${Date.now()}`,
      type: 'arrow',
      x: point.x,
      y: point.y,
      rotation: 0,
      zIndex: 0,
      startPoint: { x: point.x, y: point.y },
      endPoint: { x: point.x, y: point.y },
      stroke: this.toolOptions?.stroke || '#000000',
      strokeWidth: this.toolOptions?.strokeWidth || 2,
      opacity: this.toolOptions?.opacity || 1,
      locked: false,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('ArrowTool: started at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    this.currentPoint = point;
    
    // Actualizar punto final de la flecha
    this.previewElement.endPoint = { x: point.x, y: point.y };
  }

  onMouseUp(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    // Verificar que no sea un clic simple
    if (this.isClick(this.startPoint, point)) {
      console.log('ArrowTool: click too small, cancelled');
      this.cleanup();
      return;
    }

    // Verificar que tengamos callbacks disponibles
    if (!this.callbacks) {
      console.error('ArrowTool: callbacks not set');
      this.cleanup();
      return;
    }

    // Generar ID único para el elemento final
    const finalElement: BoardElement = {
      ...this.previewElement,
      id: `arrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Agregar elemento al board a través del contexto
    this.callbacks.addElement(finalElement);
    
    console.log('ArrowTool: created arrow', finalElement);
    
    this.cleanup();
  }

  private cleanup(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.previewElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;
    return null; // TODO: Implementar con componente ArrowElement
  }

  getPreviewElement(): BoardElement | null {
    return this.previewElement;
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'shape',
      shortcut: 'a',
    };
  }
}
