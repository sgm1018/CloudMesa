/**
 * services/board/index.ts
 * 
 * Barrel export para todos los servicios del Board.
 */

// Services
export { boardService } from './BoardService';
export { boardSocketService } from './BoardSocketService';

// Factory
export { boardFactory } from './BoardFactory';

// Command Pattern
export { commandInvoker } from './CommandInvoker';
export * from './commands';

// Tool Registry
export { toolRegistry, ToolRegistry } from './ToolRegistry';
export * from './tools';
export * from './initializeTools';
