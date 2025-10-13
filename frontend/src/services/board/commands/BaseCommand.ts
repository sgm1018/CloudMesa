import { Command } from '../../../types/board.types';

/**
 * Comando base abstracto
 */
export abstract class BaseCommand implements Command {
  protected executed = false;

  abstract execute(): void;
  abstract undo(): void;

  redo(): void {
    this.execute();
  }

  abstract get description(): string;

  isExecuted(): boolean {
    return this.executed;
  }
}
