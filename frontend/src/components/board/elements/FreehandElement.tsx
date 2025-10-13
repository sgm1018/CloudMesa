/**
 * FreehandElement.tsx
 * 
 * Componente SVG para renderizar elementos de dibujo libre (freehand/pencil).
 */

import React from 'react';
import { BoardElement } from '../../../types/board.types';

interface FreehandElementProps {
  element: BoardElement;
  isSelected?: boolean;
  isPreview?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const FreehandElement: React.FC<FreehandElementProps> = ({
  element,
  isSelected = false,
  isPreview = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const {
    x = 0,
    y = 0,
    points = [],
    stroke = '#000000',
    strokeWidth = 2,
    opacity = 1,
    locked = false,
  } = element;

  // Convertir array de puntos a string SVG path
  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  if (!pathData) return null;

  return (
    <g
      opacity={opacity}
      data-element-id={element.id}
      data-element-type="freehand"
      transform={`translate(${x}, ${y})`}
      onMouseDown={locked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: locked ? 'not-allowed' : 'move' }}
    >
      {/* Path principal */}
      <path
        d={pathData}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPreview ? 'opacity-60' : ''}
      />

      {/* Indicador de selección */}
      {isSelected && !isPreview && (
        <>
          {/* Path de selección (más grueso) */}
          <path
            d={pathData}
            stroke="#3B82F6"
            strokeWidth={strokeWidth + 4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4,4"
            opacity={0.3}
            pointerEvents="none"
          />
          
          {/* Handles en puntos de control */}
          {!locked && points.length > 0 && (
            <>
              {/* Primer punto */}
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r={4}
                fill="#3B82F6"
                stroke="white"
                strokeWidth={1}
                className="cursor-move"
              />
              {/* Último punto */}
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={4}
                fill="#3B82F6"
                stroke="white"
                strokeWidth={1}
                className="cursor-move"
              />
            </>
          )}
        </>
      )}

      {/* Indicador de locked */}
      {locked && points.length > 0 && (
        <text
          x={points[Math.floor(points.length / 2)]?.x || 0}
          y={points[Math.floor(points.length / 2)]?.y || 0}
          textAnchor="middle"
          dominantBaseline="middle"
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
