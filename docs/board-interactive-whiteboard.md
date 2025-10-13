# Board - Interactive Collaborative Whiteboard

## 📋 Resumen Ejecutivo

Implementación de una pizarra interactiva colaborativa estilo Excalidraw que permite a múltiples usuarios trabajar en tiempo real. El Board será un nuevo tipo de entidad en el sistema con capacidades de compartición similares a los Items existentes.

### 🎨 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend Rendering** | SVG | DOM manipulation, escalabilidad perfecta, fácil styling |
| **State Management** | Command Pattern | Undo/redo robusto, historial completo |
| **Element Creation** | Factory Pattern | Consistencia, validación centralizada |
| **Real-time** | Socket.io | Colaboración en tiempo real, reconnection automática |
| **Backend** | NestJS + MongoDB | Integración con arquitectura existente |
| **Security** | E2E Encryption | AES-256-GCM + ECDH (reutiliza sistema Items) |

### 📊 Decisiones Arquitectónicas Clave

1. **SVG vs Canvas**: SVG elegido por mejor integración con React y DOM
2. **Command Pattern**: Todas las acciones pasan por `CommandInvoker` para undo/redo
3. **Factory Pattern**: `BoardFactory` centraliza creación de elementos
4. **Strategy Pattern**: `ToolRegistry` permite añadir herramientas fácilmente
5. **Shared Config**: Reutiliza sistema de permisos existente de Items
6. **WebSocket Namespace**: `/board` separado para mejor organización
7. **Z-Index Management**: Array order determina capas (front/back)
8. **Extensibilidad**: Arquitectura diseñada para crecer fácilmente

### 🎯 Características Destacadas

- ✨ **Panel de Propiedades Completo**: Editar stroke, fill, opacity, z-index
- 🖱️ **Panning Intuitivo**: Space + Click para navegar el canvas
- 📋 **Context Menu Contextual**: Clic derecho en elementos o canvas
- ⌨️ **Keyboard Shortcuts**: Más de 25 atajos de teclado
- 🔧 **Herramientas Extensibles**: Añadir nuevas herramientas en minutos
- 🔄 **Undo/Redo Robusto**: Historial completo con Command Pattern
- 🎨 **Estilos Avanzados**: Solid, hachure, cross-hatch fills
- 📐 **Layer Management**: Front, Forward, Backward, Back controls

---

## 🎯 Objetivos

1. **Crear nuevo módulo Board** independiente pero integrado con el sistema existente
2. **Implementar WebSockets** para colaboración en tiempo real
3. **Sistema de permisos** reutilizando SharedConfig existente
4. **Cifrado end-to-end** para datos del Board
5. **UI moderna** integrada con el diseño actual de CloudMesa
6. **Patrón Command** para todas las acciones (undo/redo incluido)
7. **Factory Pattern** para creación de elementos del board
8. **Renderizado SVG** para todos los elementos gráficos
9. **Arquitectura extensible** para añadir nuevas herramientas fácilmente
10. **Panel de propiedades** completo para edición de estilos
11. **Z-Index management** para organizar capas (enviar al fondo/frente)
12. **UX avanzada** con panning (Space+Click) y context menu (clic derecho)

---

## 🏗️ Arquitectura General

### Estructura de Módulos

```
CloudMesa/
├── api/
│   └── src/
│       ├── board/                    # NUEVO MÓDULO
│       │   ├── board.module.ts
│       │   ├── board.controller.ts
│       │   ├── board.service.ts
│       │   ├── board.gateway.ts      # WebSocket Gateway
│       │   ├── entities/
│       │   │   ├── board.entity.ts
│       │   │   └── board-element.entity.ts
│       │   ├── dto/
│       │   │   ├── create-board.dto.ts
│       │   │   ├── update-board.dto.ts
│       │   │   ├── board-action.dto.ts
│       │   │   └── share-board.dto.ts
│       │   └── services/
│       │       └── board-collaboration.service.ts
│       └── ...
│
└── frontend/
    └── src/
        ├── components/
        │   ├── board/                # NUEVO COMPONENTE
        │   │   ├── BoardView.tsx
        │   │   ├── BoardCanvas.tsx   # SVG-based rendering
        │   │   ├── BoardToolbar.tsx
        │   │   ├── BoardElementPanel.tsx
        │   │   ├── CollaboratorCursor.tsx
        │   │   └── elements/         # SVG Components
        │   │       ├── Rectangle.tsx
        │   │       ├── Ellipse.tsx
        │   │       ├── Diamond.tsx
        │   │       ├── Line.tsx
        │   │       ├── Arrow.tsx
        │   │       ├── Text.tsx
        │   │       ├── Image.tsx
        │   │       └── FreeDraw.tsx
        │   └── layout/
        │       └── Sidebar.tsx       # MODIFICAR: Añadir opción Board
        ├── context/
        │   └── BoardContext.tsx      # NUEVO
        ├── hooks/
        │   ├── useBoard.ts           # NUEVO
        │   ├── useBoardWebSocket.ts  # NUEVO
        │   └── useCommandHistory.ts  # NUEVO - Undo/Redo
        ├── services/
        │   ├── BoardService.ts       # NUEVO
        │   ├── board/
        │   │   ├── BoardFactory.ts       # NUEVO - Factory para elementos
        │   │   ├── CommandInvoker.ts     # NUEVO - Command Pattern
        │   │   ├── ToolRegistry.ts       # NUEVO - Registro de herramientas
        │   │   ├── tools/
        │   │   │   ├── ITool.ts          # Interface para herramientas
        │   │   │   ├── SelectTool.ts
        │   │   │   ├── RectangleTool.ts
        │   │   │   ├── EllipseTool.ts
        │   │   │   ├── LineTool.ts
        │   │   │   ├── TextTool.ts
        │   │   │   └── FreeDrawTool.ts
        │   │   └── commands/
        │   │       ├── ICommand.ts
        │   │       ├── CreateElementCommand.ts
        │   │       ├── DeleteElementCommand.ts
        │   │       ├── MoveElementCommand.ts
        │   │       ├── UpdateElementCommand.ts
        │   │       ├── ResizeElementCommand.ts
        │   │       ├── RotateElementCommand.ts
        │   │       └── ChangeZIndexCommand.ts  # NUEVO
        └── types/
            └── board.types.ts        # NUEVO
```

---

## 🔧 Sistema de Herramientas Extensible

### Arquitectura de Herramientas

Para facilitar la adición de nuevas herramientas sin modificar código existente, implementamos el **patrón Strategy** con un registro central.

```typescript
// frontend/src/services/board/tools/ITool.ts

export interface ITool {
  name: string;
  icon: string;
  cursor: string;
  
  // Lifecycle hooks
  onActivate(): void;
  onDeactivate(): void;
  
  // Event handlers
  onMouseDown(point: Point, event: MouseEvent): void;
  onMouseMove(point: Point, event: MouseEvent): void;
  onMouseUp(point: Point, event: MouseEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  
  // Render preview while drawing
  renderPreview(): JSX.Element | null;
  
  // Configuration
  getConfig(): ToolConfig;
}

export interface ToolConfig {
  requiresSelection?: boolean;
  supportsMultiSelect?: boolean;
  showInToolbar?: boolean;
  shortcut?: string;
  category?: 'draw' | 'shape' | 'text' | 'utility';
}

export abstract class BaseTool implements ITool {
  protected isActive = false;
  protected startPoint: Point | null = null;
  protected currentPoint: Point | null = null;

  abstract name: string;
  abstract icon: string;
  abstract cursor: string;

  onActivate(): void {
    this.isActive = true;
  }

  onDeactivate(): void {
    this.isActive = false;
    this.startPoint = null;
    this.currentPoint = null;
  }

  abstract onMouseDown(point: Point, event: MouseEvent): void;
  abstract onMouseMove(point: Point, event: MouseEvent): void;
  abstract onMouseUp(point: Point, event: MouseEvent): void;

  onKeyDown(event: KeyboardEvent): void {
    // Override if needed
  }

  renderPreview(): JSX.Element | null {
    return null;
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'draw',
    };
  }
}
```

### Tool Registry

```typescript
// frontend/src/services/board/ToolRegistry.ts

export class ToolRegistry {
  private static tools: Map<string, ITool> = new Map();
  private static activeTool: ITool | null = null;

  /**
   * Registrar una nueva herramienta
   */
  static register(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool ${tool.name} already registered, overwriting...`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Obtener herramienta por nombre
   */
  static getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Obtener todas las herramientas
   */
  static getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Obtener herramientas por categoría
   */
  static getToolsByCategory(category: string): ITool[] {
    return Array.from(this.tools.values()).filter(
      tool => tool.getConfig().category === category
    );
  }

  /**
   * Activar herramienta
   */
  static activateTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      console.error(`Tool ${name} not found`);
      return false;
    }

    // Desactivar herramienta actual
    if (this.activeTool) {
      this.activeTool.onDeactivate();
    }

    // Activar nueva herramienta
    this.activeTool = tool;
    tool.onActivate();
    return true;
  }

  /**
   * Obtener herramienta activa
   */
  static getActiveTool(): ITool | null {
    return this.activeTool;
  }

  /**
   * Registrar herramientas por defecto
   */
  static registerDefaultTools(): void {
    this.register(new SelectTool());
    this.register(new RectangleTool());
    this.register(new EllipseTool());
    this.register(new DiamondTool());
    this.register(new LineTool());
    this.register(new ArrowTool());
    this.register(new TextTool());
    this.register(new FreeDrawTool());
    this.register(new PanTool());
  }
}

// Inicializar al cargar la app
ToolRegistry.registerDefaultTools();
```

### Ejemplo: Rectangle Tool

```typescript
// frontend/src/services/board/tools/RectangleTool.ts

export class RectangleTool extends BaseTool {
  name = 'rectangle';
  icon = 'Square';
  cursor = 'crosshair';
  
  private previewElement: BoardElement | null = null;

  onMouseDown(point: Point, event: MouseEvent): void {
    this.startPoint = point;
    this.previewElement = BoardFactory.createRectangle(point.x, point.y, 0, 0);
  }

  onMouseMove(point: Point, event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    this.currentPoint = point;
    this.previewElement.width = point.x - this.startPoint.x;
    this.previewElement.height = point.y - this.startPoint.y;
  }

  onMouseUp(point: Point, event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    // Crear comando para añadir el elemento
    const command = new CreateElementCommand(
      this.previewElement,
      getElements(),
      sendWebSocketAction
    );
    
    commandInvoker.executeCommand(command);

    // Reset
    this.startPoint = null;
    this.previewElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;

    return (
      <RectangleElement
        element={this.previewElement}
        isSelected={false}
        isPreview={true}
      />
    );
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'shape',
      shortcut: 'r',
    };
  }
}
```

### Añadir Nueva Herramienta (Ejemplo: Star Tool)

```typescript
// frontend/src/services/board/tools/StarTool.ts

export class StarTool extends BaseTool {
  name = 'star';
  icon = 'Star';
  cursor = 'crosshair';
  
  private previewElement: BoardElement | null = null;

  onMouseDown(point: Point, event: MouseEvent): void {
    this.startPoint = point;
    this.previewElement = BoardFactory.createStar(point.x, point.y, 0);
  }

  onMouseMove(point: Point, event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;
    
    const radius = Math.hypot(
      point.x - this.startPoint.x,
      point.y - this.startPoint.y
    );
    
    this.previewElement.width = radius * 2;
    this.previewElement.height = radius * 2;
  }

  onMouseUp(point: Point, event: MouseEvent): void {
    if (!this.startPoint || !this.previewElement) return;

    const command = new CreateElementCommand(
      this.previewElement,
      getElements(),
      sendWebSocketAction
    );
    
    commandInvoker.executeCommand(command);

    this.startPoint = null;
    this.previewElement = null;
  }

  renderPreview(): JSX.Element | null {
    if (!this.previewElement) return null;

    return (
      <StarElement
        element={this.previewElement}
        isSelected={false}
        isPreview={true}
      />
    );
  }

  getConfig(): ToolConfig {
    return {
      showInToolbar: true,
      category: 'shape',
      shortcut: 's',
    };
  }
}

// Registrar la nueva herramienta
ToolRegistry.register(new StarTool());

// También añadir a BoardFactory
export class BoardFactory {
  // ... métodos existentes ...
  
