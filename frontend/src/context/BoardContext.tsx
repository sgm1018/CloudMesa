import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Board,
  BoardElement,
  ToolType,
  ToolOptions,
  Viewport,
  Collaborator,
  Command,
  BoardConfig,
  GridConfig,
  Point,
} from '../types/board.types';

/**
 * Estado del BoardContext
 */
interface BoardContextState {
  // Board data
  board: Board | null;
  elements: BoardElement[];
  selectedElementIds: string[];
  
  // Tool state
  currentTool: ToolType;
  toolOptions: ToolOptions;
  
  // Viewport state
  viewport: Viewport;
  isPanning: boolean;
  
  // Collaboration state
  collaborators: Collaborator[];
  isConnected: boolean;
  
  // Command history (undo/redo)
  commandHistory: Command[];
  commandIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  config: BoardConfig;
  
  // Clipboard
  clipboard: BoardElement[];
}

/**
 * Acciones del BoardContext
 */
interface BoardContextActions {
  // Board actions
  setBoard: (board: Board | null) => void;
  updateBoardName: (name: string) => void;
  
  // Element actions
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  
  // Selection actions
  selectElement: (id: string, multiSelect?: boolean) => void;
  selectElements: (ids: string[]) => void;
  deselectAll: () => void;
  selectAll: () => void;
  
  // Tool actions
  setTool: (tool: ToolType) => void;
  setToolOptions: (options: Partial<ToolOptions>) => void;
  
  // Viewport actions
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  setIsPanning: (isPanning: boolean) => void;
  
  // Command actions (undo/redo)
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Z-Index actions
  bringToFront: (ids: string[]) => void;
  bringForward: (ids: string[]) => void;
  sendBackward: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;
  
  // Group actions
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;
  
  // Lock actions
  lockElements: (ids: string[]) => void;
  unlockElements: (ids: string[]) => void;
  
  // Clipboard actions
  copyElements: (ids: string[]) => void;
  cutElements: (ids: string[]) => void;
  pasteElements: () => void;
  
  // Collaboration actions
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (userId: string) => void;
  updateCollaboratorCursor: (userId: string, position: Point) => void;
  setIsConnected: (connected: boolean) => void;
  
  // Config actions
  updateConfig: (config: Partial<BoardConfig>) => void;
  updateGridConfig: (grid: Partial<GridConfig>) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

type BoardContextType = BoardContextState & BoardContextActions;

const BoardContext = createContext<BoardContextType | undefined>(undefined);

/**
 * Hook para usar el BoardContext
 */
export const useBoardContext = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
};

/**
 * Props del BoardProvider
 */
interface BoardProviderProps {
  children: ReactNode;
  initialBoard?: Board;
}

/**
 * Provider del BoardContext
 */
