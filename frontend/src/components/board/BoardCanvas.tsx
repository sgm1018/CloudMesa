/**
 * BoardCanvas.tsx
 * 
 * Componente principal del canvas SVG para renderizar y manipular elementos del Board.
 * Maneja eventos de mouse/teclado, integración con herramientas, y renderizado de elementos.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BoardElement, Point, Collaborator } from '../../types/board.types';
import { RectangleElement } from './elements/RectangleElement';
import { CircleElement } from './elements/CircleElement';
import { LineElement } from './elements/LineElement';
import { TextElement } from './elements/TextElement';
import { FreehandElement } from './elements/FreehandElement';
import { toolRegistry } from '../../services/board/ToolRegistry';
import { useBoardContext } from '../../context/BoardContext';

interface BoardCanvasProps {
  onContextMenu?: (e: React.MouseEvent, x: number, y: number) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  className?: string;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  onContextMenu: onContextMenuProp,
  onSelectionChange,
  className = '',
}) => {
  // Obtener estado y acciones del contexto
  const {
    elements,
    selectedElementIds,
    viewport,
    collaborators,
    setViewport,
    selectElement,
    addElement,
  } = useBoardContext();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [previewElement, setPreviewElement] = useState<BoardElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * Actualizar tamaño del canvas
   */
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  /**
   * Detectar tecla Space para panning
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  /**
   * Configurar callbacks para las herramientas
   */
  useEffect(() => {
    const setupCallbacks = (tool: any) => {
      if (tool) {
        tool.setCallbacks({
          addElement,
          updateElement: (id: string, updates: Partial<BoardElement>) => {
            // TODO: Implementar actualización en contexto
            console.log('Update element:', id, updates);
          },
          deleteElement: (id: string) => {
            // TODO: Implementar eliminación en contexto
            console.log('Delete element:', id);
          },
        });
        console.log('Callbacks configured for tool:', tool.name);
      }
    };

    // Configurar callbacks para la herramienta activa al montar
    const activeTool = toolRegistry.getActiveTool();
    setupCallbacks(activeTool);

    // Escuchar cambios de herramienta
    const handleToolChange = (newTool: any) => {
      setupCallbacks(newTool);
      // Limpiar preview al cambiar de herramienta
      setPreviewElement(null);
      setIsDrawing(false);
    };
    
    toolRegistry.onToolChange(handleToolChange);

    return () => {
      toolRegistry.removeToolChangeCallback(handleToolChange);
    };
  }, [addElement]);

  /**
   * Notificar cambios en la selección
   */
  useEffect(() => {
    onSelectionChange?.(selectedElementIds.length > 0);
  }, [selectedElementIds, onSelectionChange]);

  /**
   * Convierte coordenadas del mouse a coordenadas SVG
   */
  const screenToSVG = useCallback((clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: clientX, y: clientY };

    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  /**
   * Handler de mouse down
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = screenToSVG(e.clientX, e.clientY);

    // Si Space está presionado, iniciar panning
    if (isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Verificar si se hizo clic en un elemento
    const target = e.target as SVGElement;
    const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');

    if (elementId) {
      // Clic en un elemento
      const addToSelection = e.shiftKey;
      selectElement(elementId, addToSelection);
      return;
    }

    // Clic en canvas vacío - deseleccionar
    if (!e.shiftKey) {
      selectElement('', false);
    }

    // Delegar a herramienta activa
    const activeTool = toolRegistry.getActiveTool();
    if (activeTool) {
      activeTool.onMouseDown(point, e.nativeEvent);
      setIsDrawing(true);
      // Actualizar preview inmediatamente
      setPreviewElement(activeTool.getPreviewElement());
    }
  }, [isSpacePressed, screenToSVG, selectElement]);

  /**
   * Handler de mouse move
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = screenToSVG(e.clientX, e.clientY);

    // Panning
    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      setViewport({
        ...viewport,
        x: viewport.x + deltaX,
        y: viewport.y + deltaY,
      });

      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // TODO: Emitir posición del cursor para colaboradores

    // Delegar a herramienta activa
    const activeTool = toolRegistry.getActiveTool();
    if (activeTool) {
      activeTool.onMouseMove(point, e.nativeEvent);
      // Actualizar preview mientras se mueve
      if (isDrawing) {
        setPreviewElement(activeTool.getPreviewElement());
      }
    }
  }, [isPanning, panStart, viewport, screenToSVG, setViewport, isDrawing]);

  /**
   * Handler de mouse up
   */
  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = screenToSVG(e.clientX, e.clientY);

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Delegar a herramienta activa
    const activeTool = toolRegistry.getActiveTool();
    if (activeTool) {
      activeTool.onMouseUp(point, e.nativeEvent);
      // Limpiar preview después de finalizar
      setIsDrawing(false);
      setPreviewElement(null);
    }
  }, [isPanning, screenToSVG]);

  /**
   * Handler de wheel para zoom
   */
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    // Permitir zoom con Ctrl/Cmd + wheel O simplemente wheel
    e.preventDefault();

    const delta = -e.deltaY * 0.01;
    const newZoom = Math.min(Math.max(viewport.zoom + delta, 0.1), 5);

    if (!svgRef.current) return;

    // Obtener coordenadas del mouse relativas al canvas
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcular el punto en el espacio del mundo (antes del zoom)
    const worldX = (mouseX - viewport.x) / viewport.zoom;
    const worldY = (mouseY - viewport.y) / viewport.zoom;

    // Calcular el nuevo offset para mantener el punto del mundo fijo
    const newX = mouseX - worldX * newZoom;
    const newY = mouseY - worldY * newZoom;

    setViewport({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  }, [viewport, setViewport]);

  /**
   * Renderiza un elemento según su tipo
   */
  const renderElement = useCallback((element: BoardElement, isPreview = false) => {
    const isSelected = selectedElementIds.includes(element.id);
    const commonProps = {
      element,
      isSelected,
      isPreview,
      key: element.id,
    };

    switch (element.type) {
      case 'rectangle':
        return <RectangleElement {...commonProps} />;
      case 'circle':
        return <CircleElement {...commonProps} />;
      case 'line':
      case 'arrow':
        return <LineElement {...commonProps} />;
      case 'text':
        return <TextElement {...commonProps} />;
      case 'diamond':
        // TODO: Implementar DiamondElement
        return <RectangleElement {...commonProps} />;
      case 'freehand':
        return <FreehandElement {...commonProps} />;
      case 'image':
        // TODO: Implementar ImageElement
        return null;
      default:
        console.warn(`Unknown element type: ${element.type}`);
        return null;
    }
  }, [selectedElementIds]);

  /**
   * Renderiza cursor de colaborador
   */
  const renderCollaboratorCursor = useCallback((collaborator: Collaborator) => {
    if (!collaborator.cursor) return null;
    
    return (
      <g key={collaborator.userId} transform={`translate(${collaborator.cursor.x}, ${collaborator.cursor.y})`}>
        {/* Puntero del cursor */}
        <path
          d="M 0 0 L 0 16 L 4 12 L 7 18 L 9 17 L 6 11 L 11 11 Z"
          fill={collaborator.color}
          stroke="white"
          strokeWidth={1}
        />
        {/* Nombre del colaborador */}
        <text
          x={12}
          y={0}
          fill={collaborator.color}
          fontSize={12}
          fontWeight="bold"
          style={{ userSelect: 'none' }}
        >
          {collaborator.username}
        </text>
      </g>
    );
  }, []);

  /**
   * Calcular cursor CSS
   */
  const getCursor = () => {
    if (isSpacePressed) return isPanning ? 'grabbing' : 'grab';
    
    const activeTool = toolRegistry.getActiveTool();
    return activeTool?.cursor || 'default';
  };

  /**
   * Handler de context menu
   */
  const handleContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const point = screenToSVG(e.clientX, e.clientY);
    onContextMenuProp?.(e, point.x, point.y);
  }, [onContextMenuProp, screenToSVG]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      {/* Grid de fondo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* Canvas SVG */}
      <svg
        ref={svgRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        {/* Grupo principal con transformación de viewport */}
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          {/* Renderizar elementos (ordenados por zIndex) */}
          {[...elements]
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((el) => renderElement(el, false))}

          {/* Renderizar elemento preview (mientras se dibuja) */}
          {previewElement && renderElement(previewElement, true)}

          {/* Renderizar cursores de colaboradores */}
          {collaborators.map(renderCollaboratorCursor)}
        </g>
      </svg>

      {/* Info de zoom */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow text-sm">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
};
