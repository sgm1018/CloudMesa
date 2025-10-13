/**
 * TextElement.tsx
 * 
 * Componente SVG para renderizar elementos de tipo texto.
 */

import React from 'react';
import { BoardElement } from '../../../types/board.types';

interface TextElementProps {
  element: BoardElement;
  isSelected?: boolean;
  isPreview?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  element,
  isSelected = false,
  isPreview = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onDoubleClick,
}) => {
  const {
    x,
    y,
    text = '',
    fontSize = 16,
    fontFamily = 'Arial, sans-serif',
    textAlign = 'left',
    stroke = '#000000',
    opacity = 1,
    locked = false,
  } = element;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      opacity={opacity}
      data-element-id={element.id}
      data-element-type="text"
      onMouseDown={locked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      style={{ cursor: locked ? 'not-allowed' : 'text' }}
    >
      {/* Texto principal */}
      <text
        x={0}
        y={0}
        fill={stroke}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textAnchor={textAlign}
        dominantBaseline="hanging"
        className={isPreview ? 'opacity-60' : ''}
      >
        {text || 'Double-click to edit'}
      </text>

      {/* Borde de selección */}
      {isSelected && !isPreview && (
        <rect
          x={-4}
          y={-4}
          width={text.length * fontSize * 0.6 + 8}
          height={fontSize + 8}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="4,4"
          pointerEvents="none"
        />
      )}

      {/* Indicador de locked */}
      {locked && (
        <text
          x={0}
          y={fontSize + 4}
          textAnchor="start"
          fill="#666"
          fontSize={12}
          pointerEvents="none"
        >
          🔒
        </text>
      )}
    </g>
  );
};
