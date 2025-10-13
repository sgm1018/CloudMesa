/**
 * BoardContextMenu.tsx
 * 
 * Menú contextual que aparece al hacer clic derecho en el Board.
 * Muestra opciones diferentes según el contexto (canvas vacío vs elementos seleccionados).
 */

import React, { useRef, useEffect } from 'react';
import {
  Scissors,
  Copy,
  Clipboard,
  Files,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  Lock,
  Unlock,
  Group,
  Ungroup,
} from 'lucide-react';
import { BoardElement } from '../../types/board.types';

interface ContextMenuProps {
  x: number;
  y: number;
  selectedElements?: BoardElement[];
  hasClipboard?: boolean;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onClose: () => void;
}

type MenuItemProps =
  | {
      separator: true;
    }
  | {
      separator?: false;
      icon: React.ReactNode;
      label: string;
      shortcut?: string;
      onClick: () => void;
      danger?: boolean;
      disabled?: boolean;
    };

const MenuItem: React.FC<MenuItemProps> = (props) => {
  if (props.separator) {
    return <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />;
  }

  const { icon, label, shortcut, onClick, danger = false, disabled = false } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between px-3 py-2
        transition-colors text-left
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : danger
          ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
          {shortcut}
        </span>
      )}
    </button>
  );
};

export const BoardContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  selectedElements = [],
  hasClipboard = false,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
  onLock,
  onUnlock,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedElements.length > 0;
  const hasMultipleSelected = selectedElements.length > 1;
  const firstElement = selectedElements[0];
  const isLocked = firstElement?.locked || false;
  const hasGroupId = firstElement?.groupId !== undefined;

  /**
   * Cerrar menu al hacer clic fuera
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Pequeño delay para evitar que el clic que abre el menu lo cierre
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  /**
   * Ajustar posición si el menu se sale de la pantalla
   */
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Ajustar X si se sale por la derecha
      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      // Ajustar Y si se sale por abajo
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  const handleAction = (action?: () => void) => {
    if (action) {
      action();
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] z-50 animate-in fade-in duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {hasSelection ? (
        /* Menú para elementos seleccionados */
        <>
          <MenuItem
            icon={<Scissors className="h-4 w-4" />}
            label="Cut"
            shortcut="Ctrl+X"
            onClick={() => handleAction(onCut)}
            disabled={isLocked}
          />
          <MenuItem
            icon={<Copy className="h-4 w-4" />}
            label="Copy"
            shortcut="Ctrl+C"
            onClick={() => handleAction(onCopy)}
          />
          <MenuItem
            icon={<Files className="h-4 w-4" />}
            label="Duplicate"
            shortcut="Ctrl+D"
            onClick={() => handleAction(onDuplicate)}
            disabled={isLocked}
          />
          
          <MenuItem separator />

          <MenuItem
            icon={<ArrowUpToLine className="h-4 w-4" />}
            label="Bring to Front"
            shortcut="Ctrl+Shift+]"
            onClick={() => handleAction(onBringToFront)}
            disabled={isLocked}
          />
          <MenuItem
            icon={<ArrowDownToLine className="h-4 w-4" />}
            label="Send to Back"
            shortcut="Ctrl+Shift+["
            onClick={() => handleAction(onSendToBack)}
            disabled={isLocked}
          />

          {hasMultipleSelected && (
            <>
              <MenuItem separator />
              <MenuItem
                icon={<Group className="h-4 w-4" />}
                label="Group"
                shortcut="Ctrl+G"
                onClick={() => handleAction(onGroup)}
                disabled={isLocked}
              />
            </>
          )}

          {hasGroupId && (
            <MenuItem
              icon={<Ungroup className="h-4 w-4" />}
              label="Ungroup"
              shortcut="Ctrl+Shift+G"
              onClick={() => handleAction(onUngroup)}
              disabled={isLocked}
            />
          )}

          <MenuItem separator />

          {isLocked ? (
            <MenuItem
              icon={<Unlock className="h-4 w-4" />}
              label="Unlock"
              shortcut="Ctrl+L"
              onClick={() => handleAction(onUnlock)}
            />
          ) : (
            <MenuItem
              icon={<Lock className="h-4 w-4" />}
              label="Lock"
              shortcut="Ctrl+L"
              onClick={() => handleAction(onLock)}
            />
          )}

          <MenuItem separator />

          <MenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label={`Delete (${selectedElements.length})`}
            shortcut="Del"
            onClick={() => handleAction(onDelete)}
            danger
            disabled={isLocked}
          />
        </>
      ) : (
        /* Menú para canvas vacío */
        <>
          <MenuItem
            icon={<Clipboard className="h-4 w-4" />}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={() => handleAction(onPaste)}
            disabled={!hasClipboard}
          />
          
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
            Right-click on an element for more options
          </div>
        </>
      )}
    </div>
  );
};
