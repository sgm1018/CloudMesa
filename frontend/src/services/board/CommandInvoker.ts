import { BaseCommand } from './commands/BaseCommand';

/**
 * Invoker del patrón Command
 * Gestiona el historial de comandos y operaciones undo/redo
 */
export class CommandInvoker {
  private history: BaseCommand[] = [];
  private currentIndex = -1;
  private maxHistorySize: number;

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Ejecutar un comando y agregarlo al historial
   */
  execute(command: BaseCommand): void {
    // Ejecutar el comando
    command.execute();

    // Remover comandos futuros si estamos en medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Agregar comando al historial
    this.history.push(command);
    this.currentIndex++;

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`Executed: ${command.description} [${this.currentIndex + 1}/${this.history.length}]`);
  }

  /**
   * Deshacer último comando
   */
  undo(): boolean {
    if (!this.canUndo()) {
      console.warn('Nothing to undo');
      return false;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    console.log(`Undone: ${command.description} [${this.currentIndex + 1}/${this.history.length}]`);
    return true;
  }

  /**
   * Rehacer comando
   */
  redo(): boolean {
    if (!this.canRedo()) {
      console.warn('Nothing to redo');
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo();

    console.log(`Redone: ${command.description} [${this.currentIndex + 1}/${this.history.length}]`);
    return true;
  }

  /**
   * Verificar si se puede deshacer
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Verificar si se puede rehacer
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Limpiar todo el historial
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('Command history cleared');
  }

  /**
   * Obtener historial completo
   */
  getHistory(): BaseCommand[] {
    return [...this.history];
  }

  /**
   * Obtener comandos pasados (ya ejecutados)
   */
  getPastCommands(): BaseCommand[] {
    return this.history.slice(0, this.currentIndex + 1);
  }

  /**
   * Obtener comandos futuros (disponibles para redo)
   */
  getFutureCommands(): BaseCommand[] {
    return this.history.slice(this.currentIndex + 1);
  }

  /**
   * Obtener comando actual
   */
  getCurrentCommand(): BaseCommand | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Obtener índice actual
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Obtener tamaño del historial
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Obtener descripción del último comando
   */
  getLastCommandDescription(): string | null {
    const command = this.getCurrentCommand();
    return command ? command.description : null;
  }

  /**
   * Obtener descripción del próximo comando para undo
   */
  getUndoDescription(): string | null {
    if (this.canUndo()) {
      return this.history[this.currentIndex].description;
    }
    return null;
  }

  /**
   * Obtener descripción del próximo comando para redo
   */
  getRedoDescription(): string | null {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description;
    }
    return null;
  }

  /**
   * Cambiar tamaño máximo del historial
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    
    // Truncar historial si es necesario
    if (this.history.length > size) {
      const excess = this.history.length - size;
      this.history = this.history.slice(excess);
      this.currentIndex = Math.max(-1, this.currentIndex - excess);
    }
  }

  /**
   * Obtener estadísticas del historial
   */
  getStats(): {
    totalCommands: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    maxSize: number;
    undoCount: number;
    redoCount: number;
  } {
    return {
      totalCommands: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      maxSize: this.maxHistorySize,
      undoCount: this.currentIndex + 1,
      redoCount: this.history.length - this.currentIndex - 1,
    };
  }

  /**
   * Exportar historial para debugging
   */
  exportHistory(): string[] {
    return this.history.map((cmd, index) => {
      const marker = index === this.currentIndex ? '→' : ' ';
      return `${marker} [${index}] ${cmd.description}`;
    });
  }

  /**
   * Ir a un índice específico del historial
   */
  goToIndex(targetIndex: number): boolean {
    if (targetIndex < -1 || targetIndex >= this.history.length) {
      console.warn('Invalid history index');
      return false;
    }

    // Undo hasta llegar al índice
    while (this.currentIndex > targetIndex) {
      this.undo();
    }

    // Redo hasta llegar al índice
    while (this.currentIndex < targetIndex) {
      this.redo();
    }

    return true;
  }
}

// Singleton instance
export const commandInvoker = new CommandInvoker();

export default commandInvoker;
