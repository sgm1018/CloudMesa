/**
 * CircleElement.tsx
 * 
 * Componente SVG para renderizar elementos de tipo círculo/elipse.
 */

import React from 'react';
import { BoardElement } from '../../../types/board.types';

interface CircleElementProps {
  element: BoardElement;
  isSelected?: boolean;
  isPreview?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const CircleElement: React.FC<CircleElementProps> = ({
  element,
  isSelected = false,
  isPreview = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const {
    x,
    y,
    radius = 0,
    rotation = 0,
    stroke = '#000000',
    strokeWidth = 2,
    fill = 'transparent',
    opacity = 1,
    locked = false,
  } = element;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      opacity={opacity}
      data-element-id={element.id}
      data-element-type="circle"
      onMouseDown={locked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: locked ? 'not-allowed' : 'move' }}
    >
      {/* Círculo principal */}
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={isPreview ? 'opacity-60' : ''}
      />

      {/* Borde de selección */}
      {isSelected && !isPreview && (
        <>
          <circle
            cx={0}
            cy={0}
            r={radius + 2}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="4,4"
            pointerEvents="none"
          />
          
          {/* Handles de resize */}
          {!locked && (
            <>
              {/* Top */}
              <circle cx={0} cy={-radius} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ns-resize" />
              {/* Bottom */}
              <circle cx={0} cy={radius} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ns-resize" />
              {/* Left */}
              <circle cx={-radius} cy={0} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ew-resize" />
              {/* Right */}
              <circle cx={radius} cy={0} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ew-resize" />
            </>
          )}
        </>
      )}

      {/* Indicador de locked */}
      {locked && (
        <text
          x={0}
          y={0}
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
