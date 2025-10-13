/**
 * SelectTool.ts
 * 
 * Herramienta de selección de elementos.
 * Permite seleccionar, mover y manipular elementos existentes.
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point } from '../../../types/board.types';

export class SelectTool extends BaseTool {
  name = 'select';
  icon = 'MousePointer2';
  cursor = 'default';

  private isDragging = false;

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    
    // Si shift está presionado, añadir a selección
    // Si no, reemplazar selección
    // TODO: Implementar lógica de selección con context
    
    console.log('SelectTool: mouseDown at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint) return;
    
    this.currentPoint = point;
    
    // Si se está arrastrando, mover elementos seleccionados
    if (this.isDragging) {
      const deltaX = point.x - this.startPoint.x;
      const deltaY = point.y - this.startPoint.y;
      
      // TODO: Ejecutar MoveElementCommand con delta
      console.log('SelectTool: dragging', { deltaX, deltaY });
    }
  }

  onMouseUp(point: Point, _event: MouseEvent): void {
    if (this.startPoint && this.isClick(this.startPoint, point)) {
      // Fue un clic simple
      console.log('SelectTool: click at', point);
    } else if (this.isDragging) {
      // Terminar arrastre
      console.log('SelectTool: drag ended');
    }
    
    this.isDragging = false;
    this.startPoint = null;
    this.currentPoint = null;
  }

  onKeyDown(event: KeyboardEvent): void {
    // Tecla Escape: deseleccionar todo
    if (event.key === 'Escape') {
      console.log('SelectTool: deselect all');
      // TODO: Limpiar selección en context
    }
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'utility',
      shortcut: 'v',
      supportsMultiSelect: true,
    };
  }
}
