import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, WifiOff, FileCode, Sparkles } from 'lucide-react';
import { BoardProvider } from '../context/BoardContext';
import { 
  BoardCanvas, 
  BoardToolbar, 
  BoardElementPanel, 
  BoardContextMenu,
  MermaidImportModal,
  AIGenerateModal
} from '../components/board';
import { boardService, boardSocketService, toolRegistry, initializeDefaultTools } from '../services/board';
import { BoardElement, ToolType, Board } from '../types/board.types';

/**
 * BoardView - Página principal del editor de board interactivo
 * Integra todos los componentes y maneja la lógica de coordinación
 */
export const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [board, setBoard] = useState<Board | null>(null);

  // Estados de UI
  const [showElementPanel, setShowElementPanel] = useState(false);
  const [showMermaidModal, setShowMermaidModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  /**
   * Inicializar herramientas del board
   */
  useEffect(() => {
    initializeDefaultTools();
    console.log('Tools initialized:', toolRegistry.getStats());
  }, []);

  /**
   * Cargar board al montar el componente
   */
  useEffect(() => {
    if (!boardId) {
      setError('Board ID is required');
      setIsLoading(false);
      return;
    }

    const loadBoard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedBoard = await boardService.getBoard(boardId);
        setBoard(loadedBoard);
      } catch (err) {
        console.error('Error loading board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

  /**
   * Conectar WebSocket para colaboración en tiempo real
   */
  useEffect(() => {
    if (!boardId || isLoading || error) return;

    const connectWebSocket = async () => {
      try {
        await boardSocketService.connect();
        console.log('WebSocket connected for board:', boardId);
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    };

    connectWebSocket();

    // Cleanup al desmontar
    return () => {
      boardSocketService.disconnect();
    };
  }, [boardId, isLoading, error]);

  /**
   * Detectar estado online/offline
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Keyboard shortcuts globales
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si hay un modal abierto
      if (showMermaidModal || showAIModal) return;

      // Ignorar si está escribiendo en un input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Atajos de herramientas (sin modificadores)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            toolRegistry.activateTool('select');
            e.preventDefault();
            break;
          case 'r':
            toolRegistry.activateTool('rectangle');
            e.preventDefault();
            break;
          case 'c':
            toolRegistry.activateTool('circle');
            e.preventDefault();
            break;
          case 'd':
            toolRegistry.activateTool('diamond');
            e.preventDefault();
            break;
          case 'l':
            toolRegistry.activateTool('line');
            e.preventDefault();
            break;
          case 'a':
            toolRegistry.activateTool('arrow');
            e.preventDefault();
            break;
          case 't':
            toolRegistry.activateTool('text');
            e.preventDefault();
            break;
          case 'p':
            toolRegistry.activateTool('pencil');
            e.preventDefault();
            break;
          case 'h':
            toolRegistry.activateTool('pan');
            e.preventDefault();
            break;
          case 'escape':
            // Cerrar panel o deseleccionar
            setShowElementPanel(false);
            setContextMenu(null);
            // La deselección la maneja el contexto
            break;
        }
      }

      // Atajos con Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              // Redo
              // El contexto maneja undo/redo
            } else {
              // Undo
            }
            e.preventDefault();
            break;
          case 'y':
            // Redo alternativo
            e.preventDefault();
            break;
          case 'c':
            // Copy - manejado por el contexto
            break;
          case 'x':
            // Cut - manejado por el contexto
            break;
          case 'v':
            // Paste - manejado por el contexto
            break;
          case 'g':
            if (e.shiftKey) {
              // Ungroup
            } else {
              // Group
            }
            e.preventDefault();
            break;
        }
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Manejado por el contexto
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMermaidModal, showAIModal]);

  /**
   * Handler para cambio de herramienta desde la toolbar
   */
  const handleToolChange = useCallback((tool: ToolType) => {
    toolRegistry.activateTool(tool);
  }, []);

  /**
   * Handler para importar elementos desde Mermaid
   */
  const handleImportMermaid = useCallback((elements: BoardElement[]) => {
    console.log('Importing Mermaid elements:', elements);
    // El contexto agregará los elementos al board
    setShowMermaidModal(false);
  }, []);

  /**
   * Handler para importar elementos desde AI
   */
  const handleImportAI = useCallback((elements: BoardElement[]) => {
    console.log('Importing AI-generated elements:', elements);
    // El contexto agregará los elementos al board
    setShowAIModal(false);
  }, []);

  /**
   * Handler para cambios de z-index
   */
  const handleZIndexChange = useCallback((ids: string[], direction: 'front' | 'forward' | 'backward' | 'back') => {
    console.log('Z-index change:', ids, direction);
    // El contexto manejará el cambio de z-index
  }, []);

  /**
   * Handler para toggle de lock
   */
  const handleLockToggle = useCallback((ids: string[]) => {
    console.log('Lock toggle:', ids);
    // El contexto manejará el toggle de locked
  }, []);

  /**
   * Handler para abrir menú contextual
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    setContextMenu({ x, y });
  }, []);

  /**
   * Handler para cerrar menú contextual
   */
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Handler para cerrar panel de propiedades
   */
  const handleCloseElementPanel = useCallback(() => {
    setShowElementPanel(false);
  }, []);

  /**
   * Renderizado de estados de carga y error
   */
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Board</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/boards')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Boards
          </button>
        </div>
      </div>
    );
  }

  if (!boardId) {
    return null;
  }

  return (
    <BoardProvider initialBoard={board || undefined}>
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden relative">
        {/* Indicador de estado offline */}
        {!isOnline && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-yellow-900">
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Changes will be saved when connection is restored.</span>
          </div>
        )}

        {/* Layout principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Toolbar izquierda */}
          <BoardToolbar 
            onToolChange={handleToolChange}
            onOpenMermaidImport={() => setShowMermaidModal(true)}
            onOpenAIGenerate={() => setShowAIModal(true)}
          />

          {/* Canvas central */}
          <div className="flex-1 relative">
            <BoardCanvas 
              onContextMenu={handleContextMenu}
              onSelectionChange={(hasSelection) => setShowElementPanel(hasSelection)}
            />
          </div>

          {/* Panel de propiedades derecha (condicional) */}
          {showElementPanel && (
            <BoardElementPanel
              onZIndexChange={handleZIndexChange}
              onLockToggle={handleLockToggle}
              onClose={handleCloseElementPanel}
            />
          )}
        </div>

        {/* Menú contextual (condicional) */}
        {contextMenu && (
          <BoardContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={handleCloseContextMenu}
          />
        )}

        {/* Modal de importación Mermaid */}
        <MermaidImportModal
          isOpen={showMermaidModal}
          onClose={() => setShowMermaidModal(false)}
          onImport={handleImportMermaid}
        />

        {/* Modal de generación con AI */}
        <AIGenerateModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onImport={handleImportAI}
          boardId={boardId}
        />

        {/* Botones flotantes para abrir modals (mobile-friendly) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => setShowMermaidModal(true)}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
            title="Import Mermaid Diagram"
          >
            <FileCode className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
            title="Generate with AI"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>
      </div>
    </BoardProvider>
  );
};

export default BoardView;
