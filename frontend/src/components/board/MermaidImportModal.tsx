/**
 * MermaidImportModal.tsx
 * 
 * Modal para importar diagramas Mermaid al Board.
 * Incluye validación en tiempo real, preview visual y selector de tipo.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { MermaidParser, MermaidDiagramType } from '../../services/board/mermaid/MermaidParser';
import { MermaidConverter } from '../../services/board/mermaid/MermaidConverter';
import { BoardElement } from '../../types/board.types';

interface MermaidImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (elements: BoardElement[]) => void;
}

const DIAGRAM_TYPE_OPTIONS: Array<{ value: MermaidDiagramType; label: string; example: string }> = [
  {
    value: 'flowchart',
    label: 'Flowchart',
    example: 'flowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[End]',
  },
  {
    value: 'sequence',
    label: 'Sequence Diagram',
    example: 'sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hi',
  },
  {
    value: 'class',
    label: 'Class Diagram',
    example: 'classDiagram\n  Animal <|-- Dog\n  Animal : +age int',
  },
  {
    value: 'state',
    label: 'State Diagram',
    example: 'stateDiagram-v2\n  [*] --> Active\n  Active --> [*]',
  },
  {
    value: 'er',
    label: 'ER Diagram',
    example: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
  },
];

export const MermaidImportModal: React.FC<MermaidImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [code, setCode] = useState('');
  const [selectedType, setSelectedType] = useState<MermaidDiagramType | 'auto'>('auto');

  /**
   * Validación en tiempo real con debounce
   */
  const validation = useMemo(() => {
    if (!code.trim()) {
      return { valid: false, errors: [], type: null };
    }

    try {
      const detectedType = selectedType === 'auto' 
        ? MermaidParser.detectType(code)
        : selectedType;

      if (!detectedType) {
        return {
          valid: false,
          errors: ['Unable to detect diagram type. Please select a type manually.'],
          type: null,
        };
      }

      const result = MermaidParser.validate(code);
      return {
        ...result,
        type: detectedType,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        type: null,
      };
    }
  }, [code, selectedType]);

  /**
   * Preview de elementos convertidos
   */
  const previewElements = useMemo(() => {
    if (!validation.valid || !validation.type) {
      return null;
    }

    try {
      const ast = MermaidParser.parse(code, validation.type);
      const elements = MermaidConverter.convert(ast, {
        startX: 50,
        startY: 50,
        nodeWidth: 120,
        nodeHeight: 60,
        horizontalSpacing: 150,
        verticalSpacing: 100,
      });
      return elements;
    } catch (error) {
      console.error('Preview error:', error);
      return null;
    }
  }, [validation.valid, validation.type, code]);

  /**
   * Carga ejemplo cuando se selecciona un tipo
   */
  const handleLoadExample = (type: MermaidDiagramType) => {
    const option = DIAGRAM_TYPE_OPTIONS.find(opt => opt.value === type);
    if (option) {
      setCode(option.example);
      setSelectedType(type);
    }
  };

  /**
   * Importar elementos al board
   */
  const handleImport = () => {
    if (!previewElements || previewElements.length === 0) {
      return;
    }

    onImport(previewElements);
    handleClose();
  };

  /**
   * Reset y cerrar modal
   */
  const handleClose = () => {
    setCode('');
    setSelectedType('auto');
    onClose();
  };

  /**
   * Prevenir propagación de eventos de teclado
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      // Prevenir shortcuts del board mientras el modal está abierto
      e.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Import Mermaid Diagram
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paste your Mermaid code below
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel - Code Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            {/* Type Selector */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diagram Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('auto')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedType === 'auto'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Auto-detect
                </button>
                {DIAGRAM_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value)}
                    onDoubleClick={() => handleLoadExample(option.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedType === option.value
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    title={`Double-click to load ${option.label} example`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Double-click a type to load an example
              </p>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mermaid Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your Mermaid diagram code here..."
                className="flex-1 w-full px-4 py-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                spellCheck={false}
              />
              
              {/* Validation Status */}
              <div className="mt-3">
                {code.trim() && (
                  <div className="flex items-start gap-2">
                    {validation.valid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Valid {validation.type} diagram
                          </p>
                          {previewElements && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {previewElements.length} elements will be created
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Validation errors:
                          </p>
                          <ul className="list-disc list-inside text-xs text-red-500 dark:text-red-400 mt-1 space-y-0.5">
                            {validation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </h3>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              {previewElements && previewElements.length > 0 ? (
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[400px]">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 600"
                    style={{ minHeight: '400px' }}
                  >
                    {/* Grid background */}
                    <defs>
                      <pattern
                        id="preview-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-gray-200 dark:text-gray-700"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-grid)" />

                    {/* Render elements */}
                    {previewElements.map((element) => {
                      if (element.type === 'rectangle') {
                        return (
                          <g key={element.id}>
                            <rect
                              x={element.x}
                              y={element.y}
                              width={element.width}
                              height={element.height}
                              fill={element.fill || 'white'}
                              stroke={element.stroke || 'black'}
                              strokeWidth={element.strokeWidth || 2}
                              rx="4"
                            />
                            {element.text && (
                              <text
                                x={element.x + (element.width || 0) / 2}
                                y={element.y + (element.height || 0) / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-sans"
                                fill={element.stroke || 'black'}
                              >
                                {element.text}
                              </text>
                            )}
                          </g>
                        );
                      }

                      if (element.type === 'circle') {
                        const radius = (element.width || 0) / 2;
                        return (
                          <g key={element.id}>
                            <circle
                              cx={element.x + radius}
                              cy={element.y + radius}
                              r={radius}
                              fill={element.fill || 'white'}
                              stroke={element.stroke || 'black'}
                              strokeWidth={element.strokeWidth || 2}
                            />
                            {element.text && (
                              <text
                                x={element.x + radius}
                                y={element.y + radius}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-sans"
                                fill={element.stroke || 'black'}
                              >
                                {element.text}
                              </text>
                            )}
                          </g>
                        );
                      }

                      if (element.type === 'diamond') {
                        const hw = (element.width || 0) / 2;
                        const hh = (element.height || 0) / 2;
                        const points = `${element.x + hw},${element.y} ${element.x + element.width!},${element.y + hh} ${element.x + hw},${element.y + element.height!} ${element.x},${element.y + hh}`;
                        return (
                          <g key={element.id}>
                            <polygon
                              points={points}
                              fill={element.fill || 'white'}
                              stroke={element.stroke || 'black'}
                              strokeWidth={element.strokeWidth || 2}
                            />
                            {element.text && (
                              <text
                                x={element.x + hw}
                                y={element.y + hh}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-sans"
                                fill={element.stroke || 'black'}
                              >
                                {element.text}
                              </text>
                            )}
                          </g>
                        );
                      }

                      if (element.type === 'line' || element.type === 'arrow') {
                        const points = element.points || [];
                        if (points.length < 2) return null;

                        const startX = element.x + points[0].x;
                        const startY = element.y + points[0].y;
                        const endX = element.x + points[points.length - 1].x;
                        const endY = element.y + points[points.length - 1].y;

                        return (
                          <g key={element.id}>
                            <line
                              x1={startX}
                              y1={startY}
                              x2={endX}
                              y2={endY}
                              stroke={element.stroke || 'black'}
                              strokeWidth={element.strokeWidth || 2}
                              markerEnd={element.type === 'arrow' ? 'url(#arrowhead)' : undefined}
                            />
                          </g>
                        );
                      }

                      if (element.type === 'text') {
                        return (
                          <text
                            key={element.id}
                            x={element.x}
                            y={element.y}
                            className="text-xs font-sans"
                            fill={element.stroke || 'black'}
                          >
                            {element.text}
                          </text>
                        );
                      }

                      return null;
                    })}

                    {/* Arrow marker definition */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3, 0 6"
                          fill="black"
                        />
                      </marker>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {code.trim() ? 'Invalid diagram code' : 'Paste Mermaid code to see preview'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {previewElements && (
              <span>
                {previewElements.length} element{previewElements.length !== 1 ? 's' : ''} ready to import
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!validation.valid || !previewElements || previewElements.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                validation.valid && previewElements && previewElements.length > 0
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="h-4 w-4" />
              Import to Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
