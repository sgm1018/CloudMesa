/**
 * Tipos de elementos que se pueden dibujar en el Board
 */
import { Entity } from './index';

export type BoardElementType =
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'image'
  | 'freehand';

/**
 * Tipos de herramientas disponibles
 */
export type ToolType =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pencil'
  | 'pan'
  | 'eraser';

// Alias para compatibilidad
export type Tool = ToolType;

/**
 * Estilos de relleno
 */
export type FillStyle = 'solid' | 'hachure' | 'cross-hatch';

/**
 * Roles de usuario en el Board
 */
export type BoardRole = 'owner' | 'editor' | 'viewer';

/**
 * Elemento individual del Board
 */
export interface BoardElement {
  id: string;
  type: BoardElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  zIndex: number;

  // Propiedades de estilo
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  fillStyle?: FillStyle;

  // Para líneas y flechas
  points?: { x: number; y: number }[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };

  // Para texto
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Para imágenes
  imageUrl?: string;
  imageData?: string; // Base64

  // Para dibujo libre
  path?: string; // SVG path data

  // Metadata
  locked?: boolean;
  groupId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuración del viewport (posición y zoom del canvas)
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Configuración compartida con otros usuarios
 */
export interface SharedConfig {
  userId: string;
  role: BoardRole;
  encryptedKey?: string;
  publicKey?: string;
}

/**
 * Cursor de colaborador en tiempo real
 */
export interface CollaboratorCursor {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
  lastUpdate: Date;
}

/**
 * Board completo
 */
export interface Board extends Entity {
  name: string;
  owner: string;
  elements: BoardElement[];
  viewport: Viewport;
  sharedConfig: SharedConfig[];
  cursors: CollaboratorCursor[];
  isDeleted: boolean;
  deletedAt?: Date;
}

/**
 * Definición de herramienta del Board
 */
export interface ToolDefinition {
  type: ToolType;
  name: string;
  icon: string;
  shortcut: string;
  category: 'draw' | 'shape' | 'text' | 'utility';
  cursor?: string;
}

/**
 * Opciones de herramienta
 */
export interface ToolOptions {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  fillStyle?: FillStyle;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * Comando para patrón Command (undo/redo)
 */
export interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
  description: string;
}

/**
 * Tipo de comando
 */
export type CommandType =
  | 'create'
  | 'delete'
  | 'move'
  | 'update'
  | 'resize'
  | 'rotate'
  | 'z-index';

/**
 * Punto en el canvas
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectángulo (para selection box, bounds, etc.)
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Estado del mouse/touch
 */
export interface PointerState {
  isDown: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  button: number;
}

/**
 * Colaborador activo
 */
export interface Collaborator {
  userId: string;
  username: string;
  color: string;
  cursor: Point | null;
  selectedElement: string | null;
  isActive: boolean;
}

/**
 * DTOs para API
 */
export interface CreateBoardDto {
  name: string;
  elements?: BoardElement[];
  viewport?: Viewport;
}

export interface UpdateBoardDto {
  name?: string;
  elements?: BoardElement[];
  viewport?: Viewport;
  isDeleted?: boolean;
}

export interface ShareBoardDto {
  userId: string;
  role: BoardRole;
  encryptedKey?: string;
  publicKey?: string;
}

export interface RemoveShareDto {
  userId: string;
}

/**
 * Respuestas de AI
 */
export interface MermaidGenerateResponse {
  mermaidCode: string;
  explanation: string;
}

export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'state' | 'er';

export interface GenerateMermaidDto {
  prompt: string;
  diagramType?: DiagramType;
}

export interface ImproveMermaidDto {
  mermaidCode: string;
  improvements: string;
}

/**
 * Nodo del parser Mermaid
 */
export interface MermaidNode {
  id: string;
  label: string;
  type: 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon';
  x?: number;
  y?: number;
}

/**
 * Conexión del parser Mermaid
 */
export interface MermaidConnection {
  from: string;
  to: string;
  label?: string;
  type: 'solid' | 'dashed' | 'thick';
}

/**
 * Resultado del parser Mermaid
 */
export interface MermaidParseResult {
  nodes: MermaidNode[];
  connections: MermaidConnection[];
  direction: 'TD' | 'LR' | 'BT' | 'RL';
  diagramType: DiagramType;
}

/**
 * Configuración del grid
 */
export interface GridConfig {
  enabled: boolean;
  size: number;
  snap: boolean;
  color: string;
  opacity: number;
}

/**
 * Configuración general del Board
 */
export interface BoardConfig {
  grid: GridConfig;
  showCursors: boolean;
  showSelections: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  maxUndoHistory: number;
}