  static createStar(
    x: number,
    y: number,
    radius: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'star',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      points: this.calculateStarPoints(radius),
      ...this.getDefaultProps(),
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }
  
  private static calculateStarPoints(radius: number): Point[] {
    const points: Point[] = [];
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      points.push({
        x: radius + r * Math.cos(angle),
        y: radius + r * Math.sin(angle),
      });
    }
    
    return points;
  }
}
```

---

## 🎨 Panel de Propiedades y Edición de Estilos

### 1. Factory Pattern - BoardFactory

El `BoardFactory` centraliza la creación de todos los elementos del board, asegurando consistencia y validación.

```typescript
// frontend/src/services/board/BoardFactory.ts

export class BoardFactory {
  private static nextId = 1;

  /**
   * Genera un ID único para elementos
   */
  private static generateId(): string {
    return `element_${Date.now()}_${this.nextId++}`;
  }

  /**
   * Crea valores por defecto para un elemento
   */
  private static getDefaultProps(): Partial<BoardElement> {
    return {
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
      angle: 0,
      locked: false,
      groupIds: [],
    };
  }

  /**
   * Crea un rectángulo
   */
  static createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'rectangle',
      x,
      y,
      width,
      height,
      ...this.getDefaultProps(),
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea una elipse
   */
  static createEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'ellipse',
      x,
      y,
      width,
      height,
      ...this.getDefaultProps(),
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea un diamante
   */
  static createDiamond(
    x: number,
    y: number,
    width: number,
    height: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'diamond',
      x,
      y,
      width,
      height,
      ...this.getDefaultProps(),
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea una línea
   */
  static createLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'line',
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      points: [
        { x: 0, y: 0 },
        { x: endX - startX, y: endY - startY },
      ],
      ...this.getDefaultProps(),
      backgroundColor: 'transparent', // Las líneas no tienen relleno
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea una flecha
   */
  static createArrow(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      ...this.createLine(startX, startY, endX, endY, props),
      type: 'arrow',
    };
  }

