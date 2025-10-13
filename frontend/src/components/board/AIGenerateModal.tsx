import React, { useState, useMemo, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle, RefreshCw, Edit3, FileText, Eye } from 'lucide-react';
import { BoardElement } from '../../types/board.types';
import { MermaidParser, MermaidDiagramType } from '../../services/board/mermaid/MermaidParser';
import { MermaidConverter } from '../../services/board/mermaid/MermaidConverter';
import { boardService } from '../../services/board';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (elements: BoardElement[]) => void;
  boardId: string;
}

type GenerationState = 'idle' | 'generating' | 'generated' | 'error';
type TabView = 'code' | 'preview';

interface DiagramTypeOption {
  value: MermaidDiagramType;
  label: string;
  description: string;
  promptExample: string;
}

const DIAGRAM_TYPES: DiagramTypeOption[] = [
  {
    value: 'flowchart',
    label: 'Flowchart',
    description: 'Process flows and decision trees',
    promptExample: 'Create a user authentication flow with login, validation, and error handling'
  },
  {
    value: 'sequence',
    label: 'Sequence Diagram',
    description: 'Interactions between actors',
    promptExample: 'Design an API request sequence between client, server, and database'
  },
  {
    value: 'class',
    label: 'Class Diagram',
    description: 'Object-oriented structures',
    promptExample: 'Model a shopping cart system with User, Product, and Order classes'
  },
  {
    value: 'state',
    label: 'State Diagram',
    description: 'State machines and transitions',
    promptExample: 'Create a state machine for an order lifecycle from draft to delivered'
  },
  {
    value: 'er',
    label: 'Entity-Relationship',
    description: 'Database schemas',
    promptExample: 'Design a database schema for a blog with users, posts, and comments'
  }
];

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  onClose,
  onImport,
  boardId
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<MermaidDiagramType>('flowchart');
  const [generatedCode, setGeneratedCode] = useState('');
  const [state, setState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('code');
  const [isEditing, setIsEditing] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setGeneratedCode('');
      setState('idle');
      setError(null);
      setActiveTab('code');
      setIsEditing(false);
    }
  }, [isOpen]);

  // Prevent board shortcuts while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      e.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  // Validate generated code
  const validation = useMemo(() => {
    if (!generatedCode.trim()) {
      return { valid: false, errors: [] };
    }
    return MermaidParser.validate(generatedCode);
  }, [generatedCode]);

  // Convert validated code to elements for preview
  const previewElements = useMemo(() => {
    if (!validation.valid || !generatedCode.trim()) {
      return [];
    }

    try {
      const ast = MermaidParser.parse(generatedCode, selectedType);
      return MermaidConverter.convert(ast, {
        startX: 50,
        startY: 50
      });
    } catch (err) {
      return [];
    }
  }, [generatedCode, validation.valid, selectedType]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your diagram');
      return;
    }

    setState('generating');
    setError(null);
    setIsEditing(false);

    try {
      const result = await boardService.generateMermaid(boardId, {
        prompt: prompt.trim(),
        type: selectedType
      });

      setGeneratedCode(result.mermaidCode);
      setState('generated');
      setActiveTab('code'); // Show code first
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to generate diagram. Please try again.');
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('code');
  };

  const handleImport = () => {
    if (validation.valid && previewElements.length > 0) {
      onImport(previewElements);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleLoadExample = (type: MermaidDiagramType) => {
    const option = DIAGRAM_TYPES.find(t => t.value === type);
    if (option) {
      setPrompt(option.promptExample);
      setSelectedType(type);
    }
  };

  if (!isOpen) return null;

  const canGenerate = prompt.trim().length > 0 && state !== 'generating';
  const canImport = state === 'generated' && validation.valid && previewElements.length > 0;
  const showResults = state === 'generated' || state === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate with AI</h2>
              <p className="text-sm text-gray-400 mt-1">
                Describe your diagram and let AI create it for you
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel - Input */}
          <div className="w-full md:w-1/2 p-6 border-r border-gray-700 flex flex-col overflow-y-auto">
            {/* Diagram Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Diagram Type
              </label>
              <div className="space-y-2">
                {DIAGRAM_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    onDoubleClick={() => handleLoadExample(type.value)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedType === type.value
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-600'
                    }`}
                    title="Double-click to load example prompt"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        selectedType === type.value ? 'text-purple-300' : 'text-white'
                      }`}>
                        {type.label}
                      </span>
                      {selectedType === type.value && (
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Double-click a type to load an example prompt
              </p>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe Your Diagram
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a user login flow with authentication, validation, and error handling steps..."
                className="flex-1 min-h-[200px] bg-gray-900 text-white rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={state === 'generating'}
              />
              <p className="text-xs text-gray-500 mt-2">
                Be specific about the steps, actors, or entities you want to include
              </p>
            </div>

            {/* Error Display */}
            {state === 'error' && error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">Generation Failed</p>
                    <p className="text-xs text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              {state === 'idle' && (
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Diagram
                </button>
              )}

              {state === 'generating' && (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </button>
              )}

              {state === 'generated' && (
                <>
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    title="Generate again with the same prompt"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    title="Edit the generated code manually"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Code
                  </button>
                </>
              )}

              {state === 'error' && (
                <button
                  onClick={handleRegenerate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="w-full md:w-1/2 flex flex-col bg-gray-900/50">
            {!showResults ? (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 bg-purple-500/10 rounded-full mb-4">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Generate
                </h3>
                <p className="text-sm text-gray-400 max-w-md">
                  Describe your diagram and click "Generate" to let AI create it for you.
                  You'll be able to preview and edit the result before importing.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'code'
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-800/50'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Mermaid Code
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'preview'
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-800/50'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Visual Preview
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'code' ? (
                    <div className="h-full p-4 overflow-y-auto">
                      <textarea
                        value={generatedCode}
                        onChange={(e) => setGeneratedCode(e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full h-full min-h-[400px] bg-gray-900 text-white rounded-lg p-4 font-mono text-sm resize-none focus:outline-none ${
                          isEditing ? 'focus:ring-2 focus:ring-purple-500' : 'cursor-default'
                        }`}
                        spellCheck={false}
                      />
                      {isEditing && (
                        <p className="text-xs text-purple-400 mt-2">
                          ✏️ Editing mode: You can modify the generated code
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto">
                      {validation.valid ? (
                        <div className="p-4">
                          <svg
                            viewBox="0 0 800 600"
                            className="w-full h-auto border border-gray-700 rounded-lg"
                            style={{
                              background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px)'
                            }}
                          >
                            {previewElements.map(element => {
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
                                    rx={(element as any).cornerRadius || 0}
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
                              if (element.type === 'diamond') {
                                const cx = element.x + (element.width || 0) / 2;
                                const cy = element.y + (element.height || 0) / 2;
                                const w = (element.width || 0) / 2;
                                const h = (element.height || 0) / 2;
                                const points = `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
                                return (
                                  <polygon
                                    key={element.id}
                                    points={points}
                                    fill={element.fill || 'transparent'}
                                    stroke={element.stroke}
                                    strokeWidth={element.strokeWidth}
                                    opacity={element.opacity}
                                  />
                                );
                              }
                              if (element.type === 'line') {
                                const lineEl = element as any;
                                return (
                                  <line
                                    key={element.id}
                                    x1={element.x}
                                    y1={element.y}
                                    x2={lineEl.endX}
                                    y2={lineEl.endY}
                                    stroke={element.stroke}
                                    strokeWidth={element.strokeWidth}
                                    opacity={element.opacity}
                                    strokeDasharray={lineEl.strokeStyle === 'dashed' ? '5,5' : undefined}
                                  />
                                );
                              }
                              if (element.type === 'arrow') {
                                const arrowEl = element as any;
                                const dx = (arrowEl.endX || 0) - element.x;
                                const dy = (arrowEl.endY || 0) - element.y;
                                const angle = Math.atan2(dy, dx);
                                const arrowLength = 15;
                                
                                const arrowTipX = arrowEl.endX || 0;
                                const arrowTipY = arrowEl.endY || 0;
                                const arrowBase1X = arrowTipX - arrowLength * Math.cos(angle - Math.PI / 6);
                                const arrowBase1Y = arrowTipY - arrowLength * Math.sin(angle - Math.PI / 6);
                                const arrowBase2X = arrowTipX - arrowLength * Math.cos(angle + Math.PI / 6);
                                const arrowBase2Y = arrowTipY - arrowLength * Math.sin(angle + Math.PI / 6);

                                return (
                                  <g key={element.id}>
                                    <line
                                      x1={element.x}
                                      y1={element.y}
                                      x2={arrowEl.endX}
                                      y2={arrowEl.endY}
                                      stroke={element.stroke}
                                      strokeWidth={element.strokeWidth}
                                      opacity={element.opacity}
                                      strokeDasharray={arrowEl.strokeStyle === 'dashed' ? '5,5' : undefined}
                                    />
                                    <polygon
                                      points={`${arrowTipX},${arrowTipY} ${arrowBase1X},${arrowBase1Y} ${arrowBase2X},${arrowBase2Y}`}
                                      fill={element.stroke}
                                      opacity={element.opacity}
                                    />
                                  </g>
                                );
                              }
                              if (element.type === 'text' && element.text) {
                                return (
                                  <text
                                    key={element.id}
                                    x={element.x}
                                    y={element.y}
                                    fill={element.stroke}
                                    fontSize={element.fontSize || 14}
                                    fontFamily={element.fontFamily || 'Arial'}
                                    opacity={element.opacity}
                                  >
                                    {element.text}
                                  </text>
                                );
                              }
                              return null;
                            })}
                          </svg>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Invalid Syntax
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            The generated code has validation errors:
                          </p>
                          <ul className="text-sm text-red-400 space-y-1">
                            {validation.errors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-gray-500 mt-4">
                            Try regenerating or editing the code manually
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation Status */}
                {validation.valid && (
                  <div className="px-4 py-3 bg-green-500/10 border-t border-green-500/30">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid • {previewElements.length} elements ready to import</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {showResults && validation.valid && (
              <span>{previewElements.length} elements will be added to your board</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Import to Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
