/**
 * LineElement.tsx
 * 
 * Componente SVG para renderizar elementos de tipo línea y flecha.
 */

import React from 'react';
import { BoardElement } from '../../../types/board.types';

interface LineElementProps {
  element: BoardElement;
  isSelected?: boolean;
  isPreview?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const LineElement: React.FC<LineElementProps> = ({
  element,
  isSelected = false,
  isPreview = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const {
    type,
    startPoint = { x: 0, y: 0 },
    endPoint = { x: 0, y: 0 },
    stroke = '#000000',
    strokeWidth = 2,
    opacity = 1,
    locked = false,
  } = element;

  const isArrow = type === 'arrow';
  
  // Calcular ángulo para la punta de flecha
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
  const arrowSize = 10;

  return (
    <g
      opacity={opacity}
      data-element-id={element.id}
      data-element-type={type}
      onMouseDown={locked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: locked ? 'not-allowed' : 'move' }}
    >
      {/* Línea principal */}
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={isPreview ? 'opacity-60' : ''}
        strokeLinecap="round"
      />

      {/* Punta de flecha */}
      {isArrow && (
        <polygon
          points={`
            ${endPoint.x},${endPoint.y}
            ${endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6)},${endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)}
            ${endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6)},${endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)}
          `}
          fill={stroke}
          className={isPreview ? 'opacity-60' : ''}
        />
      )}

      {/* Indicadores de selección */}
      {isSelected && !isPreview && (
        <>
          {/* Línea de selección (más gruesa e invisible) */}
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="#3B82F6"
            strokeWidth={strokeWidth + 4}
            strokeDasharray="4,4"
            opacity={0.3}
            pointerEvents="none"
          />
          
          {/* Handles de punto inicial y final */}
          {!locked && (
            <>
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r={4}
                fill="#3B82F6"
                stroke="white"
                strokeWidth={1}
                className="cursor-move"
              />
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
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
      {locked && (
        <text
          x={(startPoint.x + endPoint.x) / 2}
          y={(startPoint.y + endPoint.y) / 2}
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
