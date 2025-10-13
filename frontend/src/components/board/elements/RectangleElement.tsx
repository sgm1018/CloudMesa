/**
 * RectangleElement.tsx
 * 
 * Componente SVG para renderizar elementos de tipo rectángulo.
 */

import React from 'react';
import { BoardElement } from '../../../types/board.types';

interface RectangleElementProps {
  element: BoardElement;
  isSelected?: boolean;
  isPreview?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const RectangleElement: React.FC<RectangleElementProps> = ({
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
    width = 0,
    height = 0,
    rotation = 0,
    stroke = '#000000',
    strokeWidth = 2,
    fill = 'transparent',
    opacity = 1,
    locked = false,
  } = element;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, ${width / 2}, ${height / 2})`}
      opacity={opacity}
      data-element-id={element.id}
      data-element-type="rectangle"
      onMouseDown={locked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: locked ? 'not-allowed' : 'move' }}
    >
      {/* Rectángulo principal */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={isPreview ? 'opacity-60' : ''}
      />

      {/* Borde de selección */}
      {isSelected && !isPreview && (
        <>
          <rect
            x={-2}
            y={-2}
            width={width + 4}
            height={height + 4}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="4,4"
            pointerEvents="none"
          />
          
          {/* Handles de resize */}
          {!locked && (
            <>
              {/* Top-left */}
              <circle cx={0} cy={0} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-nwse-resize" />
              {/* Top-right */}
              <circle cx={width} cy={0} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-nesw-resize" />
              {/* Bottom-left */}
              <circle cx={0} cy={height} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-nesw-resize" />
              {/* Bottom-right */}
              <circle cx={width} cy={height} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-nwse-resize" />
              {/* Top */}
              <circle cx={width / 2} cy={0} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ns-resize" />
              {/* Bottom */}
              <circle cx={width / 2} cy={height} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ns-resize" />
              {/* Left */}
              <circle cx={0} cy={height / 2} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ew-resize" />
              {/* Right */}
              <circle cx={width} cy={height / 2} r={4} fill="#3B82F6" stroke="white" strokeWidth={1} className="cursor-ew-resize" />
            </>
          )}
        </>
      )}

      {/* Indicador de locked */}
      {locked && (
        <text
          x={width / 2}
          y={height / 2}
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
