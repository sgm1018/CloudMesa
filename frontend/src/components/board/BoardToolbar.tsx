/**
 * BoardToolbar.tsx
 * 
 * Barra de herramientas del Board con botones para todas las herramientas disponibles.
 * Agrupa herramientas por categoría y muestra indicador de herramienta activa.
 */

import React, { useState, useEffect } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Diamond,
  Minus,
  ArrowRight,
  Type,
  Pencil,
  Hand,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { toolRegistry } from '../../services/board/ToolRegistry';
import { ToolType } from '../../types/board.types';

interface ToolButton {
  name: string;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  category: 'utility' | 'shape' | 'draw' | 'text';
}

interface BoardToolbarProps {
  onToolChange?: (tool: ToolType) => void;
  onOpenMermaidImport?: () => void;
  onOpenAIGenerate?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  onToolChange,
  onOpenMermaidImport,
  onOpenAIGenerate,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className = '',
}) => {
  const [activeTool, setActiveTool] = useState<string>('select');

  /**
   * Definición de herramientas
   */
  const tools: ToolButton[] = [
    // Utilidad
    { name: 'select', icon: <MousePointer2 className="h-5 w-5" />, label: 'Select', shortcut: 'V', category: 'utility' },
    { name: 'pan', icon: <Hand className="h-5 w-5" />, label: 'Pan', shortcut: 'H', category: 'utility' },
    
    // Formas
    { name: 'rectangle', icon: <Square className="h-5 w-5" />, label: 'Rectangle', shortcut: 'R', category: 'shape' },
    { name: 'circle', icon: <Circle className="h-5 w-5" />, label: 'Circle', shortcut: 'C', category: 'shape' },
    { name: 'diamond', icon: <Diamond className="h-5 w-5" />, label: 'Diamond', shortcut: 'D', category: 'shape' },
    { name: 'line', icon: <Minus className="h-5 w-5" />, label: 'Line', shortcut: 'L', category: 'shape' },
    { name: 'arrow', icon: <ArrowRight className="h-5 w-5" />, label: 'Arrow', shortcut: 'A', category: 'shape' },
    
    // Texto y dibujo
    { name: 'text', icon: <Type className="h-5 w-5" />, label: 'Text', shortcut: 'T', category: 'text' },
    { name: 'pencil', icon: <Pencil className="h-5 w-5" />, label: 'Pencil', shortcut: 'P', category: 'draw' },
  ];

  /**
   * Actualizar herramienta activa desde el registry
   */
  useEffect(() => {
    const updateActiveTool = () => {
      const active = toolRegistry.getActiveToolName();
      if (active) {
        setActiveTool(active);
      }
    };

    // Callback para cambios de herramienta
    toolRegistry.onToolChange(updateActiveTool);
    updateActiveTool();

    return () => {
      toolRegistry.clearCallbacks();
    };
  }, []);

  /**
   * Activar herramienta
   */
  const handleToolClick = (toolName: string) => {
    const success = toolRegistry.activateTool(toolName);
    if (success) {
      setActiveTool(toolName);
      onToolChange?.(toolName as ToolType);
    }
  };

  /**
   * Renderizar separador
   */
  const Separator = () => (
    <div className="h-px w-full bg-gray-300 dark:bg-gray-600 my-1" />
  );

  /**
   * Renderizar botón de herramienta
   */
  const ToolButtonComponent: React.FC<{ tool: ToolButton }> = ({ tool }) => {
    const isActive = activeTool === tool.name;

    return (
      <button
        onClick={() => handleToolClick(tool.name)}
        className={`
          relative p-2.5 rounded-lg transition-all duration-200 w-full
          hover:bg-gray-100 dark:hover:bg-gray-700
          ${isActive
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300'
          }
          group
        `}
        title={`${tool.label} (${tool.shortcut})`}
        aria-label={tool.label}
      >
        <div className="flex justify-center">
          {tool.icon}
        </div>
        
        {/* Tooltip */}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {tool.label}
          <span className="ml-2 text-gray-400">({tool.shortcut})</span>
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
        </div>

        {/* Indicador de activo */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-3/4 w-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
        )}
      </button>
    );
  };

  /**
   * Botón de acción (undo/redo/zoom)
   */
  const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ icon, label, shortcut, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-2.5 rounded-lg transition-all duration-200 w-full
        ${disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        group
      `}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      <div className="flex justify-center">
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
        {shortcut && <span className="ml-2 text-gray-400">({shortcut})</span>}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
      </div>
    </button>
  );

  return (
    <div
      className={`
        flex flex-col gap-1 p-2
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-lg
        w-16
        ${className}
      `}
    >
      {/* Herramientas de utilidad */}
      {tools
        .filter(t => t.category === 'utility')
        .map(tool => (
          <ToolButtonComponent key={tool.name} tool={tool} />
        ))}

      <Separator />

      {/* Herramientas de formas */}
      {tools
        .filter(t => t.category === 'shape')
        .map(tool => (
          <ToolButtonComponent key={tool.name} tool={tool} />
        ))}

      <Separator />

      {/* Herramientas de texto y dibujo */}
      {tools
        .filter(t => t.category === 'text' || t.category === 'draw')
        .map(tool => (
          <ToolButtonComponent key={tool.name} tool={tool} />
        ))}

      <Separator />

      {/* Controles de historial */}
      <ActionButton
        icon={<Undo2 className="h-5 w-5" />}
        label="Undo"
        shortcut="Ctrl+Z"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ActionButton
        icon={<Redo2 className="h-5 w-5" />}
        label="Redo"
        shortcut="Ctrl+Y"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <Separator />

      {/* Controles de zoom */}
      <ActionButton
        icon={<ZoomOut className="h-5 w-5" />}
        label="Zoom Out"
        shortcut="-"
        onClick={onZoomOut}
      />
      <ActionButton
        icon={<ZoomIn className="h-5 w-5" />}
        label="Zoom In"
        shortcut="+"
        onClick={onZoomIn}
      />
      <ActionButton
        icon={<Maximize2 className="h-5 w-5" />}
        label="Fit to Screen"
        shortcut="Ctrl+0"
        onClick={onResetZoom}
      />

      <Separator />

      {/* Mermaid y AI */}
      <ActionButton
        icon={<FileCode className="h-5 w-5" />}
        label="Import Mermaid"
        onClick={onOpenMermaidImport}
      />
      <ActionButton
        icon={<Sparkles className="h-5 w-5" />}
        label="Generate with AI"
        onClick={onOpenAIGenerate}
      />
    </div>
  );
};