  /**
   * Crea un elemento de texto
   */
  static createText(
    x: number,
    y: number,
    text: string,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'text',
      x,
      y,
      width: 200, // Ancho inicial estimado
      height: 50, // Alto inicial estimado
      text,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      ...this.getDefaultProps(),
      backgroundColor: 'transparent',
      strokeColor: '#000000',
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea un elemento de imagen
   */
  static createImage(
    x: number,
    y: number,
    width: number,
    height: number,
    imageData: string,
    props?: Partial<BoardElement>
  ): BoardElement {
    return {
      id: this.generateId(),
      type: 'image',
      x,
      y,
      width,
      height,
      imageData,
      ...this.getDefaultProps(),
      strokeWidth: 0,
      backgroundColor: 'transparent',
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea un dibujo libre
   */
  static createFreeDraw(
    points: Point[],
    props?: Partial<BoardElement>
  ): BoardElement {
    // Calcular bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    // Normalizar puntos relativos al origen
    const normalizedPoints = points.map(p => ({
      x: p.x - minX,
      y: p.y - minY,
    }));

    return {
      id: this.generateId(),
      type: 'freedraw',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      points: normalizedPoints,
      ...this.getDefaultProps(),
      backgroundColor: 'transparent',
      ...props,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Clona un elemento existente
   */
  static cloneElement(element: BoardElement): BoardElement {
    return {
      ...element,
      id: this.generateId(),
      x: element.x + 20, // Offset para visualizar el clonado
      y: element.y + 20,
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    };
  }

  /**
   * Crea un grupo de elementos
   */
  static createGroup(elements: BoardElement[]): string {
    const groupId = `group_${Date.now()}_${this.nextId++}`;
    elements.forEach(element => {
      element.groupIds.push(groupId);
    });
    return groupId;
  }
}
```

### 2. Command Pattern - CommandInvoker

El `CommandInvoker` implementa el patrón Command para todas las acciones, permitiendo undo/redo.

```typescript
// frontend/src/services/board/commands/ICommand.ts

export interface ICommand {
  execute(): void;
  undo(): void;
  redo(): void;
  canExecute(): boolean;
  getDescription(): string;
}

export abstract class BaseCommand implements ICommand {
  protected executed = false;

  abstract execute(): void;
  abstract undo(): void;

  redo(): void {
    this.execute();
  }

  canExecute(): boolean {
    return true;
  }

  abstract getDescription(): string;
}
```

```typescript
// frontend/src/services/board/CommandInvoker.ts

export class CommandInvoker {
  private history: ICommand[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;
  private onStateChange?: () => void;

  /**
   * Ejecuta un comando y lo añade al historial
   */
  executeCommand(command: ICommand): boolean {
    if (!command.canExecute()) {
      console.warn('Command cannot be executed:', command.getDescription());
      return false;
    }

    // Eliminar comandos futuros si estamos en medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Ejecutar comando
    command.execute();
    
    // Añadir al historial
    this.history.push(command);
    this.currentIndex++;

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.notifyStateChange();
    return true;
  }

  /**
   * Deshace el último comando
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    this.notifyStateChange();
    return true;
  }

  /**
   * Rehace el comando deshecho
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo();

    this.notifyStateChange();
    return true;
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Limpia el historial
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.notifyStateChange();
  }

  /**
   * Obtiene el historial de comandos
   */
  getHistory(): string[] {
    return this.history.map(cmd => cmd.getDescription());
  }

  /**
   * Registra callback para cambios de estado
   */
  onStateChangeCallback(callback: () => void): void {
    this.onStateChange = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}

// Singleton global
export const commandInvoker = new CommandInvoker();
```

### 3. Comandos Específicos

```typescript
// frontend/src/services/board/commands/CreateElementCommand.ts

export class CreateElementCommand extends BaseCommand {
  constructor(
    private element: BoardElement,
    private elements: BoardElement[],
    private onWebSocketSync: (action: BoardActionDto) => void
  ) {
    super();
  }

  execute(): void {
    this.elements.push(this.element);
    this.executed = true;

    // Sincronizar con WebSocket
    this.onWebSocketSync({
      type: 'element_create',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { element: this.element },
    });
  }

  undo(): void {
    const index = this.elements.findIndex(e => e.id === this.element.id);
    if (index !== -1) {
      this.elements.splice(index, 1);
    }

    // Sincronizar eliminación
    this.onWebSocketSync({
      type: 'element_delete',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { elementIds: [this.element.id] },
    });
  }

  getDescription(): string {
    return `Create ${this.element.type}`;
  }
}
```

```typescript
// frontend/src/services/board/commands/DeleteElementCommand.ts

export class DeleteElementCommand extends BaseCommand {
  private deletedElements: BoardElement[] = [];
  private indices: number[] = [];

  constructor(
    private elementIds: string[],
    private elements: BoardElement[],
    private onWebSocketSync: (action: BoardActionDto) => void
  ) {
    super();
  }

  execute(): void {
    this.deletedElements = [];
    this.indices = [];

    this.elementIds.forEach(id => {
      const index = this.elements.findIndex(e => e.id === id);
      if (index !== -1) {
        this.indices.push(index);
        this.deletedElements.push(this.elements[index]);
        this.elements.splice(index, 1);
      }
    });

    this.executed = true;

    // Sincronizar
    this.onWebSocketSync({
      type: 'element_delete',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { elementIds: this.elementIds },
    });
  }

  undo(): void {
    // Restaurar elementos en sus posiciones originales
    this.deletedElements.forEach((element, i) => {
      this.elements.splice(this.indices[i], 0, element);
    });

    // Sincronizar recreación
    this.deletedElements.forEach(element => {
      this.onWebSocketSync({
        type: 'element_create',
        boardId: getCurrentBoardId(),
        userId: getCurrentUserId(),
        timestamp: Date.now(),
        data: { element },
      });
    });
  }

  getDescription(): string {
    return `Delete ${this.elementIds.length} element(s)`;
  }
}
```

```typescript
// frontend/src/services/board/commands/MoveElementCommand.ts

export class MoveElementCommand extends BaseCommand {
  private oldPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(
    private elementIds: string[],
    private deltaX: number,
    private deltaY: number,
    private elements: BoardElement[],
    private onWebSocketSync: (action: BoardActionDto) => void
  ) {
    super();
  }

  execute(): void {
    this.elementIds.forEach(id => {
      const element = this.elements.find(e => e.id === id);
      if (element) {
        // Guardar posición anterior
        this.oldPositions.set(id, { x: element.x, y: element.y });
        
        // Mover elemento
        element.x += this.deltaX;
        element.y += this.deltaY;
        element.lastModifiedBy = getCurrentUserId();
        element.lastModifiedAt = new Date();

        // Sincronizar
        this.onWebSocketSync({
          type: 'element_update',
          boardId: getCurrentBoardId(),
          userId: getCurrentUserId(),
          timestamp: Date.now(),
          data: { element },
        });
      }
    });

    this.executed = true;
  }

  undo(): void {
    this.elementIds.forEach(id => {
      const element = this.elements.find(e => e.id === id);
      const oldPos = this.oldPositions.get(id);
      if (element && oldPos) {
        element.x = oldPos.x;
        element.y = oldPos.y;
        element.lastModifiedBy = getCurrentUserId();
        element.lastModifiedAt = new Date();

        this.onWebSocketSync({
          type: 'element_update',
          boardId: getCurrentBoardId(),
          userId: getCurrentUserId(),
          timestamp: Date.now(),
          data: { element },
        });
      }
    });
  }

  getDescription(): string {
    return `Move ${this.elementIds.length} element(s)`;
  }
}
```

```typescript
// frontend/src/services/board/commands/UpdateElementCommand.ts

export class UpdateElementCommand extends BaseCommand {
  private oldState: Partial<BoardElement>;
  private element: BoardElement;

  constructor(
    private elementId: string,
    private updates: Partial<BoardElement>,
    private elements: BoardElement[],
    private onWebSocketSync: (action: BoardActionDto) => void
  ) {
    super();
    this.element = this.elements.find(e => e.id === elementId)!;
    this.oldState = { ...this.element };
  }

  execute(): void {
    Object.assign(this.element, this.updates, {
      lastModifiedBy: getCurrentUserId(),
      lastModifiedAt: new Date(),
    });

    this.executed = true;

    this.onWebSocketSync({
      type: 'element_update',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { element: this.element },
    });
  }

  undo(): void {
    Object.assign(this.element, this.oldState);

    this.onWebSocketSync({
      type: 'element_update',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { element: this.element },
    });
  }

  getDescription(): string {
    const props = Object.keys(this.updates).join(', ');
    return `Update ${this.element.type} (${props})`;
  }
}
```

### 4. Hook para Historial de Comandos

```typescript
// frontend/src/hooks/useCommandHistory.ts

export const useCommandHistory = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const updateState = () => {
      setCanUndo(commandInvoker.canUndo());
      setCanRedo(commandInvoker.canRedo());
      setHistory(commandInvoker.getHistory());
    };

    commandInvoker.onStateChangeCallback(updateState);
    updateState();

    return () => {
      commandInvoker.onStateChangeCallback(() => {});
    };
  }, []);

  const undo = useCallback(() => {
    commandInvoker.undo();
  }, []);

  const redo = useCallback(() => {
    commandInvoker.redo();
  }, []);

  const clear = useCallback(() => {
    commandInvoker.clearHistory();
  }, []);

  return { canUndo, canRedo, history, undo, redo, clear };
};
```

---

## 🎨 Panel de Propiedades y Edición de Estilos

### BoardElementPanel Component

Cuando se selecciona uno o más elementos, aparece un panel flotante que permite modificar todas las propiedades.

```typescript
// frontend/src/components/board/BoardElementPanel.tsx

export const BoardElementPanel: React.FC<ElementPanelProps> = ({
  selectedElements,
  onUpdate,
}) => {
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fillStyle, setFillStyle] = useState<'solid' | 'hachure' | 'cross-hatch'>('solid');

  useEffect(() => {
    // Cargar valores del primer elemento seleccionado
    if (selectedElements.length > 0) {
      const element = selectedElements[0];
      setStrokeColor(element.strokeColor);
      setBackgroundColor(element.backgroundColor);
      setStrokeWidth(element.strokeWidth);
      setOpacity(element.opacity);
      setFillStyle(element.fillStyle);
    }
  }, [selectedElements]);

  const handleStyleUpdate = (updates: Partial<BoardElement>) => {
    selectedElements.forEach(element => {
      const command = new UpdateElementCommand(
        element.id,
        updates,
        getElements(),
        sendWebSocketAction
      );
      commandInvoker.executeCommand(command);
    });
  };

  const handleZIndexChange = (direction: 'front' | 'forward' | 'backward' | 'back') => {
    selectedElements.forEach(element => {
      const command = new ChangeZIndexCommand(
        element.id,
        direction,
        getElements(),
        sendWebSocketAction
      );
      commandInvoker.executeCommand(command);
    });
  };

  return (
    <div className="fixed right-4 top-20 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-elevation-3 border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Properties
        </h3>
        <span className="text-xs text-gray-500">
          {selectedElements.length} selected
        </span>
      </div>

      {/* Stroke Color */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Stroke Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              handleStyleUpdate({ strokeColor: e.target.value });
            }}
            className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              handleStyleUpdate({ strokeColor: e.target.value });
            }}
            className="flex-1 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Fill Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value);
              handleStyleUpdate({ backgroundColor: e.target.value });
            }}
            className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value);
              handleStyleUpdate({ backgroundColor: e.target.value });
            }}
            className="flex-1 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          />
          <button
            onClick={() => {
              setBackgroundColor('transparent');
              handleStyleUpdate({ backgroundColor: 'transparent' });
            }}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Transparent"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Stroke Width: {strokeWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setStrokeWidth(value);
            handleStyleUpdate({ strokeWidth: value });
          }}
          className="w-full"
        />
      </div>

      {/* Fill Style */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Fill Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setFillStyle('solid');
              handleStyleUpdate({ fillStyle: 'solid' });
            }}
            className={`px-3 py-2 text-xs rounded border ${
              fillStyle === 'solid'
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-500'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
          >
            Solid
          </button>
          <button
            onClick={() => {
              setFillStyle('hachure');
              handleStyleUpdate({ fillStyle: 'hachure' });
            }}
            className={`px-3 py-2 text-xs rounded border ${
              fillStyle === 'hachure'
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-500'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
          >
            Hatch
          </button>
          <button
            onClick={() => {
              setFillStyle('cross-hatch');
              handleStyleUpdate({ fillStyle: 'cross-hatch' });
            }}
            className={`px-3 py-2 text-xs rounded border ${
              fillStyle === 'cross-hatch'
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-500'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
          >
            Cross
          </button>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Opacity: {Math.round(opacity * 100)}%
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
            handleStyleUpdate({ opacity: value });
          }}
          className="w-full"
        />
      </div>

      {/* Z-Index / Layer Control */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Arrange
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleZIndexChange('front')}
            className="flex items-center justify-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded"
            title="Bring to Front (Ctrl+Shift+])"
          >
            <ArrowUpToLine className="h-4 w-4 mr-1" />
            Front
          </button>
          <button
            onClick={() => handleZIndexChange('forward')}
            className="flex items-center justify-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded"
            title="Bring Forward (Ctrl+])"
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Forward
          </button>
          <button
            onClick={() => handleZIndexChange('backward')}
            className="flex items-center justify-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded"
            title="Send Backward (Ctrl+[)"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Backward
          </button>
          <button
            onClick={() => handleZIndexChange('back')}
            className="flex items-center justify-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded"
            title="Send to Back (Ctrl+Shift+[)"
          >
            <ArrowDownToLine className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
      </div>

      {/* Lock / Unlock */}
      <div>
        <button
          onClick={() => handleStyleUpdate({ locked: !selectedElements[0].locked })}
          className="w-full flex items-center justify-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded"
        >
          {selectedElements[0]?.locked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Unlock
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 mr-2" />
              Lock
            </>
          )}
        </button>
      </div>
    </div>
  );
};
```

### ChangeZIndexCommand

```typescript
// frontend/src/services/board/commands/ChangeZIndexCommand.ts

export class ChangeZIndexCommand extends BaseCommand {
  private oldIndex: number;
  private newIndex: number;
  private element: BoardElement;

  constructor(
    private elementId: string,
    private direction: 'front' | 'forward' | 'backward' | 'back',
    private elements: BoardElement[],
    private onWebSocketSync: (action: BoardActionDto) => void
  ) {
    super();
    const index = this.elements.findIndex(e => e.id === elementId);
    this.element = this.elements[index];
    this.oldIndex = index;
    this.newIndex = this.calculateNewIndex(index);
  }

  private calculateNewIndex(currentIndex: number): number {
    switch (this.direction) {
      case 'front':
        return this.elements.length - 1;
      case 'forward':
        return Math.min(currentIndex + 1, this.elements.length - 1);
      case 'backward':
        return Math.max(currentIndex - 1, 0);
      case 'back':
        return 0;
      default:
        return currentIndex;
    }
  }

  execute(): void {
    // Remover del índice actual
    this.elements.splice(this.oldIndex, 1);
    
    // Insertar en nuevo índice
    this.elements.splice(this.newIndex, 0, this.element);

    this.executed = true;

    // Sincronizar
    this.onWebSocketSync({
      type: 'element_z_index',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: {
        elementId: this.elementId,
        direction: this.direction,
        newIndex: this.newIndex,
      },
    });
  }

  undo(): void {
    // Remover del nuevo índice
    this.elements.splice(this.newIndex, 1);
    
    // Restaurar en índice original
    this.elements.splice(this.oldIndex, 0, this.element);

    // Sincronizar
    this.onWebSocketSync({
      type: 'element_z_index',
      boardId: getCurrentBoardId(),
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: {
        elementId: this.elementId,
        direction: this.getOppositeDirection(),
        newIndex: this.oldIndex,
      },
    });
  }

  private getOppositeDirection(): 'front' | 'forward' | 'backward' | 'back' {
    switch (this.direction) {
      case 'front': return 'back';
      case 'forward': return 'backward';
      case 'backward': return 'forward';
      case 'back': return 'front';
    }
  }

  getDescription(): string {
    return `Change Z-Index: ${this.direction}`;
  }
}
```

---

## 🖱️ Interacciones Avanzadas (Panning y Context Menu)

### Panning con Space + Click

```typescript
// frontend/src/components/board/BoardCanvas.tsx (actualización)

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  board,
  onAction,
  collaborators,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Detectar tecla Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        document.body.style.cursor = 'grab';
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);
  
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current!, viewport);
    
    // Si Space está presionado, iniciar panning
    if (isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = 'grabbing';
      return;
    }
    
    // Lógica normal de herramientas
    const activeTool = ToolRegistry.getActiveTool();
    if (activeTool) {
      activeTool.onMouseDown(point, e.nativeEvent);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current!, viewport);
    
    // Si está haciendo panning
    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Enviar posición del cursor a colaboradores
    onAction({
      type: 'cursor_move',
      boardId: board._id,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { x: point.x, y: point.y },
    });
    
    // Lógica normal de herramientas
    const activeTool = ToolRegistry.getActiveTool();
    if (activeTool) {
      activeTool.onMouseMove(point, e.nativeEvent);
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = isSpacePressed ? 'grab' : 'default';
      return;
    }
    
    const activeTool = ToolRegistry.getActiveTool();
    if (activeTool) {
      const point = getSVGPoint(e, svgRef.current!, viewport);
      activeTool.onMouseUp(point, e.nativeEvent);
    }
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <svg
        ref={svgRef}
        className={`w-full h-full ${isSpacePressed ? 'cursor-grab' : 'cursor-crosshair'} ${isPanning ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* ... contenido SVG ... */}
      </svg>
    </div>
  );
};
```

### Context Menu

```typescript
// frontend/src/components/board/ContextMenu.tsx

interface ContextMenuProps {
  x: number;
  y: number;
  target: 'canvas' | 'element';
  selectedElements: BoardElement[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  target,
  selectedElements,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const handleCut = () => {
    // Copiar y eliminar elementos seleccionados
    copyToClipboard(selectedElements);
    deleteSelectedElements();
    onClose();
  };
  
  const handleCopy = () => {
    copyToClipboard(selectedElements);
    onClose();
  };
  
  const handlePaste = () => {
    pasteFromClipboard({ x, y });
    onClose();
  };
  
  const handleDuplicate = () => {
    selectedElements.forEach(element => {
      const cloned = BoardFactory.cloneElement(element);
      const command = new CreateElementCommand(cloned, getElements(), sendWebSocketAction);
      commandInvoker.executeCommand(command);
    });
    onClose();
  };
  
  const handleDelete = () => {
    deleteSelectedElements();
    onClose();
  };
  
  const handleBringToFront = () => {
    selectedElements.forEach(element => {
      const command = new ChangeZIndexCommand(element.id, 'front', getElements(), sendWebSocketAction);
      commandInvoker.executeCommand(command);
    });
    onClose();
  };
  
  const handleSendToBack = () => {
    selectedElements.forEach(element => {
      const command = new ChangeZIndexCommand(element.id, 'back', getElements(), sendWebSocketAction);
      commandInvoker.executeCommand(command);
    });
    onClose();
  };
  
  const handleGroup = () => {
    if (selectedElements.length > 1) {
      BoardFactory.createGroup(selectedElements);
    }
    onClose();
  };
  
  const handleLock = () => {
    selectedElements.forEach(element => {
      const command = new UpdateElementCommand(
        element.id,
        { locked: true },
        getElements(),
        sendWebSocketAction
      );
      commandInvoker.executeCommand(command);
    });
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-elevation-3 border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] z-50 animate-fade-in"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {target === 'element' && selectedElements.length > 0 ? (
        <>
          {/* Menu para elementos seleccionados */}
          <ContextMenuItem
            icon={<Scissors className="h-4 w-4" />}
            label="Cut"
            shortcut="Ctrl+X"
            onClick={handleCut}
          />
          <ContextMenuItem
            icon={<Copy className="h-4 w-4" />}
            label="Copy"
            shortcut="Ctrl+C"
            onClick={handleCopy}
          />
          <ContextMenuItem
            icon={<Clipboard className="h-4 w-4" />}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={handlePaste}
          />
          <ContextMenuItem
            icon={<CopyPlus className="h-4 w-4" />}
            label="Duplicate"
            shortcut="Ctrl+D"
            onClick={handleDuplicate}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          
          <ContextMenuItem
            icon={<ArrowUpToLine className="h-4 w-4" />}
            label="Bring to Front"
            shortcut="Ctrl+Shift+]"
            onClick={handleBringToFront}
          />
          <ContextMenuItem
            icon={<ArrowDownToLine className="h-4 w-4" />}
            label="Send to Back"
            shortcut="Ctrl+Shift+["
            onClick={handleSendToBack}
          />
          
          {selectedElements.length > 1 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <ContextMenuItem
                icon={<Group className="h-4 w-4" />}
                label="Group"
                shortcut="Ctrl+G"
                onClick={handleGroup}
              />
            </>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          
          <ContextMenuItem
            icon={<Lock className="h-4 w-4" />}
            label="Lock"
            shortcut="Ctrl+L"
            onClick={handleLock}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          
          <ContextMenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            shortcut="Del"
            onClick={handleDelete}
            danger
          />
        </>
      ) : (
        <>
          {/* Menu para canvas vacío */}
          <ContextMenuItem
            icon={<Clipboard className="h-4 w-4" />}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={handlePaste}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          
          <ContextMenuItem
            icon={<Download className="h-4 w-4" />}
            label="Export Board"
            onClick={() => {
              // Lógica de exportación
              onClose();
            }}
          />
          
          <ContextMenuItem
            icon={<Settings className="h-4 w-4" />}
            label="Board Settings"
            onClick={() => {
              // Abrir settings
              onClose();
            }}
          />
        </>
      )}
    </div>
  );
};

// Componente auxiliar para items del menu
const ContextMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, shortcut, onClick, danger }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        danger ? 'text-error-600 dark:text-error-400' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {shortcut}
        </span>
      )}
    </button>
  );
};
```

### Integrar Context Menu en BoardCanvas

```typescript
// Añadir al BoardCanvas

const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  target: 'canvas' | 'element';
} | null>(null);

const handleContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
  e.preventDefault();
  
  const target = e.target as SVGElement;
  const isElement = target.closest('[data-element-id]');
  
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    target: isElement ? 'element' : 'canvas',
  });
};

