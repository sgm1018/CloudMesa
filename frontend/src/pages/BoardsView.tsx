import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
  Edit2,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react';
import { boardService } from '../services/board';
import { Board } from '../types/board.types';

type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'name' | 'collaborators';
type FilterBy = 'all' | 'owned' | 'shared';

/**
 * BoardsView - Vista principal de lista de boards del usuario
 */
export const BoardsView: React.FC = () => {
  const navigate = useNavigate();

  // Estados de datos
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de modals
  const [deleteModalBoard, setDeleteModalBoard] = useState<Board | null>(null);
  const [shareModalBoard, setShareModalBoard] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Cargar boards al montar el componente
   */
  useEffect(() => {
    loadBoards();
  }, [filterBy]);

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filter = filterBy === 'all' ? undefined : filterBy === 'owned' ? 'own' : 'shared';
      const data = await boardService.getBoards(filter);
      setBoards(data);
    } catch (err) {
      console.error('Error loading boards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtrar y ordenar boards
   */
  const filteredAndSortedBoards = useMemo(() => {
    let filtered = [...boards];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(board =>
        board.name.toLowerCase().includes(query)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'collaborators':
          return (b.sharedConfig?.length || 0) - (a.sharedConfig?.length || 0);
        case 'recent':
        default:
          const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bTime - aTime;
      }
    });

    return filtered;
  }, [boards, searchQuery, sortBy]);

  /**
   * Crear nuevo board
   */
  const handleCreateBoard = async () => {
    try {
      const newBoard = await boardService.createBoard({
        name: 'Untitled Board',
      });
      navigate(`/boards/${newBoard._id}`);
    } catch (err) {
      console.error('Error creating board:', err);
    }
  };

  /**
   * Abrir board
   */
  const handleOpenBoard = (boardId: string) => {
    navigate(`/boards/${boardId}`);
  };

  /**
   * Duplicar board
   */
  const handleDuplicateBoard = async (board: Board) => {
    try {
      await boardService.createBoard({
        name: `${board.name} (Copy)`,
      });
      // Recargar lista
      await loadBoards();
    } catch (err) {
      console.error('Error duplicating board:', err);
    }
  };

  /**
   * Eliminar board
   */
  const handleDeleteBoard = async () => {
    if (!deleteModalBoard) return;

    try {
      setIsDeleting(true);
      await boardService.deleteBoard(deleteModalBoard._id);
      setBoards(boards.filter(b => b._id !== deleteModalBoard._id));
      setDeleteModalBoard(null);
    } catch (err) {
      console.error('Error deleting board:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Formato de fecha relativa
   */
  const formatRelativeDate = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  /**
   * Renderizar thumbnail del board
   */
  const BoardThumbnail: React.FC<{ board: Board }> = ({ board }) => {
    const elements = board.elements?.slice(0, 10) || [];

    return (
      <div className="w-full h-40 bg-gray-900 rounded-t-lg overflow-hidden border-b border-gray-700">
        {elements.length > 0 ? (
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.02) 19px, rgba(255,255,255,0.02) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.02) 19px, rgba(255,255,255,0.02) 20px)'
            }}
          >
            {elements.map(element => {
              if (element.type === 'rectangle') {
                return (
                  <rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill || 'transparent'}
                    stroke={element.stroke}
                    strokeWidth={element.strokeWidth}
                    opacity={element.opacity}
                  />
                );
              }
              if (element.type === 'circle') {
                const cx = element.x + (element.width || 0) / 2;
                const cy = element.y + (element.height || 0) / 2;
                const r = Math.min(element.width || 0, element.height || 0) / 2;
                return (
                  <circle
                    key={element.id}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={element.fill || 'transparent'}
                    stroke={element.stroke}
                    strokeWidth={element.strokeWidth}
                    opacity={element.opacity}
                  />
                );
              }
              if (element.type === 'line' || element.type === 'arrow') {
                const points = element.points || [];
                if (points.length >= 2) {
                  return (
                    <line
                      key={element.id}
                      x1={points[0].x}
                      y1={points[0].y}
                      x2={points[points.length - 1].x}
                      y2={points[points.length - 1].y}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth}
                      opacity={element.opacity}
                    />
                  );
                }
              }
              return null;
            })}
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <span className="text-sm">Empty board</span>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderizar card de board (Grid view)
   */
  const BoardCard: React.FC<{ board: Board }> = ({ board }) => {
    const [showMenu, setShowMenu] = useState(false);
    const collaboratorCount = board.sharedConfig?.length || 0;

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group">
        {/* Thumbnail */}
        <button
          onClick={() => handleOpenBoard(board._id)}
          className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <BoardThumbnail board={board} />
        </button>

        {/* Card body */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <button
              onClick={() => handleOpenBoard(board._id)}
              className="flex-1 text-left"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {board.name}
              </h3>
            </button>

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-gray-700 rounded-lg shadow-xl py-1 w-48 border border-gray-600">
                    <button
                      onClick={() => {
                        handleOpenBoard(board._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => {
                        handleDuplicateBoard(board);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setShareModalBoard(board);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <div className="h-px bg-gray-600 my-1" />
                    <button
                      onClick={() => {
                        setDeleteModalBoard(board);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatRelativeDate(board.updatedAt || board.createdAt)}</span>
            </div>
            {collaboratorCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{collaboratorCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderizar estado vacío
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Grid3x3 className="w-12 h-12 text-gray-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">No boards yet</h2>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        Create your first board to start collaborating with your team on interactive whiteboards
      </p>
      <button
        onClick={handleCreateBoard}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Your First Board
      </button>
    </div>
  );

  /**
   * Renderizado principal
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading boards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Boards</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadBoards}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">My Boards</h1>
            <button
              onClick={handleCreateBoard}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Board
            </button>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="collaborators">Collaborators</option>
              </select>

              {/* Filter by */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Boards</option>
                <option value="owned">Owned by me</option>
                <option value="shared">Shared with me</option>
              </select>

              {/* View mode toggle */}
              <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Boards grid/list */}
        {filteredAndSortedBoards.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No boards found matching "{searchQuery}"</p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBoards.map(board => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Collaborators
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAndSortedBoards.map(board => (
                  <tr
                    key={board._id}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleOpenBoard(board._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{board.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{formatRelativeDate(board.updatedAt || board.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {board.sharedConfig?.length || 0} collaborators
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalBoard(board);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteModalBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Board?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "<span className="font-semibold">{deleteModalBoard.name}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalBoard(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBoard}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal (placeholder) */}
      {shareModalBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Share Board</h2>
            <p className="text-gray-400 mb-6">
              Share "{shareModalBoard.name}" with collaborators (coming soon)
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShareModalBoard(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsView;
