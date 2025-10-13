/**
 * initializeTools.ts
 * 
 * Inicializa y registra todas las herramientas por defecto en el ToolRegistry.
 * Este archivo debe ser importado en el punto de entrada de la aplicación.
 */

import { toolRegistry } from './ToolRegistry';
import {
  SelectTool,
  RectangleTool,
  CircleTool,
  DiamondTool,
  LineTool,
  ArrowTool,
  TextTool,
  PencilTool,
  PanTool,
} from './tools';

/**
 * Registra todas las herramientas por defecto
 */
export function initializeDefaultTools(): void {
  console.log('Initializing default Board tools...');

  // Herramientas de utilidad
  toolRegistry.register(new SelectTool());
  toolRegistry.register(new PanTool());

  // Herramientas de formas
  toolRegistry.register(new RectangleTool());
  toolRegistry.register(new CircleTool());
  toolRegistry.register(new DiamondTool());
  toolRegistry.register(new LineTool());
  toolRegistry.register(new ArrowTool());

  // Herramientas de dibujo y texto
  toolRegistry.register(new TextTool());
  toolRegistry.register(new PencilTool());

  // Activar herramienta de selección por defecto
  toolRegistry.activateTool('select');

  console.log('Board tools initialized:', toolRegistry.getStats());
}

/**
 * Obtiene información sobre las herramientas registradas
 */
export function getToolsInfo() {
  return toolRegistry.getToolsInfo();
}

/**
 * Activa una herramienta por nombre
 */
export function activateTool(name: string): boolean {
  return toolRegistry.activateTool(name);
}

/**
 * Activa una herramienta por atajo de teclado
 */
export function activateToolByShortcut(shortcut: string): boolean {
  const tool = toolRegistry.getToolByShortcut(shortcut);
  if (tool) {
    return toolRegistry.activateTool(tool.name);
  }
  return false;
}

/**
 * Obtiene la herramienta activa
 */
export function getActiveTool() {
  return toolRegistry.getActiveTool();
}

/**
 * Obtiene el nombre de la herramienta activa
 */
export function getActiveToolName(): string | null {
  return toolRegistry.getActiveToolName();
}

// Auto-inicializar al importar este módulo
// Comentar esta línea si prefieres inicialización manual
// initializeDefaultTools();