return (
  <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
    <svg
      ref={svgRef}
      // ... otros props ...
      onContextMenu={handleContextMenu}
    >
      {/* ... contenido SVG ... */}
    </svg>
    
    {/* Context Menu */}
    {contextMenu && (
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        target={contextMenu.target}
        selectedElements={elements.filter(e => selectedIds.includes(e.id))}
        onClose={() => setContextMenu(null)}
      />
    )}
  </div>
);
```

---

## 📊 Modelo de Datos

### 1. Board Entity (Backend)

```typescript
// api/src/board/entities/board.entity.ts

@Schema()
export class Board extends Entity {
  
  @Prop({ required: true })
  userId: string;                    // Propietario del board
  
  @Prop({ required: true })
  boardName: string;                 // Nombre del board
  
  @Prop()
  description?: string;              // Descripción opcional
  
  @Prop({ required: true })
  encryptedContent: string;          // Contenido cifrado del board (JSON)
  
  @Prop({ required: true, type: Object })
  encryption: Encryption;            // Datos de cifrado (reutiliza entidad existente)
  
  @Prop({ type: Array })
  sharedWith?: SharedConfig[];       // Compartición (reutiliza entidad existente)
  
  @Prop({ default: false })
  isTemplate: boolean;               // Si es una plantilla pública
  
  @Prop({ type: Object })
  thumbnail?: {
    data: string;                    // Base64 del thumbnail
    width: number;
    height: number;
  };
  
  @Prop({ type: Array, default: [] })
  activeCollaborators: string[];     // IDs de usuarios conectados actualmente
  
  @Prop()
  lastActivity?: Date;               // Última actividad en el board
  
  @Prop({ type: Object })
  settings?: {
    backgroundColor: string;
    gridEnabled: boolean;
    snapToGrid: boolean;
    viewportX: number;
    viewportY: number;
    zoom: number;
  };
}
```

### 2. Board Element Structure (Cifrado en encryptedContent)

```typescript
// Estructura que se cifrará y guardará en encryptedContent

interface BoardContent {
  version: string;                   // Versión del formato
  elements: BoardElement[];          // Elementos del board
  appState: BoardAppState;           // Estado de la aplicación
}

interface BoardElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'image' | 'freedraw';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch';
  strokeWidth: number;
  roughness: number;
  opacity: number;
  points?: Point[];                  // Para líneas y dibujo libre
  text?: string;                     // Para elementos de texto
  fontSize?: number;
  fontFamily?: string;
  locked: boolean;
  link?: string;
  groupIds: string[];
  lastModifiedBy: string;            // userId del último modificador
  lastModifiedAt: Date;
}

interface BoardAppState {
  viewportX: number;
  viewportY: number;
  zoom: number;
  scrollX: number;
  scrollY: number;
  currentTool: string;
  selectedElementIds: string[];
}
```

### 3. WebSocket Message Types

```typescript
// api/src/board/dto/board-action.dto.ts

enum BoardActionType {
  JOIN_BOARD = 'join_board',
  LEAVE_BOARD = 'leave_board',
  CURSOR_MOVE = 'cursor_move',
  ELEMENT_CREATE = 'element_create',
  ELEMENT_UPDATE = 'element_update',
  ELEMENT_DELETE = 'element_delete',
  SELECTION_CHANGE = 'selection_change',
  VIEWPORT_CHANGE = 'viewport_change',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SAVE_SNAPSHOT = 'save_snapshot',
}

interface BoardActionDto {
  type: BoardActionType;
  boardId: string;
  userId: string;
  timestamp: number;
  data: any;                         // Datos específicos de la acción
}

// Ejemplos de data según el tipo:

// CURSOR_MOVE
interface CursorMoveData {
  x: number;
  y: number;
  userName: string;
  userColor: string;
}

// ELEMENT_CREATE / ELEMENT_UPDATE
interface ElementActionData {
  element: BoardElement;
}

// ELEMENT_DELETE
interface ElementDeleteData {
  elementIds: string[];
}
```

---

## 🔐 Seguridad y Cifrado

### Flujo de Cifrado

1. **Creación de Board**:
   - Frontend genera clave simétrica (AES-256-GCM)
   - Contenido del board se cifra con clave simétrica
   - Clave simétrica se cifra con clave pública del usuario (ECDH)
   - Se envía `encryptedContent` + `encryption` al backend

2. **Compartir Board**:
   - Usuario obtiene clave simétrica descifrada
   - Cifra clave simétrica con clave pública del destinatario
   - Se agrega nuevo `SharedConfig` con `encryptedKey` del destinatario
   - Backend actualiza `sharedWith[]`

3. **Colaboración en Tiempo Real**:
   - Cambios en WebSocket se envían **cifrados**
   - Cada cliente descifra con su clave simétrica
   - Las operaciones (crear, mover, etc.) se cifran antes de broadcast

### Permisos

Reutiliza el sistema existente de `SharedConfig`:

```typescript
interface Permission {
  read: boolean;    // Ver el board
  write: boolean;   // Editar el board
}

// Roles efectivos:
// - Owner: read + write + delete + share
// - Editor: read + write (can edit pero no share ni delete)
// - Viewer: read only (solo ver, cursor visible para otros)
```

---

## 🔌 WebSocket Implementation

### 1. Board Gateway (NestJS)

```typescript
// api/src/board/board.gateway.ts

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/board',
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;
  
  private boardRooms: Map<string, Set<string>> = new Map();
  private userSockets: Map<string, Socket> = new Map();
  
  constructor(
    private readonly boardService: BoardService,
    private readonly boardCollaborationService: BoardCollaborationService,
  ) {}
  
  async handleConnection(client: Socket) {
    // Autenticar usuario desde token JWT
    const userId = await this.authenticateSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    this.userSockets.set(userId, client);
  }
  
  async handleDisconnect(client: Socket) {
    // Limpiar usuario de todos los rooms
    const userId = this.getUserIdFromSocket(client);
    this.leaveAllBoards(userId);
    this.userSockets.delete(userId);
  }
  
  @SubscribeMessage('join_board')
  async handleJoinBoard(
    @MessageBody() data: { boardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);
    
    // Verificar permisos
    const hasAccess = await this.boardService.hasAccess(data.boardId, userId);
    if (!hasAccess) {
      return { error: 'Access denied' };
    }
    
    // Unirse al room
    client.join(`board_${data.boardId}`);
    
    // Actualizar lista de colaboradores
    if (!this.boardRooms.has(data.boardId)) {
      this.boardRooms.set(data.boardId, new Set());
    }
    this.boardRooms.get(data.boardId).add(userId);
    
    // Notificar a otros usuarios
    client.to(`board_${data.boardId}`).emit('user_joined', {
      userId,
      timestamp: Date.now(),
    });
    
    // Devolver lista actual de colaboradores
    return {
      collaborators: Array.from(this.boardRooms.get(data.boardId)),
    };
  }
  
  @SubscribeMessage('board_action')
  async handleBoardAction(
    @MessageBody() action: BoardActionDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);
    
    // Verificar permisos de escritura si es necesario
    if (this.requiresWritePermission(action.type)) {
      const hasWrite = await this.boardService.hasWritePermission(action.boardId, userId);
      if (!hasWrite) {
        return { error: 'Write permission required' };
      }
    }
    
    // Broadcast a otros en el room (excepto el emisor)
    client.to(`board_${action.boardId}`).emit('board_action', action);
    
    // Guardar snapshot periódicamente
    if (this.shouldSaveSnapshot(action)) {
      await this.boardService.saveSnapshot(action.boardId, action.data);
    }
    
    return { success: true };
  }
}
```

### 2. Frontend WebSocket Hook

```typescript
// frontend/src/hooks/useBoardWebSocket.ts

