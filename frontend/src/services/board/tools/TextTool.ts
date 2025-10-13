/**
 * TextTool.ts
 * 
 * Herramienta para crear elementos de texto.
 */

import { BaseTool, ToolConfig } from './ITool';
import { Point, BoardElement } from '../../../types/board.types';

export class TextTool extends BaseTool {
  name = 'text';
  icon = 'Type';
  cursor = 'text';

  private editingElement: BoardElement | null = null;

  onMouseDown(point: Point, _event: MouseEvent): void {
    this.startPoint = point;
    
    // Crear elemento de texto en la posición del clic
    this.editingElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: point.x,
      y: point.y,
      rotation: 0,
      zIndex: 0,
      text: '',
      fontSize: this.toolOptions?.fontSize || 16,
      fontFamily: this.toolOptions?.fontFamily || 'Arial, sans-serif',
      textAlign: 'left',
      stroke: this.toolOptions?.stroke || '#000000',
      strokeWidth: 0,
      opacity: this.toolOptions?.opacity || 1,
      locked: false,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('TextTool: text element created at', point);
    
    // TODO: Abrir input de texto para edición
    // TODO: Crear comando CreateElementCommand cuando se complete la edición
  }

  onMouseMove(point: Point, _event: MouseEvent): void {
    // No hacemos nada en el movimiento para texto
    this.currentPoint = point;
  }

  onMouseUp(_point: Point, _event: MouseEvent): void {
    // El texto se completa cuando el usuario termina de escribir
    // No en el mouseUp
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.editingElement) return;
    
    // Enter: finalizar edición
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('TextTool: text editing completed');
      this.completeTextEditing();
    }
    
    // Escape: cancelar edición
    if (event.key === 'Escape') {
      console.log('TextTool: text editing cancelled');
      this.cancelTextEditing();
    }
  }

  private completeTextEditing(): void {
    if (!this.editingElement) return;
    
    // Verificar que tengamos callbacks disponibles
    if (!this.callbacks) {
      console.error('TextTool: callbacks not set');
      this.cleanup();
      return;
    }

    // Generar ID único para el elemento final
    const finalElement: BoardElement = {
      ...this.editingElement,
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Agregar elemento al board a través del contexto
    this.callbacks.addElement(finalElement);
    
    console.log('TextTool: text created', finalElement);
    
    this.cleanup();
  }

  private cancelTextEditing(): void {
    console.log('TextTool: text cancelled');
    this.cleanup();
  }

  private cleanup(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.editingElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.editingElement) return null;
    return null; // TODO: Implementar con componente TextElement
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'text',
      shortcut: 't',
    };
  }
}
