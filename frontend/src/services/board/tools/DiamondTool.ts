/**
 * DiamondTool.ts
 * 
 * Herramienta para crear rombos/diamantes.
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point, BoardElement } from '../../../types/board.types';

export class DiamondTool extends BaseTool {
  name = 'diamond';
  icon = 'Diamond';
  cursor = 'crosshair';

  private previewElement: BoardElement | null = null;

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    
    // Crear elemento preview
    this.previewElement = {
      id: `preview_${Date.now()}`,
      type: 'diamond',
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
    
    console.log('DiamondTool: started at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    this.currentPoint = point;
    
    // Calcular dimensiones del diamante
    const rect = this.calculateRect(this.startPoint, point);
    this.previewElement.x = rect.x;
    this.previewElement.y = rect.y;
    this.previewElement.width = rect.width;
    this.previewElement.height = rect.height;
  }

  onMouseUp(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    // Verificar que no sea un clic simple
    if (this.isClick(this.startPoint, point)) {
      console.log('DiamondTool: click too small, cancelled');
      this.cleanup();
      return;
    }

    // Verificar que tengamos callbacks disponibles
    if (!this.callbacks) {
      console.error('DiamondTool: callbacks not set');
      this.cleanup();
      return;
    }

    // Generar ID único para el elemento final
    const finalElement: BoardElement = {
      ...this.previewElement,
      id: `diamond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Agregar elemento al board a través del contexto
    this.callbacks.addElement(finalElement);
    
    console.log('DiamondTool: created diamond', finalElement);
    
    this.cleanup();
  }

  private cleanup(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.previewElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;
    return null; // TODO: Implementar con componente DiamondElement
  }

  getPreviewElement(): BoardElement | null {
    return this.previewElement;
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'shape',
      shortcut: 'd',
    };
  }
}