export const useBoardWebSocket = (boardId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  useEffect(() => {
    const newSocket = io(`${API_URL}/board`, {
      auth: {
        token: getAuthToken(),
      },
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_board', { boardId });
    });
    
    newSocket.on('user_joined', (data) => {
      // Actualizar lista de colaboradores
    });
    
    newSocket.on('board_action', (action: BoardActionDto) => {
      // Procesar acción del board
      handleBoardAction(action);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.emit('leave_board', { boardId });
      newSocket.close();
    };
  }, [boardId]);
  
  const sendAction = useCallback((action: BoardActionDto) => {
    if (socket && isConnected) {
      socket.emit('board_action', action);
    }
  }, [socket, isConnected]);
  
  return { socket, isConnected, collaborators, sendAction };
};
```

---

## 🎨 Frontend Components

### 1. BoardView (Main Component)

```typescript
// frontend/src/components/board/BoardView.tsx

export const BoardView: React.FC = () => {
  const { boards, currentBoard, setCurrentBoard } = useBoardContext();
  const { sendAction, collaborators } = useBoardWebSocket(currentBoard?._id);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header con breadcrumb y botones */}
      <BoardHeader 
        board={currentBoard}
        collaborators={collaborators}
        onShare={handleShare}
        onExport={handleExport}
      />
      
      {/* Canvas principal */}
      <BoardCanvas 
        board={currentBoard}
        onAction={sendAction}
        collaborators={collaborators}
      />
      
      {/* Toolbar flotante */}
      <BoardToolbar 
        currentTool={currentTool}
        onToolChange={setCurrentTool}
      />
      
      {/* Panel de propiedades */}
      {selectedElements.length > 0 && (
        <BoardElementPanel 
          elements={selectedElements}
          onUpdate={handleUpdateElements}
        />
      )}
    </div>
  );
};
```

### 2. BoardCanvas (Drawing Area)

```typescript
// frontend/src/components/board/BoardCanvas.tsx

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  board,
  onAction,
  collaborators,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempElement, setTempElement] = useState<BoardElement | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        commandInvoker.undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z - Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        commandInvoker.redo();
      }
      // Delete / Backspace - Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        handleDeleteSelected();
      }
      // Ctrl+D / Cmd+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        handleDuplicateSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current!, viewport);
    
    if (currentTool === 'select') {
      handleSelectionStart(point);
    } else {
      handleDrawStart(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current!, viewport);
    
    // Enviar posición del cursor a colaboradores
    onAction({
      type: 'cursor_move',
      boardId: board._id,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      data: { x: point.x, y: point.y },
    });

    if (isDrawing && tempElement) {
      handleDrawMove(point);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawing && tempElement) {
      handleDrawEnd();
    }
    setIsDrawing(false);
  };

  const handleDrawStart = (point: Point) => {
    setIsDrawing(true);
    
    let newElement: BoardElement;
    
    switch (currentTool) {
      case 'rectangle':
        newElement = BoardFactory.createRectangle(point.x, point.y, 0, 0);
        break;
      case 'ellipse':
        newElement = BoardFactory.createEllipse(point.x, point.y, 0, 0);
        break;
      case 'diamond':
        newElement = BoardFactory.createDiamond(point.x, point.y, 0, 0);
        break;
      case 'line':
        newElement = BoardFactory.createLine(point.x, point.y, point.x, point.y);
        break;
      case 'arrow':
        newElement = BoardFactory.createArrow(point.x, point.y, point.x, point.y);
        break;
      case 'text':
        newElement = BoardFactory.createText(point.x, point.y, 'Text');
        break;
      case 'freedraw':
        newElement = BoardFactory.createFreeDraw([point]);
        break;
      default:
        return;
    }
    
    setTempElement(newElement);
  };

  const handleDrawMove = (point: Point) => {
    if (!tempElement) return;
    
    const updated = { ...tempElement };
    
    if (currentTool === 'freedraw') {
      updated.points = [...(updated.points || []), point];
    } else {
      updated.width = point.x - updated.x;
      updated.height = point.y - updated.y;
    }
    
    setTempElement(updated);
  };

  const handleDrawEnd = () => {
    if (!tempElement) return;
    
    // Crear comando para añadir elemento
    const command = new CreateElementCommand(
      tempElement,
      elements,
      onAction
    );
    
    commandInvoker.executeCommand(command);
    setTempElement(null);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    const command = new DeleteElementCommand(
      selectedIds,
      elements,
      onAction
    );
    
    commandInvoker.executeCommand(command);
    setSelectedIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
      const element = elements.find(e => e.id === id);
      if (element) {
        const cloned = BoardFactory.cloneElement(element);
        const command = new CreateElementCommand(cloned, elements, onAction);
        commandInvoker.executeCommand(command);
      }
    });
  };

  // Renderizar elementos SVG
  const renderElement = (element: BoardElement) => {
    const isSelected = selectedIds.includes(element.id);
    
    switch (element.type) {
      case 'rectangle':
        return (
          <RectangleElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'ellipse':
        return (
          <EllipseElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'diamond':
        return (
          <DiamondElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'line':
        return (
          <LineElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'arrow':
        return (
          <ArrowElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'text':
        return (
          <TextElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'image':
        return (
          <ImageElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      case 'freedraw':
        return (
          <FreeDrawElement
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={() => setSelectedIds([element.id])}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Grid opcional */}
        {board.settings?.gridEnabled && <GridPattern />}
        
        {/* Elementos del board */}
        <g id="elements">
          {elements.map(renderElement)}
          {tempElement && renderElement(tempElement)}
        </g>
        
        {/* Cursores de colaboradores */}
        <g id="collaborators">
          {collaborators.map(collab => (
            <CollaboratorCursor
              key={collab.userId}
              collaborator={collab}
            />
          ))}
        </g>
        
        {/* Selection box */}
        {selectedIds.length > 0 && (
          <SelectionBox elementIds={selectedIds} elements={elements} />
        )}
      </svg>
      
      {/* Zoom controls */}
      <ZoomControls viewport={viewport} onViewportChange={setViewport} />
    </div>
  );
};
```

### Componentes SVG de Elementos

```typescript
// frontend/src/components/board/elements/Rectangle.tsx

export const RectangleElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  return (
    <g
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        transform: `rotate(${element.angle}deg)`,
        transformOrigin: `${element.x + element.width / 2}px ${element.y + element.height / 2}px`,
      }}
    >
      <rect
        x={element.x}
        y={element.y}
        width={Math.abs(element.width)}
        height={Math.abs(element.height)}
        fill={element.backgroundColor}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        className={`transition-all ${isSelected ? 'stroke-primary-500 stroke-2' : ''}`}
      />
      
      {isSelected && (
        <g>
          {/* Resize handles */}
          <ResizeHandles element={element} />
          {/* Rotate handle */}
          <RotateHandle element={element} />
        </g>
      )}
    </g>
  );
};
```

```typescript
// frontend/src/components/board/elements/Ellipse.tsx

export const EllipseElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const rx = Math.abs(element.width) / 2;
  const ry = Math.abs(element.height) / 2;
  const cx = element.x + rx;
  const cy = element.y + ry;

  return (
    <g
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        transform: `rotate(${element.angle}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={element.backgroundColor}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        className={`transition-all ${isSelected ? 'stroke-primary-500 stroke-2' : ''}`}
      />
      
      {isSelected && (
        <g>
          <ResizeHandles element={element} />
          <RotateHandle element={element} />
        </g>
      )}
    </g>
  );
};
```

```typescript
// frontend/src/components/board/elements/Diamond.tsx

export const DiamondElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const cx = element.x + element.width / 2;
  const cy = element.y + element.height / 2;
  
  const points = `
    ${cx},${element.y}
    ${element.x + element.width},${cy}
    ${cx},${element.y + element.height}
    ${element.x},${cy}
  `;

  return (
    <g
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        transform: `rotate(${element.angle}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      <polygon
        points={points}
        fill={element.backgroundColor}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        className={`transition-all ${isSelected ? 'stroke-primary-500 stroke-2' : ''}`}
      />
      
      {isSelected && (
        <g>
          <ResizeHandles element={element} />
          <RotateHandle element={element} />
        </g>
      )}
    </g>
  );
};
```

```typescript
// frontend/src/components/board/elements/Arrow.tsx

export const ArrowElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const points = element.points || [];
  if (points.length < 2) return null;

  const start = points[0];
  const end = points[points.length - 1];
  
  // Calcular ángulo de la flecha
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const arrowSize = element.strokeWidth * 3;

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Línea principal */}
      <line
        x1={element.x + start.x}
        y1={element.y + start.y}
        x2={element.x + end.x}
        y2={element.y + end.y}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        className={`transition-all ${isSelected ? 'stroke-primary-500' : ''}`}
      />
      
      {/* Punta de flecha */}
      <polygon
        points={`
          ${element.x + end.x},${element.y + end.y}
          ${element.x + end.x - arrowSize * Math.cos(angle - Math.PI / 6)},${element.y + end.y - arrowSize * Math.sin(angle - Math.PI / 6)}
          ${element.x + end.x - arrowSize * Math.cos(angle + Math.PI / 6)},${element.y + end.y - arrowSize * Math.sin(angle + Math.PI / 6)}
        `}
        fill={element.strokeColor}
        opacity={element.opacity}
      />
      
      {isSelected && (
        <g>
          <ResizeHandles element={element} />
        </g>
      )}
    </g>
  );
};
```

```typescript
// frontend/src/components/board/elements/FreeDraw.tsx

export const FreeDrawElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const points = element.points || [];
  if (points.length < 2) return null;

  // Convertir puntos a path usando perfect-freehand
  const stroke = getStroke(points, {
    size: element.strokeWidth * 2,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(stroke);

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      <path
        d={pathData}
        fill={element.strokeColor}
        opacity={element.opacity}
        className={`transition-all ${isSelected ? 'drop-shadow-lg' : ''}`}
      />
      
      {isSelected && (
        <g>
          <ResizeHandles element={element} />
        </g>
      )}
    </g>
  );
};

// Helper para convertir stroke a SVG path
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}
```

```typescript
// frontend/src/components/board/elements/Text.tsx

export const TextElement: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.text || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== element.text) {
      const command = new UpdateElementCommand(
        element.id,
        { text },
        elements,
        onAction
      );
      commandInvoker.executeCommand(command);
    }
  };

  return (
    <g
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: 'text',
        transform: `rotate(${element.angle}deg)`,
        transformOrigin: `${element.x}px ${element.y}px`,
      }}
    >
      {isEditing ? (
        <foreignObject
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
        >
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              color: element.strokeColor,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              width: '100%',
              height: '100%',
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={element.x}
          y={element.y + (element.fontSize || 16)}
          fontSize={element.fontSize}
          fontFamily={element.fontFamily}
          fill={element.strokeColor}
          opacity={element.opacity}
          className={`transition-all ${isSelected ? 'drop-shadow-lg' : ''}`}
        >
          {element.text}
        </text>
      )}
      
      {isSelected && !isEditing && (
        <g>
          <ResizeHandles element={element} />
          <RotateHandle element={element} />
        </g>
      )}
    </g>
  );
};
```

---

### 2. BoardCanvas (Drawing Area) - DEPRECATED (Canvas HTML5)

### 3. Sidebar Integration

```typescript
// frontend/src/components/layout/Sidebar.tsx (MODIFICAR)

