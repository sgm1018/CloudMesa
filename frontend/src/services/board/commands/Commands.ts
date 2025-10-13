import { BoardElement } from '../../../types/board.types';
import { BaseCommand } from './BaseCommand';

/**
 * Comando para crear un elemento
 */
export class CreateElementCommand extends BaseCommand {
  constructor(
    private element: BoardElement,
    private addElementFn: (element: BoardElement) => void,
    private removeElementFn: (id: string) => void
  ) {
    super();
  }

  execute(): void {
    this.addElementFn(this.element);
    this.executed = true;
  }

  undo(): void {
    this.removeElementFn(this.element.id);
    this.executed = false;
  }

  get description(): string {
    return `Create ${this.element.type}`;
  }
}

/**
 * Comando para eliminar un elemento
 */
export class DeleteElementCommand extends BaseCommand {
  constructor(
    private element: BoardElement,
    private addElementFn: (element: BoardElement) => void,
    private removeElementFn: (id: string) => void
  ) {
    super();
  }

  execute(): void {
    this.removeElementFn(this.element.id);
    this.executed = true;
  }

  undo(): void {
    this.addElementFn(this.element);
    this.executed = false;
  }

  get description(): string {
    return `Delete ${this.element.type}`;
  }
}

/**
 * Comando para eliminar múltiples elementos
 */
export class DeleteElementsCommand extends BaseCommand {
  constructor(
    private elements: BoardElement[],
    private addElementFn: (element: BoardElement) => void,
    private removeElementFn: (id: string) => void
  ) {
    super();
  }

  execute(): void {
    this.elements.forEach(el => this.removeElementFn(el.id));
    this.executed = true;
  }

  undo(): void {
    this.elements.forEach(el => this.addElementFn(el));
    this.executed = false;
  }

  get description(): string {
    return `Delete ${this.elements.length} elements`;
  }
}

/**
 * Comando para mover un elemento
 */
export class MoveElementCommand extends BaseCommand {
  constructor(
    private elementId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number },
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.updateElementFn(this.elementId, {
      x: this.newPosition.x,
      y: this.newPosition.y,
    });
    this.executed = true;
  }

  undo(): void {
    this.updateElementFn(this.elementId, {
      x: this.oldPosition.x,
      y: this.oldPosition.y,
    });
    this.executed = false;
  }

  get description(): string {
    return `Move element`;
  }
}

/**
 * Comando para mover múltiples elementos
 */
export class MoveElementsCommand extends BaseCommand {
  constructor(
    private elementIds: string[],
    private deltaX: number,
    private deltaY: number,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void,
    private getElementFn: (id: string) => BoardElement | undefined
  ) {
    super();
  }

  execute(): void {
    this.elementIds.forEach(id => {
      const element = this.getElementFn(id);
      if (element) {
        this.updateElementFn(id, {
          x: element.x + this.deltaX,
          y: element.y + this.deltaY,
        });
      }
    });
    this.executed = true;
  }

  undo(): void {
    this.elementIds.forEach(id => {
      const element = this.getElementFn(id);
      if (element) {
        this.updateElementFn(id, {
          x: element.x - this.deltaX,
          y: element.y - this.deltaY,
        });
      }
    });
    this.executed = false;
  }

  get description(): string {
    return `Move ${this.elementIds.length} elements`;
  }
}

/**
 * Comando para actualizar un elemento
 */
export class UpdateElementCommand extends BaseCommand {
  constructor(
    private elementId: string,
    private oldValues: Partial<BoardElement>,
    private newValues: Partial<BoardElement>,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.updateElementFn(this.elementId, this.newValues);
    this.executed = true;
  }

  undo(): void {
    this.updateElementFn(this.elementId, this.oldValues);
    this.executed = false;
  }

  get description(): string {
    const keys = Object.keys(this.newValues).join(', ');
    return `Update element (${keys})`;
  }
}

/**
 * Comando para redimensionar un elemento
 */
export class ResizeElementCommand extends BaseCommand {
  constructor(
    private elementId: string,
    private oldSize: { width?: number; height?: number; radius?: number },
    private newSize: { width?: number; height?: number; radius?: number },
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.updateElementFn(this.elementId, this.newSize);
    this.executed = true;
  }

  undo(): void {
    this.updateElementFn(this.elementId, this.oldSize);
    this.executed = false;
  }

  get description(): string {
    return `Resize element`;
  }
}

/**
 * Comando para rotar un elemento
 */
export class RotateElementCommand extends BaseCommand {
  constructor(
    private elementId: string,
    private oldRotation: number,
    private newRotation: number,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.updateElementFn(this.elementId, { rotation: this.newRotation });
    this.executed = true;
  }

  undo(): void {
    this.updateElementFn(this.elementId, { rotation: this.oldRotation });
    this.executed = false;
  }

  get description(): string {
    return `Rotate element`;
  }
}

/**
 * Comando para cambiar z-index
 */
export class ChangeZIndexCommand extends BaseCommand {
  constructor(
    private elementId: string,
    private oldZIndex: number,
    private newZIndex: number,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.updateElementFn(this.elementId, { zIndex: this.newZIndex });
    this.executed = true;
  }

  undo(): void {
    this.updateElementFn(this.elementId, { zIndex: this.oldZIndex });
    this.executed = false;
  }

  get description(): string {
    return `Change z-index`;
  }
}

/**
 * Comando para agrupar elementos
 */
export class GroupElementsCommand extends BaseCommand {
  constructor(
    private elementIds: string[],
    private groupId: string,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.elementIds.forEach(id => {
      this.updateElementFn(id, { groupId: this.groupId });
    });
    this.executed = true;
  }

  undo(): void {
    this.elementIds.forEach(id => {
      this.updateElementFn(id, { groupId: undefined });
    });
    this.executed = false;
  }

  get description(): string {
    return `Group ${this.elementIds.length} elements`;
  }
}

/**
 * Comando para desagrupar elementos
 */
export class UngroupElementsCommand extends BaseCommand {
  constructor(
    private elementIds: string[],
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.elementIds.forEach(id => {
      this.updateElementFn(id, { groupId: undefined });
    });
    this.executed = true;
  }

  undo(): void {
    // En un caso real, guardaríamos el groupId anterior
    // Por ahora, no podemos revertir completamente
    this.executed = false;
  }

  get description(): string {
    return `Ungroup ${this.elementIds.length} elements`;
  }
}

/**
 * Comando para bloquear elementos
 */
export class LockElementsCommand extends BaseCommand {
  constructor(
    private elementIds: string[],
    private locked: boolean,
    private updateElementFn: (id: string, updates: Partial<BoardElement>) => void
  ) {
    super();
  }

  execute(): void {
    this.elementIds.forEach(id => {
      this.updateElementFn(id, { locked: this.locked });
    });
    this.executed = true;
  }

  undo(): void {
    this.elementIds.forEach(id => {
      this.updateElementFn(id, { locked: !this.locked });
    });
    this.executed = false;
  }

  get description(): string {
    const action = this.locked ? 'Lock' : 'Unlock';
    return `${action} ${this.elementIds.length} elements`;
  }
}

/**
 * Comando compuesto (batch de comandos)
 */
export class BatchCommand extends BaseCommand {
  constructor(
    private commands: BaseCommand[],
    private batchDescription: string
  ) {
    super();
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
    this.executed = true;
  }

  undo(): void {
    // Undo en orden inverso
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
    this.executed = false;
  }

  get description(): string {
    return this.batchDescription;
  }

  getCommandCount(): number {
    return this.commands.length;
  }
}
