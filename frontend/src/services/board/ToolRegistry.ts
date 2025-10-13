/**
 * ToolRegistry.ts
 * 
 * Registro central de herramientas del Board.
 * Implementa el patrón Registry para gestión extensible de herramientas.
 */

import { ITool } from './tools/ITool';

/**
 * Clase singleton que gestiona el registro de herramientas
 */
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ITool> = new Map();
  private activeTool: ITool | null = null;
  private onToolChangeCallbacks: Array<(tool: ITool | null) => void> = [];

  /**
   * Constructor privado para patrón Singleton
   */
  private constructor() {
    // Constructor privado
  }

  /**
   * Obtiene la instancia única del registro
   */
  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Registra una nueva herramienta
   */
  register(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool ${tool.name} already registered, overwriting...`);
    }
    this.tools.set(tool.name, tool);
    console.log(`Tool registered: ${tool.name}`);
  }

  /**
   * Desregistra una herramienta
   */
  unregister(name: string): boolean {
    if (!this.tools.has(name)) {
      console.warn(`Tool ${name} not found`);
      return false;
    }
    
    // Si es la herramienta activa, desactivarla primero
    if (this.activeTool?.name === name) {
      this.deactivateCurrentTool();
    }
    
    this.tools.delete(name);
    console.log(`Tool unregistered: ${name}`);
    return true;
  }

  /**
   * Obtiene una herramienta por nombre
   */
  getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Obtiene todas las herramientas registradas
   */
  getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Obtiene herramientas por categoría
   */
  getToolsByCategory(category: string): ITool[] {
    return Array.from(this.tools.values()).filter(
      tool => tool.getConfig().category === category
    );
  }

  /**
   * Obtiene herramientas que deben mostrarse en toolbar
   */
  getToolbarTools(): ITool[] {
    return Array.from(this.tools.values()).filter(
      tool => tool.getConfig().showInToolbar !== false
    );
  }

  /**
   * Busca herramienta por atajo de teclado
   */
  getToolByShortcut(shortcut: string): ITool | undefined {
    return Array.from(this.tools.values()).find(
      tool => tool.getConfig().shortcut?.toLowerCase() === shortcut.toLowerCase()
    );
  }

  /**
   * Activa una herramienta
   */
  activateTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      console.error(`Tool ${name} not found`);
      return false;
    }

    // Desactivar herramienta actual si existe
    this.deactivateCurrentTool();

    // Activar nueva herramienta
    this.activeTool = tool;
    tool.onActivate();
    
    // Notificar cambio
    this.notifyToolChange(tool);
    
    console.log(`Tool activated: ${name}`);
    return true;
  }

  /**
   * Desactiva la herramienta actual
   */
  deactivateCurrentTool(): void {
    if (this.activeTool) {
      this.activeTool.onDeactivate();
      const previousTool = this.activeTool;
      this.activeTool = null;
      this.notifyToolChange(null);
      console.log(`Tool deactivated: ${previousTool.name}`);
    }
  }

  /**
   * Obtiene la herramienta activa
   */
  getActiveTool(): ITool | null {
    return this.activeTool;
  }

  /**
   * Obtiene el nombre de la herramienta activa
   */
  getActiveToolName(): string | null {
    return this.activeTool?.name || null;
  }

  /**
   * Verifica si una herramienta está activa
   */
  isToolActive(name: string): boolean {
    return this.activeTool?.name === name;
  }

  /**
   * Registra callback para cambios de herramienta
   */
  onToolChange(callback: (tool: ITool | null) => void): void {
    this.onToolChangeCallbacks.push(callback);
  }

  /**
   * Remueve callback de cambios
   */
  removeToolChangeCallback(callback: (tool: ITool | null) => void): void {
    const index = this.onToolChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.onToolChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notifica a los callbacks sobre cambio de herramienta
   */
  private notifyToolChange(tool: ITool | null): void {
    this.onToolChangeCallbacks.forEach(callback => {
      try {
        callback(tool);
      } catch (error) {
        console.error('Error in tool change callback:', error);
      }
    });
  }

  /**
   * Limpia todos los callbacks
   */
  clearCallbacks(): void {
    this.onToolChangeCallbacks = [];
  }

  /**
   * Obtiene información de todas las herramientas
   */
  getToolsInfo(): Array<{
    name: string;
    icon: string;
    cursor: string;
    config: ReturnType<ITool['getConfig']>;
    isActive: boolean;
  }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      icon: tool.icon,
      cursor: tool.cursor,
      config: tool.getConfig(),
      isActive: this.activeTool === tool,
    }));
  }

  /**
   * Obtiene estadísticas del registro
   */
  getStats(): {
    totalTools: number;
    activeTools: string[];
    categoryCounts: Record<string, number>;
  } {
    const tools = Array.from(this.tools.values());
    const categoryCounts: Record<string, number> = {};
    
    tools.forEach(tool => {
      const category = tool.getConfig().category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return {
      totalTools: this.tools.size,
      activeTools: this.activeTool ? [this.activeTool.name] : [],
      categoryCounts,
    };
  }

  /**
   * Limpia el registro (útil para testing)
   */
  clear(): void {
    this.deactivateCurrentTool();
    this.tools.clear();
    this.clearCallbacks();
    console.log('Tool registry cleared');
  }
}

// Exportar instancia singleton
export const toolRegistry = ToolRegistry.getInstance();
