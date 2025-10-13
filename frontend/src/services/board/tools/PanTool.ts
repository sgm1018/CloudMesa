/**
 * PanTool.ts
 * 
 * Herramienta para navegar el canvas (panning).
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point } from '../../../types/board.types';

export class PanTool extends BaseTool {
  name = 'pan';
  icon = 'Hand';
  cursor = 'grab';

  private isPanning = false;

  onActivate(): void {
    super.onActivate();
    // Cambiar cursor del canvas a grab
    document.body.style.cursor = 'grab';
  }

  onDeactivate(): void {
    super.onDeactivate();
    // Restaurar cursor
    document.body.style.cursor = 'default';
    this.isPanning = false;
  }

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    this.isPanning = true;
    document.body.style.cursor = 'grabbing';
    
    console.log('PanTool: started panning at', point);
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    if (!this.startPoint || !this.isPanning) return;
    
    this.currentPoint = point;
    
    // Calcular desplazamiento
    const deltaX = point.x - this.startPoint.x;
    const deltaY = point.y - this.startPoint.y;
    
    // TODO: Actualizar viewport en el context
    console.log('PanTool: panning', { deltaX, deltaY });
    
    // Actualizar punto de inicio para movimiento continuo
    this.startPoint = point;
  }

  onMouseUp(_point: Point, _event: MouseEvent): void {
    this.isPanning = false;
    this.startPoint = null;
    this.currentPoint = null;
    document.body.style.cursor = 'grab';
    
    console.log('PanTool: panning ended');
  }

  onKeyDown(event: KeyboardEvent): void {
    // Escape: salir de pan y volver a select
    if (event.key === 'Escape') {
      console.log('PanTool: exiting pan mode');
      // TODO: Activar SelectTool
    }
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'utility',
      shortcut: 'h',
    };
  }
}