const Sidebar: React.FC = () => {
  // ... código existente ...
  
  return (
    <aside>
      {/* ... header existente ... */}
      
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {/* Botones existentes: Files, Passwords */}
          
          {/* NUEVO: Board */}
          <button
            onClick={() => handleViewChange('board')}
            className={`group flex items-center w-full px-3 py-2.5 rounded-lg transition-colors duration-200 ${
              currentView === 'board'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <LayoutGrid className={`h-5 w-5 ${
              currentView === 'board' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`} />
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <span className="font-medium text-sm">Boards</span>
              </div>
            )}
          </button>
        </div>
      </nav>
      
      {/* ... footer existente ... */}
    </aside>
  );
};
```

---

## 🛣️ API Endpoints

### REST API

```typescript
// Board CRUD
POST   /api/board                    // Crear board
GET    /api/board                    // Listar boards del usuario
GET    /api/board/:id                // Obtener board específico
PATCH  /api/board/:id                // Actualizar board
DELETE /api/board/:id                // Eliminar board

// Sharing
POST   /api/board/:id/share          // Compartir board
DELETE /api/board/:id/share/:userId  // Dejar de compartir
GET    /api/board/:id/collaborators  // Listar colaboradores

// Templates
GET    /api/board/templates          // Listar templates públicos
POST   /api/board/:id/template       // Convertir en template

// Export
GET    /api/board/:id/export/png     // Exportar como PNG
GET    /api/board/:id/export/svg     // Exportar como SVG
GET    /api/board/:id/export/json    // Exportar como JSON
```

### WebSocket Events

```typescript
// Client -> Server
join_board          // Unirse a un board
leave_board         // Salir de un board
board_action        // Enviar acción (crear, editar, eliminar elemento)

// Server -> Client
user_joined         // Otro usuario se unió
user_left           // Otro usuario salió
board_action        // Acción de otro usuario
sync_request        // Servidor solicita sincronización completa
```

---

## 📦 Dependencias Necesarias

### Backend (api/)

```json
{
  "dependencies": {
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "socket.io": "^4.6.0"
  }
}
```

**Instalación:**
```bash
cd api
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Frontend (frontend/)

```json
{
  "dependencies": {
    "socket.io-client": "^4.6.0",
    "perfect-freehand": "^1.2.0",    // Para dibujo libre suave
    "@use-gesture/react": "^10.3.0"  // Para gestos táctiles (opcional)
  }
}
```

**Instalación:**
```bash
cd frontend
npm install socket.io-client perfect-freehand @use-gesture/react
```

**Nota sobre rough-notation**: No es necesario ya que usamos SVG nativo en lugar de efectos de dibujo a mano. Si se desea ese estilo, se puede implementar con SVG filters.

---

## 🚀 Plan de Implementación

### Fase 1: Backend Base (Semana 1)
- [ ] Crear módulo `board/`
- [ ] Implementar `Board.entity.ts` con SharedConfig
- [ ] Crear DTOs básicos (create, update, share)
- [ ] Implementar CRUD en `board.controller.ts` y `board.service.ts`
- [ ] Configurar cifrado (reutilizar sistema de Items)
- [ ] Tests unitarios básicos

### Fase 2: WebSocket (Semana 2)
- [ ] Implementar `board.gateway.ts`
- [ ] Sistema de rooms y colaboradores
- [ ] Manejo de acciones en tiempo real
- [ ] Sistema de snapshots automáticos
- [ ] Autenticación de WebSocket con JWT
- [ ] Tests de WebSocket

### Fase 3: Frontend Base (Semana 3)
- [ ] Crear tipos TypeScript (`board.types.ts`)
- [ ] Implementar `BoardService.ts` (API calls)
- [ ] Crear `BoardContext.tsx` para estado global
- [ ] Componente `BoardView.tsx` base
- [ ] Hook `useBoardWebSocket.ts`
- [ ] Integración con Sidebar

### Fase 4: Patrones de Diseño (Semana 4)
- [ ] Implementar `BoardFactory.ts` con todos los métodos de creación
- [ ] Implementar `ICommand` interface y `BaseCommand` abstract
- [ ] Crear `CommandInvoker.ts` con historial undo/redo
- [ ] Implementar comandos básicos:
  - [ ] CreateElementCommand
  - [ ] DeleteElementCommand
  - [ ] MoveElementCommand
  - [ ] UpdateElementCommand
  - [ ] ResizeElementCommand
  - [ ] RotateElementCommand
  - [ ] ChangeZIndexCommand (front, forward, backward, back)
- [ ] Hook `useCommandHistory.ts`
- [ ] **Sistema de Herramientas Extensible**:
  - [ ] Implementar `ITool` interface y `BaseTool` abstract
  - [ ] Crear `ToolRegistry.ts` con registro de herramientas
  - [ ] Implementar herramientas básicas (SelectTool, RectangleTool, etc.)
  - [ ] PanTool para navegación con Space+Click
- [ ] Tests unitarios de comandos

### Fase 5: SVG Canvas y Elementos Básicos (Semana 5)
- [ ] Implementar `BoardCanvas.tsx` con SVG
- [ ] Componente `RectangleElement.tsx`
- [ ] Componente `EllipseElement.tsx`
- [ ] Componente `DiamondElement.tsx`
- [ ] Componente `LineElement.tsx`
- [ ] Sistema de selección
- [ ] Pan y zoom con viewport
- [ ] Grid opcional

### Fase 6: Elementos Avanzados (Semana 6)
- [ ] Componente `ArrowElement.tsx` con puntas
- [ ] Componente `TextElement.tsx` con edición inline
- [ ] Componente `ImageElement.tsx` con upload
- [ ] Componente `FreeDrawElement.tsx` con perfect-freehand
- [ ] ResizeHandles component
- [ ] RotateHandle component
- [ ] SelectionBox component

### Fase 7: Colaboración Visual (Semana 7)
- [ ] Cursores de colaboradores en tiempo real
- [ ] Indicadores de selección de otros usuarios
- [ ] Sistema de colores por usuario
- [ ] Lista de colaboradores activos
- [ ] Notificaciones de entrada/salida
- [ ] Sincronización de viewport (opcional)

### Fase 8: Toolbar y Herramientas (Semana 8)
- [ ] Componente `BoardToolbar.tsx`
- [ ] Selector de herramientas con ToolRegistry
- [ ] Selector de colores (stroke y fill)
- [ ] Selector de grosor de trazo
- [ ] Selector de opacidad
- [ ] Selector de fill style (solid, hatch, cross-hatch)
- [ ] Botones undo/redo con estados
- [ ] Shortcuts de teclado completos
- [ ] **Panel de Propiedades `BoardElementPanel.tsx`**:
  - [ ] Edición de stroke color
  - [ ] Edición de fill color con botón transparent
  - [ ] Edición de stroke width (slider)
  - [ ] Edición de opacity (slider)
  - [ ] Edición de fill style (botones)
  - [ ] Controles de Z-Index (Front, Forward, Backward, Back)
  - [ ] Botón Lock/Unlock
- [ ] **Interacciones Avanzadas**:
  - [ ] Panning con Space + Click
  - [ ] Context Menu en clic derecho
  - [ ] Menú específico para elementos seleccionados
  - [ ] Menú específico para canvas vacío

### Fase 9: Permisos y Compartición (Semana 9)
- [ ] UI de compartir board
- [ ] Modal de permisos (viewer/editor/owner)
- [ ] Gestión de shared users
- [ ] Links de compartición
- [ ] Notificaciones de compartición
- [ ] Revocación de permisos

### Fase 10: Features Adicionales (Semana 10)
- [ ] Export a PNG (svg-to-png)
- [ ] Export a SVG nativo
- [ ] Export a JSON
- [ ] Templates de boards
- [ ] Comentarios en elementos
- [ ] Modo presentación
- [ ] Búsqueda de boards

### Fase 11: Optimización y Testing (Semana 11)
- [ ] Virtualización de elementos (solo renderizar visibles)
- [ ] Compresión de mensajes WebSocket
- [ ] Lazy loading de boards
- [ ] Caché de cálculos complejos
- [ ] Performance profiling
- [ ] Tests E2E completos
- [ ] Tests de carga con múltiples usuarios

### Fase 12: Documentación y Deploy (Semana 12)
- [ ] Documentación de API
- [ ] Guía de usuario
- [ ] Video tutorial
- [ ] Changelog
- [ ] Deploy a staging
- [ ] QA completo
- [ ] Deploy a producción

---

## 🔍 Consideraciones Técnicas

### Performance

1. **SVG Rendering**:
   - Usar `will-change` CSS para elementos en movimiento
   - Implementar virtualización para boards con >1000 elementos
   - Cachear cálculos de paths complejos (especialmente freedraw)
   - Usar `transform` CSS en lugar de modificar atributos directamente
   - Debounce de re-renders durante interacciones

2. **WebSocket**:
   - Throttle de eventos de cursor (max 60fps / 16ms)
   - Debounce de guardado automático (cada 3 segundos de inactividad)
   - Compresión de payloads grandes con gzip
   - Batch de operaciones múltiples en una sola transmisión

3. **Memoria**:
   - Limitar número de elementos por board (5,000 recomendado)
   - Limitar historial de undo/redo (100 comandos)
   - Cleanup de elementos eliminados del DOM
   - Garbage collection de event listeners

4. **Command Pattern**:
   - Compactar comandos similares consecutivos (ej: múltiples moves)
   - Limpiar historial al cambiar de board
   - Serializar comandos para persistencia opcional

### Escalabilidad

1. **Número de Colaboradores**:
   - Límite recomendado: 10-15 usuarios simultáneos con edición activa
   - Implementar "viewer mode" para más usuarios (solo lectura, cursor opcional)
   - Considerar throttling de updates basado en número de usuarios

2. **Tamaño de Boards**:
   - Límite de SVG viewBox: 100,000 x 100,000 unidades
   - Compresión de contenido cifrado con gzip
   - Lazy loading de imágenes embebidas
   - Paginación o infinite scroll para lista de boards

3. **WebSocket Connections**:
   - Usar Redis Adapter para escalado horizontal con múltiples instancias
   - Heartbeat cada 30 segundos para detectar conexiones muertas
   - Reconexión automática en frontend con exponential backoff
   - Queue de acciones pendientes durante desconexión

### Seguridad

1. **Autenticación**:
   - JWT en handshake de WebSocket
   - Verificar permisos en cada acción de escritura
   - Rate limiting por usuario (max 100 acciones/minuto)
   - Validar ownership antes de delete/share

2. **Cifrado**:
   - Todo el contenido cifrado E2E (AES-256-GCM)
   - Claves nunca se envían al servidor sin cifrar
   - Rotación de claves al revocar permisos de usuario
   - IV único por operación de cifrado

3. **Validación**:
   - Validar estructura de elementos en backend
   - Limitar tamaño de payloads (max 1MB por acción)
   - Sanitizar contenido de texto para prevenir XSS
   - Validar tipos de archivos en imágenes

### SVG vs Canvas - Decisión

**Ventajas de SVG elegido:**
- ✅ Elementos son parte del DOM (fácil event handling)
- ✅ Escalabilidad perfecta sin pérdida de calidad
- ✅ Fácil aplicar estilos y animaciones CSS
- ✅ Accesibilidad mejorada (screen readers)
- ✅ Integración natural con React
- ✅ Exportación a SVG directa

**Desventajas mitigadas:**
- ⚠️ Performance con muchos elementos → Virtualización
- ⚠️ Uso de memoria → Límites y cleanup
- ⚠️ Complejidad de paths → Caching y simplificación

### Extensibilidad del Sistema

**Añadir nuevas herramientas es extremadamente fácil:**

1. Crear clase que extiende `BaseTool`
2. Implementar métodos `onMouseDown`, `onMouseMove`, `onMouseUp`
3. Registrar con `ToolRegistry.register(new MiNuevaHerramienta())`
4. ¡Listo! La herramienta aparece automáticamente en el toolbar

**Ejemplo de extensión rápida:**
```typescript
// Añadir una herramienta de estrella toma < 100 líneas
class StarTool extends BaseTool {
  // ... implementación ...
}
ToolRegistry.register(new StarTool());
```

**Sistema de comandos permite:**
- Undo/Redo automático para cualquier acción
- Sincronización WebSocket transparente
- Historial completo de cambios
- Macros y automatización futura

---

## 📱 Responsive Design

- **Desktop**: Full canvas con todas las herramientas
- **Tablet**: Canvas adaptativo, toolbar flotante
- **Mobile**: Canvas táctil, herramientas en menú drawer

---

## ⌨️ Keyboard Shortcuts

### Navegación y Selección
| Shortcut | Acción |
|----------|--------|
| `Space` + Click + Drag | Panning (mover viewport) |
| `Ctrl/Cmd` + `A` | Seleccionar todo |
| `Esc` | Deseleccionar todo |
| `Tab` | Seleccionar siguiente elemento |
| `Shift` + `Tab` | Seleccionar elemento anterior |

### Edición
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `Z` | Undo |
| `Ctrl/Cmd` + `Shift` + `Z` | Redo |
| `Ctrl/Cmd` + `Y` | Redo (alternativo) |
| `Ctrl/Cmd` + `C` | Copiar elemento(s) |
| `Ctrl/Cmd` + `X` | Cortar elemento(s) |
| `Ctrl/Cmd` + `V` | Pegar elemento(s) |
| `Ctrl/Cmd` + `D` | Duplicar elemento(s) |
| `Delete` / `Backspace` | Eliminar elemento(s) |

### Organización de Capas (Z-Index)
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `Shift` + `]` | Traer al frente (front) |
| `Ctrl/Cmd` + `]` | Traer hacia adelante (forward) |
| `Ctrl/Cmd` + `[` | Enviar hacia atrás (backward) |
| `Ctrl/Cmd` + `Shift` + `[` | Enviar al fondo (back) |

### Agrupación
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `G` | Agrupar elementos seleccionados |
| `Ctrl/Cmd` + `Shift` + `G` | Desagrupar |

### Bloqueo
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `L` | Bloquear/Desbloquear elemento(s) |

### Herramientas
| Shortcut | Herramienta |
|----------|-------------|
| `V` | Selección |
| `R` | Rectángulo |
| `O` | Círculo/Elipse |
| `D` | Diamante |
| `L` | Línea |
| `A` | Flecha |
| `T` | Texto |
| `P` | Lápiz (Free Draw) |
| `H` | Mano (Pan Tool) |

### Viewport
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `+` | Zoom in |
| `Ctrl/Cmd` + `-` | Zoom out |
| `Ctrl/Cmd` + `0` | Reset zoom (100%) |
| `Ctrl/Cmd` + `1` | Fit to screen |

### Otros
| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd` + `S` | Guardar cambios |
| `Ctrl/Cmd` + `E` | Exportar |
| `Ctrl/Cmd` + `/` | Mostrar shortcuts |
| `F11` | Modo pantalla completa |

---

## 🎨 UI/UX Considerations

1. **Onboarding**:
   - Tutorial interactivo en primer uso
   - Templates de ejemplo
   - Tooltips contextuales

2. **Feedback Visual**:
   - Animaciones de entrada/salida de usuarios
   - Loading states para operaciones lentas
   - Toast notifications para eventos importantes

3. **Accesibilidad**:
   - Keyboard shortcuts completos
   - Alto contraste disponible
   - Screen reader para elementos de texto

---

## 🔮 Futuras Mejoras (Roadmap)

1. **v2.0**:
   - Voice/Video chat integrado
   - AI assistant para diseño
   - Plugins y extensiones

2. **v3.0**:
   - Versioning completo (Git-like)
   - Móvil native apps
   - Offline mode con sync

3. **v4.0**:
   - 3D canvas
   - VR collaboration
   - Real-time translation

---

## 📚 Referencias

- [Excalidraw](https://github.com/excalidraw/excalidraw)
- [tldraw](https://github.com/tldraw/tldraw)
- [Socket.io Documentation](https://socket.io/docs/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Perfect Freehand](https://github.com/steveruizok/perfect-freehand)

---

## ✅ Checklist de Preparación

Antes de empezar la implementación:

- [ ] **Revisar y aprobar este documento**
- [ ] **Confirmar decisiones arquitectónicas:**
  - [x] Usar SVG en lugar de Canvas HTML5
  - [x] Implementar patrón Command para todas las acciones
  - [x] Implementar patrón Factory para creación de elementos
  - [x] Reutilizar SharedConfig para permisos
- [ ] **Definir límites de uso:**
  - [ ] Máx. usuarios simultáneos por board: 10-15 editores activos
  - [ ] Máx. elementos por board: 5,000
  - [ ] Máx. tamaño de historial undo/redo: 100 comandos
  - [ ] Máx. payload por acción WebSocket: 1MB
- [ ] **Configurar entorno de desarrollo:**
  - [ ] WebSocket server en desarrollo (localhost:3000/board)
  - [ ] Variables de entorno para WebSocket URL
  - [ ] Redis (opcional, para escalado horizontal)
- [ ] **Preparar diseños de UI:**
  - [ ] Mockups de BoardView
  - [ ] Diseño de toolbar y herramientas
  - [ ] Paleta de colores para colaboradores
  - [ ] Iconos para cada tipo de elemento
- [ ] **Estimar recursos:**
  - [ ] Tiempo: 12 semanas para implementación completa
  - [ ] Desarrolladores: 2-3 developers
  - [ ] Designer: 1 UI/UX designer (primeras 2 semanas)
- [ ] **Definir métricas de éxito:**
  - [ ] Latencia WebSocket < 50ms
  - [ ] Tiempo de carga de board < 2s
  - [ ] Soporte para 10 usuarios sin lag
  - [ ] Tasa de sincronización > 99%
  - [ ] Uptime > 99.9%

---

**Fecha de Creación**: 2025-10-13  
**Última Actualización**: 2025-10-13  
**Estado**: 📋 Planificación Completa  
**Versión**: 2.0 - Arquitectura con Command Pattern, Factory Pattern y SVG

---

## 🤖 Integración con Mermaid

### Resumen

El Board incluirá dos formas de trabajar con diagramas Mermaid:

1. **Mermaid → Board**: Importar código Mermaid existente y convertirlo en elementos editables
2. **IA → Mermaid → Board**: Describir en lenguaje natural y generar el diagrama automáticamente

### Arquitectura de la Integración

```
┌─────────────────┐
│  User Input     │
│  (Text/Mermaid) │
└────────┬────────┘
         │
    ┌────┴────┐
    │   IA?   │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
┌───▼────┐         ┌─────▼──────┐
│ Direct │         │ AI Service │
│ Mermaid│         │ (OpenAI)   │
└───┬────┘         └─────┬──────┘
    │                    │
    │              ┌─────▼──────┐
    │              │  Mermaid   │
    │              │   Code     │
    │              └─────┬──────┘
    │                    │
    └────────┬───────────┘
             │
      ┌──────▼───────┐
      │   Mermaid    │
      │   Parser     │
      └──────┬───────┘
             │
      ┌──────▼───────┐
      │ Board Factory│
      │  Converter   │
      └──────┬───────┘
             │
      ┌──────▼───────┐
      │   Board      │
      │  Elements    │
      └──────────────┘
```

---

## 📝 1. Importación Directa de Mermaid

### 1.1 MermaidParser Service

```typescript
// frontend/src/services/board/MermaidParser.ts

export interface MermaidNode {
  id: string;
  label: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'rounded' | 'hexagon';
}

export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
  type: 'solid' | 'dashed' | 'dotted';
  arrowType: 'normal' | 'open' | 'none';
}

export interface MermaidDiagram {
  type: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt' | 'pie';
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  nodes: MermaidNode[];
  edges: MermaidEdge[];
}

export class MermaidParser {
  /**
   * Parsea código Mermaid y extrae la estructura
   */
  static parse(mermaidCode: string): MermaidDiagram {
    const lines = mermaidCode.trim().split('\n');
    const firstLine = lines[0].trim();
    
    // Detectar tipo de diagrama
    const type = this.detectDiagramType(firstLine);
    const direction = this.extractDirection(firstLine);
    
    // Parsear nodos y conexiones
    const nodes: MermaidNode[] = [];
    const edges: MermaidEdge[] = [];
    const nodeMap = new Map<string, MermaidNode>();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue; // Ignorar comentarios
      
      if (line.includes('-->') || line.includes('---') || line.includes('-.->')) {
        // Es una conexión
        const edge = this.parseEdge(line, nodeMap);
        if (edge) edges.push(edge);
      } else if (line.includes('[') || line.includes('(') || line.includes('{')) {
        // Es un nodo
        const node = this.parseNode(line);
        if (node) {
          nodes.push(node);
          nodeMap.set(node.id, node);
        }
      }
    }
    
    return { type, direction, nodes, edges };
  }
  
  /**
   * Detecta el tipo de diagrama Mermaid
   */
  private static detectDiagramType(firstLine: string): MermaidDiagram['type'] {
    const lower = firstLine.toLowerCase();
    if (lower.includes('flowchart') || lower.includes('graph')) return 'flowchart';
    if (lower.includes('sequencediagram')) return 'sequence';
    if (lower.includes('classdiagram')) return 'class';
    if (lower.includes('statediagram')) return 'state';
    if (lower.includes('erdiagram')) return 'er';
    if (lower.includes('gantt')) return 'gantt';
    if (lower.includes('pie')) return 'pie';
    return 'flowchart';
  }
  
  /**
   * Extrae la dirección del diagrama
   */
  private static extractDirection(firstLine: string): MermaidDiagram['direction'] {
    if (firstLine.includes('TB') || firstLine.includes('TD')) return 'TB';
    if (firstLine.includes('LR')) return 'LR';
    if (firstLine.includes('BT')) return 'BT';
    if (firstLine.includes('RL')) return 'RL';
    return 'TB'; // Default
  }
  
  /**
   * Parsea un nodo de Mermaid
   */
  private static parseNode(line: string): MermaidNode | null {
    // Ejemplos:
    // A[Rectangle]
    // B(Rounded)
    // C([Stadium])
    // D[[Subroutine]]
    // E[(Database)]
    // F((Circle))
    // G{Diamond}
    // H{{Hexagon}}
    
    const patterns = [
      { regex: /(\w+)\[([^\]]+)\]/, type: 'rectangle' as const },
      { regex: /(\w+)\(([^)]+)\)/, type: 'rounded' as const },
      { regex: /(\w+)\(\[([^\]]+)\]\)/, type: 'rounded' as const },
      { regex: /(\w+)\[\[([^\]]+)\]\]/, type: 'rectangle' as const },
      { regex: /(\w+)\[\(([^)]+)\)\]/, type: 'circle' as const },
      { regex: /(\w+)\(\(([^)]+)\)\)/, type: 'circle' as const },
      { regex: /(\w+)\{([^}]+)\}/, type: 'diamond' as const },
      { regex: /(\w+)\{\{([^}]+)\}\}/, type: 'hexagon' as const },
    ];
    
    for (const { regex, type } of patterns) {
      const match = line.match(regex);
      if (match) {
        return {
          id: match[1],
          label: match[2],
          type,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Parsea una conexión de Mermaid
   */
  private static parseEdge(
    line: string,
    nodeMap: Map<string, MermaidNode>
  ): MermaidEdge | null {
    // Ejemplos:
    // A --> B
    // A -->|Label| B
    // A -.-> B
    // A === B
    
    const arrowPatterns = [
      { regex: /(\w+)\s*-->\s*\|([^|]+)\|\s*(\w+)/, type: 'solid' as const, arrow: 'normal' as const },
      { regex: /(\w+)\s*-->\s*(\w+)/, type: 'solid' as const, arrow: 'normal' as const },
      { regex: /(\w+)\s*---\s*(\w+)/, type: 'solid' as const, arrow: 'none' as const },
      { regex: /(\w+)\s*-\.->\s*(\w+)/, type: 'dashed' as const, arrow: 'normal' as const },
      { regex: /(\w+)\s*===\s*(\w+)/, type: 'solid' as const, arrow: 'none' as const },
      { regex: /(\w+)\s*--\s*\|([^|]+)\|\s*-->\s*(\w+)/, type: 'solid' as const, arrow: 'normal' as const },
    ];
    
    for (const { regex, type, arrow } of arrowPatterns) {
      const match = line.match(regex);
      if (match) {
        const from = match[1];
        const to = match[match.length - 1];
        const label = match.length > 3 ? match[2] : undefined;
        
        // Crear nodos si no existen
        if (!nodeMap.has(from)) {
          const node: MermaidNode = { id: from, label: from, type: 'rectangle' };
          nodeMap.set(from, node);
        }
        if (!nodeMap.has(to)) {
          const node: MermaidNode = { id: to, label: to, type: 'rectangle' };
          nodeMap.set(to, node);
        }
        
        return {
          from,
          to,
          label,
          type,
          arrowType: arrow,
        };
      }
    }
    
    return null;
  }
}
```

### 1.2 MermaidConverter - Mermaid a Board Elements

```typescript
// frontend/src/services/board/MermaidConverter.ts

export class MermaidConverter {
  /**
   * Convierte un diagrama Mermaid parseado en elementos del Board
   */
  static toBoard Elements(
    diagram: MermaidDiagram,
    startX: number = 100,
    startY: number = 100
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    const nodePositions = this.calculateLayout(diagram, startX, startY);
    
    // Crear elementos para nodos
    diagram.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      const element = this.createNodeElement(node, pos.x, pos.y);
      elements.push(element);
    });
    
    // Crear elementos para conexiones
    diagram.edges.forEach(edge => {
      const fromPos = nodePositions.get(edge.from);
      const toPos = nodePositions.get(edge.to);
      if (!fromPos || !toPos) return;
      
      const element = this.createEdgeElement(edge, fromPos, toPos);
      elements.push(element);
      
      // Crear label si existe
      if (edge.label) {
        const labelElement = this.createEdgeLabel(edge, fromPos, toPos);
        elements.push(labelElement);
      }
    });
    
    return elements;
  }
  
  /**
   * Calcula el layout automático de los nodos
   */
  private static calculateLayout(
    diagram: MermaidDiagram,
    startX: number,
    startY: number
  ): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalGap = 150;
    const verticalGap = 100;
    
    // Algoritmo simple de layout por niveles
    const levels = this.calculateLevels(diagram);
    
    levels.forEach((nodeIds, level) => {
      const levelWidth = nodeIds.length * (nodeWidth + horizontalGap);
      const startXLevel = startX - levelWidth / 2;
      
      nodeIds.forEach((nodeId, index) => {
        const x = startXLevel + index * (nodeWidth + horizontalGap);
        const y = startY + level * (nodeHeight + verticalGap);
        positions.set(nodeId, { x, y });
      });
    });
    
    return positions;
  }
  
  /**
   * Calcula niveles de nodos para layout jerárquico
   */
  private static calculateLevels(diagram: MermaidDiagram): Map<number, string[]> {
    const levels = new Map<number, string[]>();
    const nodeLevel = new Map<string, number>();
    const visited = new Set<string>();
    
    // Encontrar nodos raíz (sin incoming edges)
    const incomingCount = new Map<string, number>();
    diagram.nodes.forEach(node => incomingCount.set(node.id, 0));
    diagram.edges.forEach(edge => {
      incomingCount.set(edge.to, (incomingCount.get(edge.to) || 0) + 1);
    });
    
    const roots = diagram.nodes.filter(node => incomingCount.get(node.id) === 0);
    
    // BFS para asignar niveles
    const queue: Array<{ id: string; level: number }> = [];
    roots.forEach(root => {
      queue.push({ id: root.id, level: 0 });
      nodeLevel.set(root.id, 0);
    });
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      
      if (!levels.has(level)) levels.set(level, []);
      levels.get(level)!.push(id);
      
      // Añadir hijos al queue
      diagram.edges
        .filter(edge => edge.from === id)
        .forEach(edge => {
          if (!visited.has(edge.to)) {
            const childLevel = level + 1;
            nodeLevel.set(edge.to, Math.max(nodeLevel.get(edge.to) || 0, childLevel));
            queue.push({ id: edge.to, level: childLevel });
          }
        });
    }
    
    // Añadir nodos no visitados (disconnected)
    diagram.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const maxLevel = Math.max(...Array.from(levels.keys()));
        const nextLevel = maxLevel + 1;
        if (!levels.has(nextLevel)) levels.set(nextLevel, []);
        levels.get(nextLevel)!.push(node.id);
      }
    });
    
    return levels;
  }
  
  /**
   * Crea un elemento del board para un nodo Mermaid
   */
  private static createNodeElement(
    node: MermaidNode,
    x: number,
    y: number
  ): BoardElement {
    const width = 200;
    const height = 80;
    
    switch (node.type) {
      case 'rectangle':
        return BoardFactory.createRectangle(x, y, width, height, {
          strokeColor: '#1e40af',
          backgroundColor: '#dbeafe',
          strokeWidth: 2,
        });
        
      case 'rounded':
        return BoardFactory.createRectangle(x, y, width, height, {
          strokeColor: '#15803d',
          backgroundColor: '#dcfce7',
          strokeWidth: 2,
          // TODO: Añadir border-radius en el futuro
        });
        
      case 'circle':
        return BoardFactory.createEllipse(x, y, width, width, {
          strokeColor: '#9333ea',
          backgroundColor: '#f3e8ff',
          strokeWidth: 2,
        });
        
      case 'diamond':
        return BoardFactory.createDiamond(x, y, width, height, {
          strokeColor: '#c2410c',
          backgroundColor: '#ffedd5',
          strokeWidth: 2,
        });
        
      case 'hexagon':
        // TODO: Implementar hexágono custom
        return BoardFactory.createRectangle(x, y, width, height, {
          strokeColor: '#0891b2',
          backgroundColor: '#cffafe',
          strokeWidth: 2,
        });
        
      default:
        return BoardFactory.createRectangle(x, y, width, height);
    }
  }
  
  /**
   * Crea un elemento de flecha para una conexión
   */
  private static createEdgeElement(
    edge: MermaidEdge,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number }
  ): BoardElement {
    // Calcular puntos de inicio y fin en los bordes de los nodos
    const startX = fromPos.x + 100; // Centro del nodo
    const startY = fromPos.y + 40;
    const endX = toPos.x + 100;
    const endY = toPos.y + 40;
    
    if (edge.arrowType === 'normal') {
      return BoardFactory.createArrow(startX, startY, endX, endY, {
        strokeColor: '#475569',
        strokeWidth: 2,
        // TODO: Añadir dash pattern para dashed/dotted
      });
    } else {
      return BoardFactory.createLine(startX, startY, endX, endY, {
        strokeColor: '#475569',
        strokeWidth: 2,
      });
    }
  }
  
  /**
   * Crea un elemento de texto para el label de una conexión
   */
  private static createEdgeLabel(
    edge: MermaidEdge,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number }
  ): BoardElement {
    const midX = (fromPos.x + toPos.x) / 2 + 100;
    const midY = (fromPos.y + toPos.y) / 2 + 40;
    
    return BoardFactory.createText(midX - 50, midY - 10, edge.label!, {
      fontSize: 14,
      strokeColor: '#1e293b',
      backgroundColor: '#ffffff',
    });
  }
}
```

### 1.3 Componente de Importación Mermaid

```typescript
// frontend/src/components/board/MermaidImportModal.tsx

export const MermaidImportModal: React.FC<MermaidImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [mermaidCode, setMermaidCode] = useState('');
  const [preview, setPreview] = useState<MermaidDiagram | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleParse = () => {
    try {
      const diagram = MermaidParser.parse(mermaidCode);
      setPreview(diagram);
      setError(null);
    } catch (err) {
      setError('Error parsing Mermaid code: ' + (err as Error).message);
      setPreview(null);
    }
  };
  
  const handleImport = () => {
    if (!preview) return;
    
    const elements = MermaidConverter.toBoardElements(preview, 100, 100);
    
    // Crear comando batch para todos los elementos
    elements.forEach(element => {
      const command = new CreateElementCommand(
        element,
        getElements(),
        sendWebSocketAction
      );
      commandInvoker.executeCommand(command);
    });
    
    onImport(elements);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>Import Mermaid Diagram</ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          {/* Textarea para código Mermaid */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mermaid Code
            </label>
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder={`flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`}
              className="w-full h-64 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
            />
          </div>
          
          {/* Botón de parse */}
          <button
            onClick={handleParse}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Parse & Preview
          </button>
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded">
              <p className="text-sm text-error-600 dark:text-error-400">
                {error}
              </p>
            </div>
          )}
          
          {/* Preview */}
          {preview && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {preview.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Nodes:</span> {preview.nodes.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Edges:</span> {preview.edges.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!preview}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import to Board
        </button>
      </ModalFooter>
    </Modal>
  );
};
```

---

## 🤖 2. Generación con IA (Texto → Mermaid → Board)

### 2.1 AI Service para Generación de Mermaid

```typescript
// frontend/src/services/ai/MermaidAIService.ts

export interface AIGenerationRequest {
  prompt: string;
  diagramType?: 'flowchart' | 'sequence' | 'class' | 'state' | 'er';
  additionalContext?: string;
}

export interface AIGenerationResponse {
  mermaidCode: string;
  explanation: string;
  confidence: number;
}

export class MermaidAIService {
  private static readonly API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3000/api/ai';
  
  /**
   * Genera código Mermaid usando IA
   */
  static async generateMermaid(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    try {
      const response = await fetch(`${this.API_URL}/generate-mermaid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating Mermaid with AI:', error);
      throw error;
    }
  }
  
  /**
   * Mejora un diagrama Mermaid existente con IA
   */
  static async improveDiagram(
    mermaidCode: string,
    improvement: string
  ): Promise<AIGenerationResponse> {
    try {
      const response = await fetch(`${this.API_URL}/improve-mermaid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          mermaidCode,
          improvement,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error improving Mermaid with AI:', error);
      throw error;
    }
  }
}
```

### 2.2 Backend - AI Controller

```typescript
// api/src/ai/ai.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}
  
  @Post('generate-mermaid')
  async generateMermaid(
    @Body() request: { prompt: string; diagramType?: string; additionalContext?: string }
  ) {
    return await this.aiService.generateMermaidFromPrompt(request);
  }
  
  @Post('improve-mermaid')
  async improveMermaid(
    @Body() request: { mermaidCode: string; improvement: string }
  ) {
    return await this.aiService.improveMermaidDiagram(request);
  }
}
```

### 2.3 Backend - AI Service

```typescript
// api/src/ai/ai.service.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateMermaidFromPrompt(request: {
    prompt: string;
    diagramType?: string;
    additionalContext?: string;
  }) {
    const systemPrompt = `You are an expert at creating Mermaid diagrams. 
Generate ONLY valid Mermaid code based on the user's description.
Do not include explanations, markdown code blocks, or any other text.
Output should start directly with the diagram type (e.g., "flowchart TD" or "sequenceDiagram").

Supported diagram types:
- flowchart (TD, LR, BT, RL)
- sequenceDiagram
- classDiagram
- stateDiagram-v2
- erDiagram

Use clear, descriptive node labels and ensure all connections are valid.`;
    
    const userPrompt = `${request.diagramType ? `Create a ${request.diagramType}. ` : ''}${request.prompt}${request.additionalContext ? `\n\nAdditional context: ${request.additionalContext}` : ''}`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      const mermaidCode = completion.choices[0].message.content.trim();
      
      // Generar explicación
      const explanationCompletion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Explain this Mermaid diagram in 2-3 sentences.',
          },
          { role: 'user', content: mermaidCode },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });
      
      const explanation = explanationCompletion.choices[0].message.content.trim();
      
      return {
        mermaidCode,
        explanation,
        confidence: 0.9, // Simplified, could be calculated
      };
    } catch (error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
  
  async improveMermaidDiagram(request: {
    mermaidCode: string;
    improvement: string;
  }) {
    const systemPrompt = `You are an expert at improving Mermaid diagrams.
Given an existing Mermaid diagram and improvement instructions, generate an improved version.
Output ONLY the improved Mermaid code, no explanations or markdown.`;
    
    const userPrompt = `Current diagram:\n${request.mermaidCode}\n\nImprovement needed: ${request.improvement}`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      const mermaidCode = completion.choices[0].message.content.trim();
      
      return {
        mermaidCode,
        explanation: `Improved: ${request.improvement}`,
        confidence: 0.85,
      };
    } catch (error) {
      throw new Error(`AI improvement failed: ${error.message}`);
    }
  }
}
```

### 2.4 Componente de Generación con IA

```typescript
// frontend/src/components/board/AIGenerateModal.tsx

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState<string>('flowchart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await MermaidAIService.generateMermaid({
        prompt,
        diagramType: diagramType as any,
      });
      
      setResult(response);
    } catch (err) {
      setError('Failed to generate diagram: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleImport = () => {
    if (!result) return;
    
    try {
      const diagram = MermaidParser.parse(result.mermaidCode);
      const elements = MermaidConverter.toBoardElements(diagram, 100, 100);
      
      elements.forEach(element => {
        const command = new CreateElementCommand(
          element,
          getElements(),
          sendWebSocketAction
        );
        commandInvoker.executeCommand(command);
      });
      
      onGenerate(elements);
      onClose();
    } catch (err) {
      setError('Failed to import diagram: ' + (err as Error).message);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          Generate Diagram with AI
        </div>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          {/* Tipo de diagrama */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Diagram Type
            </label>
            <select
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
            >
              <option value="flowchart">Flowchart</option>
              <option value="sequence">Sequence Diagram</option>
              <option value="class">Class Diagram</option>
              <option value="state">State Diagram</option>
              <option value="er">Entity Relationship</option>
            </select>
          </div>
          
          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your diagram
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a flowchart for a user login process with OAuth authentication, including error handling and session management"
              className="w-full h-32 p-3 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
            />
          </div>
          
          {/* Botón generar */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </button>
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded">
              <p className="text-sm text-error-600 dark:text-error-400">
                {error}
              </p>
            </div>
          )}
          
          {/* Resultado */}
          {result && (
            <div className="space-y-3">
              <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded">
                <p className="text-sm text-success-600 dark:text-success-400 mb-2">
                  <strong>Generated successfully!</strong>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {result.explanation}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Generated Mermaid Code
                </label>
                <pre className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded overflow-x-auto text-xs font-mono">
                  {result.mermaidCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          Cancel
        </button>
        {result && (
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Import to Board
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
};
```

### 2.5 Integración en BoardToolbar

```typescript
// Añadir al BoardToolbar.tsx

<div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-4">
  <button
    onClick={() => setShowMermaidImport(true)}
    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-2"
    title="Import Mermaid"
  >
    <FileCode className="h-4 w-4" />
    Import Mermaid
  </button>
  
  <button
    onClick={() => setShowAIGenerate(true)}
    className="px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 rounded flex items-center gap-2"
    title="Generate with AI"
  >
    <Sparkles className="h-4 w-4" />
    AI Generate
  </button>
</div>

{showMermaidImport && (
  <MermaidImportModal
    isOpen={showMermaidImport}
    onClose={() => setShowMermaidImport(false)}
    onImport={handleMermaidImport}
  />
)}

{showAIGenerate && (
  <AIGenerateModal
    isOpen={showAIGenerate}
    onClose={() => setShowAIGenerate(false)}
    onGenerate={handleAIGenerate}
  />
)}
```

---

## 📦 Dependencias Adicionales

### Backend
```json
{
  "dependencies": {
    "openai": "^4.20.0"
  }
}
```

```bash
cd api
npm install openai
```

### Frontend
```json
{
  "dependencies": {
    "lucide-react": "latest"  // Para iconos Sparkles, FileCode, etc.
  }
}
```

### Variables de Entorno

```env
# api/.env
OPENAI_API_KEY=sk-...your-key-here
```

```env
# frontend/.env
VITE_AI_API_URL=http://localhost:3000/api/ai
```

---

## 🚀 Plan de Implementación - Integración Mermaid

### Fase Extra: Integración Mermaid (2 semanas)

#### Semana 1: Importación Directa
- [ ] **Day 1-2**: Implementar `MermaidParser.ts`
  - [ ] Parser de flowcharts
  - [ ] Parser de sequence diagrams
  - [ ] Tests unitarios del parser
- [ ] **Day 3-4**: Implementar `MermaidConverter.ts`
  - [ ] Algoritmo de layout automático
  - [ ] Conversión de nodos a elementos
  - [ ] Conversión de edges a flechas
  - [ ] Tests de conversión
- [ ] **Day 5**: Implementar `MermaidImportModal.tsx`
  - [ ] UI del modal
  - [ ] Preview del diagrama
  - [ ] Integración con BoardToolbar

#### Semana 2: Generación con IA
- [ ] **Day 1-2**: Backend AI Service
  - [ ] Crear módulo `ai/`
  - [ ] Implementar `AIController`
  - [ ] Implementar `AIService` con OpenAI
  - [ ] Tests de integración
- [ ] **Day 3-4**: Frontend AI Integration
  - [ ] Implementar `MermaidAIService.ts`
  - [ ] Crear `AIGenerateModal.tsx`
  - [ ] Sistema de prompts optimizado
  - [ ] Manejo de errores
- [ ] **Day 5**: Testing y Refinamiento
  - [ ] Tests E2E completos
  - [ ] Optimización de prompts
  - [ ] UI/UX improvements
  - [ ] Documentación

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Importación Directa

```typescript
const mermaidCode = `
flowchart TD
    A[Start] --> B{Is user logged in?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login]
    D --> E[Authenticate]
    E --> F{Success?}
    F -->|Yes| C
    F -->|No| D
`;

// El usuario pega esto en el modal y hace clic en "Import"
// Se generan automáticamente 8 elementos en el board
```

### Ejemplo 2: Generación con IA

```typescript
const prompt = "Create a flowchart for an e-commerce checkout process including cart review, payment, and order confirmation";

// IA genera:
const generatedMermaid = `
flowchart TD
    A[Cart Review] --> B{Items in cart?}
    B -->|Yes| C[Enter Shipping Info]
    B -->|No| D[Browse Products]
    C --> E[Select Payment Method]
    E --> F[Process Payment]
    F --> G{Payment Successful?}
    G -->|Yes| H[Order Confirmation]
    G -->|No| I[Show Error]
    I --> E
    H --> J[Send Email]
`;

// Se convierte automáticamente a elementos del board
```

---

**Última Actualización**: 2025-10-13  
**Estado**: 📋 Integración Mermaid Especificada  
**Versión**: 2.1 - Con Integración Mermaid (Direct + AI)
