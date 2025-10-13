/**
 * BoardElementPanel.tsx
 * 
 * Panel flotante para editar propiedades de elementos seleccionados.
 * Muestra controles para stroke, fill, opacity, z-index, lock/unlock.
 */

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Minus,
  Plus,
  Lock,
  Unlock,
  ArrowUpToLine,
  ArrowUp,
  ArrowDown,
  ArrowDownToLine,
  X,
} from 'lucide-react';
import { BoardElement, FillStyle } from '../../types/board.types';

interface BoardElementPanelProps {
  selectedElements?: BoardElement[];
  onUpdate?: (elementIds: string[], updates: Partial<BoardElement>) => void;
  onZIndexChange?: (elementIds: string[], direction: 'front' | 'forward' | 'backward' | 'back') => void;
  onLockToggle?: (elementIds: string[]) => void;
  onClose?: () => void;
  className?: string;
}

export const BoardElementPanel: React.FC<BoardElementPanelProps> = ({
  selectedElements = [],
  onUpdate,
  onZIndexChange,
  onLockToggle,
  onClose,
  className = '',
}) => {
  const [stroke, setStroke] = useState('#000000');
  const [fill, setFill] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fillStyle, setFillStyle] = useState<FillStyle>('solid');

  /**
   * Cargar valores del primer elemento seleccionado
   */
  useEffect(() => {
    if (selectedElements.length > 0) {
      const element = selectedElements[0];
      setStroke(element.stroke || '#000000');
      setFill(element.fill || 'transparent');
      setStrokeWidth(element.strokeWidth || 2);
      setOpacity(element.opacity || 1);
      setFillStyle(element.fillStyle || 'solid');
    }
  }, [selectedElements]);

  /**
   * No mostrar panel si no hay elementos seleccionados
   */
  if (selectedElements.length === 0) {
    return null;
  }

  const elementIds = selectedElements.map(e => e.id);
  const firstElement = selectedElements[0];
  const isLocked = firstElement.locked || false;

  /**
   * Actualizar propiedad de elementos
   */
  const handlePropertyUpdate = (updates: Partial<BoardElement>) => {
    onUpdate?.(elementIds, updates);
  };

  return (
    <div
      className={`
        fixed right-4 top-20 w-80
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-xl
        overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Properties
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {selectedElements.length} element{selectedElements.length > 1 ? 's' : ''} selected
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        
        {/* Stroke Color */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Palette className="h-3.5 w-3.5" />
            Stroke Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={stroke}
              onChange={(e) => {
                setStroke(e.target.value);
                handlePropertyUpdate({ stroke: e.target.value });
              }}
              className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              disabled={isLocked}
            />
            <input
              type="text"
              value={stroke}
              onChange={(e) => {
                setStroke(e.target.value);
                handlePropertyUpdate({ stroke: e.target.value });
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#000000"
              disabled={isLocked}
            />
          </div>
        </div>

        {/* Fill Color */}
        {firstElement.type !== 'line' && firstElement.type !== 'arrow' && (
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Palette className="h-3.5 w-3.5" />
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fill === 'transparent' ? '#ffffff' : fill}
                onChange={(e) => {
                  setFill(e.target.value);
                  handlePropertyUpdate({ fill: e.target.value });
                }}
                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                disabled={isLocked}
              />
              <input
                type="text"
                value={fill}
                onChange={(e) => {
                  setFill(e.target.value);
                  handlePropertyUpdate({ fill: e.target.value });
                }}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="transparent"
                disabled={isLocked}
              />
              <button
                onClick={() => {
                  setFill('transparent');
                  handlePropertyUpdate({ fill: 'transparent' });
                }}
                className="px-2 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Transparent"
                disabled={isLocked}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Fill Style */}
        {firstElement.type !== 'line' && firstElement.type !== 'arrow' && fill !== 'transparent' && (
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Fill Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'hachure', 'cross-hatch'] as FillStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setFillStyle(style);
                    handlePropertyUpdate({ fillStyle: style });
                  }}
                  className={`
                    px-3 py-2 text-xs rounded border transition-colors capitalize
                    ${fillStyle === style
                      ? 'bg-primary-100 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                  disabled={isLocked}
                >
                  {style === 'cross-hatch' ? 'Cross' : style}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stroke Width */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Stroke Width</span>
            <span className="text-gray-500">{strokeWidth}px</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newWidth = Math.max(1, strokeWidth - 1);
                setStrokeWidth(newWidth);
                handlePropertyUpdate({ strokeWidth: newWidth });
              }}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              disabled={isLocked || strokeWidth <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setStrokeWidth(value);
                handlePropertyUpdate({ strokeWidth: value });
              }}
              className="flex-1"
              disabled={isLocked}
            />
            <button
              onClick={() => {
                const newWidth = Math.min(20, strokeWidth + 1);
                setStrokeWidth(newWidth);
                handlePropertyUpdate({ strokeWidth: newWidth });
              }}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              disabled={isLocked || strokeWidth >= 20}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Opacity</span>
            <span className="text-gray-500">{Math.round(opacity * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setOpacity(value);
              handlePropertyUpdate({ opacity: value });
            }}
            className="w-full"
            disabled={isLocked}
          />
        </div>

        {/* Z-Index Controls */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Arrange
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onZIndexChange?.(elementIds, 'front')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors"
              title="Bring to Front (Ctrl+Shift+])"
              disabled={isLocked}
            >
              <ArrowUpToLine className="h-4 w-4" />
              Front
            </button>
            <button
              onClick={() => onZIndexChange?.(elementIds, 'forward')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors"
              title="Bring Forward (Ctrl+])"
              disabled={isLocked}
            >
              <ArrowUp className="h-4 w-4" />
              Forward
            </button>
            <button
              onClick={() => onZIndexChange?.(elementIds, 'backward')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors"
              title="Send Backward (Ctrl+[)"
              disabled={isLocked}
            >
              <ArrowDown className="h-4 w-4" />
              Backward
            </button>
            <button
              onClick={() => onZIndexChange?.(elementIds, 'back')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors"
              title="Send to Back (Ctrl+Shift+[)"
              disabled={isLocked}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        {/* Lock/Unlock */}
        <div>
          <button
            onClick={() => onLockToggle?.(elementIds)}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded transition-colors
              ${isLocked
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 border border-amber-300 dark:border-amber-700'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
              }
            `}
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Unlock Element{selectedElements.length > 1 ? 's' : ''}
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Lock Element{selectedElements.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>

        {/* Element Info */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">{firstElement.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Position:</span>
              <span className="font-medium">
                {Math.round(firstElement.x)}, {Math.round(firstElement.y)}
              </span>
            </div>
            {firstElement.width !== undefined && (
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">
                  {Math.round(firstElement.width)} × {Math.round(firstElement.height || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