export const BoardProvider: React.FC<BoardProviderProps> = ({ children, initialBoard }) => {
  // State
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [elements, setElements] = useState<BoardElement[]>(initialBoard?.elements || []);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [toolOptions, setToolOptionsState] = useState<ToolOptions>({
    stroke: '#000000',
    strokeWidth: 2,
    fill: '#ffffff',
    opacity: 1,
    fillStyle: 'solid',
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
  });
  
  const [viewport, setViewportState] = useState<Viewport>(
    initialBoard?.viewport || { x: 0, y: 0, zoom: 1 }
  );
  const [isPanning, setIsPanning] = useState(false);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [commandIndex, setCommandIndex] = useState(-1);
  
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<BoardConfig>({
    grid: {
      enabled: true,
      size: 20,
      snap: true,
      color: '#e5e7eb',
      opacity: 0.5,
    },
    showCursors: true,
    showSelections: true,
    autoSave: true,
    autoSaveInterval: 3000,
    maxUndoHistory: 100,
  });
  
  const [clipboard, setClipboard] = useState<BoardElement[]>([]);

  // Computed values
  const canUndo = commandIndex >= 0;
  const canRedo = commandIndex < commandHistory.length - 1;

  // Sync elements with board cuando board cambia
  useEffect(() => {
    if (board) {
      setElements(board.elements);
      setViewportState(board.viewport);
    }
  }, [board]);

  // Element actions
  const addElement = useCallback((element: BoardElement) => {
    setElements(prev => [...prev, element]);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates, updatedAt: new Date() } : el))
    );
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementIds(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  const deleteElements = useCallback((ids: string[]) => {
    setElements(prev => prev.filter(el => !ids.includes(el.id)));
    setSelectedElementIds([]);
  }, []);

  const duplicateElements = useCallback((ids: string[]) => {
    const elementsToDuplicate = elements.filter(el => ids.includes(el.id));
    const duplicated = elementsToDuplicate.map(el => ({
      ...el,
      id: `${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setElements(prev => [...prev, ...duplicated]);
    setSelectedElementIds(duplicated.map(el => el.id));
  }, [elements]);

  // Selection actions
  const selectElement = useCallback((id: string, multiSelect = false) => {
    setSelectedElementIds(prev => {
      if (multiSelect) {
        return prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    setSelectedElementIds(ids);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedElementIds([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedElementIds(elements.map(el => el.id));
  }, [elements]);

  // Tool actions
  const setTool = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
    if (tool !== 'select') {
      deselectAll();
    }
  }, [deselectAll]);

  const setToolOptions = useCallback((options: Partial<ToolOptions>) => {
    setToolOptionsState(prev => ({ ...prev, ...options }));
  }, []);

  // Viewport actions
  const setViewport = useCallback((updates: Partial<Viewport>) => {
    setViewportState(prev => ({ ...prev, ...updates }));
  }, []);

  const zoomIn = useCallback(() => {
    setViewportState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewportState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewportState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  const fitToScreen = useCallback(() => {
    if (elements.length === 0) return;

    const bounds = elements.reduce(
      (acc, el) => {
        const right = el.x + (el.width || 0);
        const bottom = el.y + (el.height || 0);
        return {
          minX: Math.min(acc.minX, el.x),
          minY: Math.min(acc.minY, el.y),
          maxX: Math.max(acc.maxX, right),
          maxY: Math.max(acc.maxY, bottom),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const padding = 50;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const zoom = Math.min(windowWidth / width, windowHeight / height, 1);
    const x = -(bounds.minX - padding) * zoom;
    const y = -(bounds.minY - padding) * zoom;

    setViewportState({ x, y, zoom });
  }, [elements]);

  // Command actions
  const executeCommand = useCallback((command: Command) => {
    command.execute();
    
    // Agregar al historial
    const newHistory = commandHistory.slice(0, commandIndex + 1);
    newHistory.push(command);
    
    // Limitar tamaño del historial
    if (newHistory.length > config.maxUndoHistory) {
      newHistory.shift();
    } else {
      setCommandIndex(prev => prev + 1);
    }
    
    setCommandHistory(newHistory);
  }, [commandHistory, commandIndex, config.maxUndoHistory]);

  const undo = useCallback(() => {
    if (canUndo) {
      commandHistory[commandIndex].undo();
      setCommandIndex(prev => prev - 1);
    }
  }, [canUndo, commandHistory, commandIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      commandHistory[commandIndex + 1].execute();
      setCommandIndex(prev => prev + 1);
    }
  }, [canRedo, commandHistory, commandIndex]);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setCommandIndex(-1);
  }, []);

  // Z-Index actions
  const bringToFront = useCallback((ids: string[]) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex));
    ids.forEach((id, index) => {
      updateElement(id, { zIndex: maxZ + index + 1 });
    });
  }, [elements, updateElement]);

  const bringForward = useCallback((ids: string[]) => {
    ids.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        updateElement(id, { zIndex: el.zIndex + 1 });
      }
    });
  }, [elements, updateElement]);

  const sendBackward = useCallback((ids: string[]) => {
    ids.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        updateElement(id, { zIndex: Math.max(0, el.zIndex - 1) });
      }
    });
  }, [elements, updateElement]);

  const sendToBack = useCallback((ids: string[]) => {
    const minZ = Math.min(...elements.map(el => el.zIndex));
    ids.forEach((id, index) => {
      updateElement(id, { zIndex: minZ - ids.length + index });
    });
  }, [elements, updateElement]);

  // Group actions
  const groupElements = useCallback((ids: string[]) => {
    const groupId = `group-${Date.now()}`;
    ids.forEach(id => {
      updateElement(id, { groupId });
    });
  }, [updateElement]);

  const ungroupElements = useCallback((groupId: string) => {
    elements
      .filter(el => el.groupId === groupId)
      .forEach(el => {
        updateElement(el.id, { groupId: undefined });
      });
  }, [elements, updateElement]);

  // Lock actions
  const lockElements = useCallback((ids: string[]) => {
    ids.forEach(id => {
      updateElement(id, { locked: true });
    });
  }, [updateElement]);

  const unlockElements = useCallback((ids: string[]) => {
    ids.forEach(id => {
      updateElement(id, { locked: false });
    });
  }, [updateElement]);

  // Clipboard actions
  const copyElements = useCallback((ids: string[]) => {
    const elementsToCopy = elements.filter(el => ids.includes(el.id));
    setClipboard(elementsToCopy);
  }, [elements]);

  const cutElements = useCallback((ids: string[]) => {
    copyElements(ids);
    deleteElements(ids);
  }, [copyElements, deleteElements]);

  const pasteElements = useCallback(() => {
    if (clipboard.length === 0) return;

    const pasted = clipboard.map(el => ({
      ...el,
      id: `${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setElements(prev => [...prev, ...pasted]);
    setSelectedElementIds(pasted.map(el => el.id));
  }, [clipboard]);

  // Collaboration actions
  const addCollaborator = useCallback((collaborator: Collaborator) => {
    setCollaborators(prev => [...prev.filter(c => c.userId !== collaborator.userId), collaborator]);
  }, []);

  const removeCollaborator = useCallback((userId: string) => {
    setCollaborators(prev => prev.filter(c => c.userId !== userId));
  }, []);

  const updateCollaboratorCursor = useCallback((userId: string, position: Point) => {
    setCollaborators(prev =>
      prev.map(c =>
        c.userId === userId ? { ...c, cursor: position } : c
      )
    );
  }, []);

  // Config actions
  const updateConfig = useCallback((updates: Partial<BoardConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateGridConfig = useCallback((grid: Partial<GridConfig>) => {
    setConfig(prev => ({ ...prev, grid: { ...prev.grid, ...grid } }));
  }, []);

  // Board actions
  const updateBoardName = useCallback((name: string) => {
    if (board) {
      setBoard({ ...board, name });
    }
  }, [board]);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value: BoardContextType = {
    // State
    board,
    elements,
    selectedElementIds,
    currentTool,
    toolOptions,
    viewport,
    isPanning,
    collaborators,
    isConnected,
    commandHistory,
    commandIndex,
    canUndo,
    canRedo,
    isLoading: false, // TODO: Implementar loading states cuando se integre con API
    error,
    config,
    clipboard,

    // Actions
    setBoard,
    updateBoardName,
    addElement,
    updateElement,
    deleteElement,
    deleteElements,
    duplicateElements,
    selectElement,
    selectElements,
    deselectAll,
    selectAll,
    setTool,
    setToolOptions,
    setViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    setIsPanning,
    executeCommand,
    undo,
    redo,
    clearHistory,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    groupElements,
    ungroupElements,
    lockElements,
    unlockElements,
    copyElements,
    cutElements,
    pasteElements,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorCursor,
    setIsConnected,
    updateConfig,
    updateGridConfig,
    setError,
    clearError,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export default BoardContext;
