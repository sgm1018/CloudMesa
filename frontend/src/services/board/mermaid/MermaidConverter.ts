/**
 * MermaidConverter.ts
 * 
 * Convierte AST de Mermaid a BoardElements con layout automático.
 * Implementa algoritmos de posicionamiento específicos para cada tipo de diagrama.
 */

import { MermaidAST, MermaidNode, MermaidConnection } from './MermaidParser';
import { BoardElement } from '../../../types/board.types';

export interface ConversionOptions {
  startX?: number;
  startY?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  defaultStrokeColor?: string;
  defaultBackgroundColor?: string;
  defaultStrokeWidth?: number;
}

interface Position {
  x: number;
  y: number;
}

interface LayoutResult {
  positions: Map<string, Position>;
  width: number;
  height: number;
}

export class MermaidConverter {
  private static defaultOptions: Required<ConversionOptions> = {
    startX: 100,
    startY: 100,
    nodeWidth: 150,
    nodeHeight: 80,
    horizontalSpacing: 200,
    verticalSpacing: 120,
    defaultStrokeColor: '#000000',
    defaultBackgroundColor: '#ffffff',
    defaultStrokeWidth: 2,
  };

  /**
   * Convierte AST de Mermaid a BoardElements
   */
  static convert(ast: MermaidAST, options: ConversionOptions = {}): BoardElement[] {
    const opts = { ...this.defaultOptions, ...options };

    switch (ast.type) {
      case 'flowchart':
        return this.convertFlowchart(ast, opts);
      case 'sequence':
        return this.convertSequence(ast, opts);
      case 'class':
        return this.convertClass(ast, opts);
      case 'state':
        return this.convertState(ast, opts);
      case 'er':
        return this.convertER(ast, opts);
      default:
        throw new Error(`Unsupported diagram type: ${ast.type}`);
    }
  }

  /**
   * Convierte Flowchart con layout jerárquico
   */
  private static convertFlowchart(
    ast: MermaidAST,
    options: Required<ConversionOptions>
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    const layout = this.layoutFlowchart(ast.nodes, ast.connections, options);

    // Crear nodos
    ast.nodes.forEach((node) => {
      const pos = layout.positions.get(node.id);
      if (!pos) return;

      const element = this.createNodeElement(node, pos, options);
      elements.push(element);
    });

    // Crear conexiones
    ast.connections.forEach((conn) => {
      const fromPos = layout.positions.get(conn.from);
      const toPos = layout.positions.get(conn.to);
      if (!fromPos || !toPos) return;

      const element = this.createConnectionElement(
        conn,
        fromPos,
        toPos,
        options
      );
      elements.push(element);
    });

    return elements;
  }

  /**
   * Layout jerárquico para flowcharts (top-down)
   */
  private static layoutFlowchart(
    nodes: MermaidNode[],
    connections: MermaidConnection[],
    options: Required<ConversionOptions>
  ): LayoutResult {
    const positions = new Map<string, Position>();
    const levels = this.calculateNodeLevels(nodes, connections);
    const nodesPerLevel = new Map<number, string[]>();

    // Agrupar nodos por nivel
    levels.forEach((level, nodeId) => {
      if (!nodesPerLevel.has(level)) {
        nodesPerLevel.set(level, []);
      }
      nodesPerLevel.get(level)!.push(nodeId);
    });

    // Posicionar nodos nivel por nivel
    let maxWidth = 0;
    nodesPerLevel.forEach((nodeIds, level) => {
      const levelWidth = nodeIds.length * (options.nodeWidth + options.horizontalSpacing);
      maxWidth = Math.max(maxWidth, levelWidth);

      nodeIds.forEach((nodeId, index) => {
        const x = options.startX + index * (options.nodeWidth + options.horizontalSpacing);
        const y = options.startY + level * (options.nodeHeight + options.verticalSpacing);
        positions.set(nodeId, { x, y });
      });
    });

    const height = nodesPerLevel.size * (options.nodeHeight + options.verticalSpacing);

    return { positions, width: maxWidth, height };
  }

  /**
   * Calcula niveles de profundidad para cada nodo
   */
  private static calculateNodeLevels(
    nodes: MermaidNode[],
    connections: MermaidConnection[]
  ): Map<string, number> {
    const levels = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // Construir grafo de adyacencia
    nodes.forEach((node) => adjacency.set(node.id, []));
    connections.forEach((conn) => {
      if (adjacency.has(conn.from)) {
        adjacency.get(conn.from)!.push(conn.to);
      }
    });

    // Encontrar nodos raíz (sin predecesores)
    const hasIncoming = new Set<string>();
    connections.forEach((conn) => hasIncoming.add(conn.to));
    const roots = nodes.filter((node) => !hasIncoming.has(node.id));

    // BFS para asignar niveles
    const queue: Array<{ id: string; level: number }> = roots.map((node) => ({
      id: node.id,
      level: 0,
    }));

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (!levels.has(id) || levels.get(id)! > level) {
        levels.set(id, level);
        
        const neighbors = adjacency.get(id) || [];
        neighbors.forEach((neighborId) => {
          queue.push({ id: neighborId, level: level + 1 });
        });
      }
    }

    // Asignar nivel 0 a nodos sin nivel (desconectados)
    nodes.forEach((node) => {
      if (!levels.has(node.id)) {
        levels.set(node.id, 0);
      }
    });

    return levels;
  }

  /**
   * Convierte Sequence Diagram con layout vertical
   */
  private static convertSequence(
    ast: MermaidAST,
    options: Required<ConversionOptions>
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    const participants = ast.nodes;

    // Posicionar participantes horizontalmente
    participants.forEach((participant, index) => {
      const x = options.startX + index * (options.nodeWidth + options.horizontalSpacing);
      const y = options.startY;

      const element: BoardElement = {
        id: `node_${participant.id}`,
        type: 'rectangle',
        x,
        y,
        width: options.nodeWidth,
        height: options.nodeHeight,
        stroke: options.defaultStrokeColor,
        fill: options.defaultBackgroundColor,
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        text: participant.label,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
      };
      elements.push(element);

      // Lifeline (línea vertical punteada)
      const lifeline: BoardElement = {
        id: `lifeline_${participant.id}`,
        type: 'line',
        x: x + options.nodeWidth / 2,
        y: y + options.nodeHeight,
        width: 0,
        height: ast.connections.length * 80,
        stroke: '#999999',
        fill: 'transparent',
        strokeWidth: 1,
        opacity: 0.5,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: ast.connections.length * 80 },
        ],
      };
      elements.push(lifeline);
    });

    // Crear mensajes (flechas entre participantes)
    ast.connections.forEach((conn, index) => {
      const fromIndex = participants.findIndex((p) => p.id === conn.from);
      const toIndex = participants.findIndex((p) => p.id === conn.to);

      if (fromIndex === -1 || toIndex === -1) return;

      const fromX = options.startX + fromIndex * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const toX = options.startX + toIndex * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const y = options.startY + options.nodeHeight + (index + 1) * 80;

      const arrow: BoardElement = {
        id: `arrow_${index}`,
        type: conn.type === 'dotted' ? 'line' : 'arrow',
        x: fromX,
        y,
        width: toX - fromX,
        height: 0,
        stroke: options.defaultStrokeColor,
        fill: 'transparent',
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        points: [
          { x: 0, y: 0 },
          { x: toX - fromX, y: 0 },
        ],
      };
      elements.push(arrow);

      // Label del mensaje
      if (conn.label) {
        const labelX = Math.min(fromX, toX) + Math.abs(toX - fromX) / 2;
        const text: BoardElement = {
          id: `label_${index}`,
          type: 'text',
          x: labelX - 50,
          y: y - 20,
          width: 100,
          height: 20,
          stroke: options.defaultStrokeColor,
          fill: 'transparent',
          strokeWidth: 0,
          opacity: 1,
          rotation: 0,
          fillStyle: 'solid',
          createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
          locked: false,
          text: conn.label,
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
        };
        elements.push(text);
      }
    });

    return elements;
  }

  /**
   * Convierte Class Diagram con layout de grid
   */
  private static convertClass(
    ast: MermaidAST,
    options: Required<ConversionOptions>
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    const classesPerRow = Math.ceil(Math.sqrt(ast.nodes.length));

    // Posicionar clases en grid
    ast.nodes.forEach((classNode, index) => {
      const row = Math.floor(index / classesPerRow);
      const col = index % classesPerRow;

      const x = options.startX + col * (options.nodeWidth + options.horizontalSpacing);
      const y = options.startY + row * (options.nodeHeight * 2 + options.verticalSpacing);

      // Calcular altura basada en número de atributos/métodos
      const attributeCount = classNode.attributes?.length || 0;
      const methodCount = classNode.methods?.length || 0;
      const height = Math.max(options.nodeHeight, 40 + (attributeCount + methodCount) * 18);

      const element: BoardElement = {
        id: `class_${classNode.id}`,
        type: 'rectangle',
        x,
        y,
        width: options.nodeWidth,
        height,
        stroke: options.defaultStrokeColor,
        fill: options.defaultBackgroundColor,
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        text: this.formatClassText(classNode),
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
      };
      elements.push(element);
    });

    // Crear relaciones entre clases
    ast.connections.forEach((conn, index) => {
      const fromNode = ast.nodes.find((n) => n.id === conn.from);
      const toNode = ast.nodes.find((n) => n.id === conn.to);
      
      if (!fromNode || !toNode) return;

      const fromIndex = ast.nodes.indexOf(fromNode);
      const toIndex = ast.nodes.indexOf(toNode);

      const fromRow = Math.floor(fromIndex / classesPerRow);
      const fromCol = fromIndex % classesPerRow;
      const toRow = Math.floor(toIndex / classesPerRow);
      const toCol = toIndex % classesPerRow;

      const fromX = options.startX + fromCol * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const fromY = options.startY + fromRow * (options.nodeHeight * 2 + options.verticalSpacing) + options.nodeHeight;
      const toX = options.startX + toCol * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const toY = options.startY + toRow * (options.nodeHeight * 2 + options.verticalSpacing) + options.nodeHeight;

      const arrow: BoardElement = {
        id: `relation_${index}`,
        type: 'arrow',
        x: fromX,
        y: fromY,
        width: toX - fromX,
        height: toY - fromY,
        stroke: options.defaultStrokeColor,
        fill: 'transparent',
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        points: [
          { x: 0, y: 0 },
          { x: toX - fromX, y: toY - fromY },
        ],
      };
      elements.push(arrow);
    });

    return elements;
  }

  /**
   * Convierte State Diagram con layout jerárquico
   */
  private static convertState(
    ast: MermaidAST,
    options: Required<ConversionOptions>
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    
    // Filtrar estados reales (excluir [*])
    const realStates = ast.nodes.filter((node) => node.id !== '[*]');
    const layout = this.layoutFlowchart(realStates, ast.connections, options);

    // Crear estados como rectángulos redondeados
    realStates.forEach((state) => {
      const pos = layout.positions.get(state.id);
      if (!pos) return;

      const element: BoardElement = {
        id: `state_${state.id}`,
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: options.nodeWidth,
        height: options.nodeHeight,
        stroke: options.defaultStrokeColor,
        fill: options.defaultBackgroundColor,
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        text: state.label,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
      };
      elements.push(element);
    });

    // Crear transiciones
    ast.connections.forEach((conn, index) => {
      if (conn.from === '[*]' || conn.to === '[*]') return;

      const fromPos = layout.positions.get(conn.from);
      const toPos = layout.positions.get(conn.to);
      if (!fromPos || !toPos) return;

      const fromX = fromPos.x + options.nodeWidth / 2;
      const fromY = fromPos.y + options.nodeHeight / 2;
      const toX = toPos.x + options.nodeWidth / 2;
      const toY = toPos.y + options.nodeHeight / 2;

      const arrow: BoardElement = {
        id: `transition_${index}`,
        type: 'arrow',
        x: fromX,
        y: fromY,
        width: toX - fromX,
        height: toY - fromY,
        stroke: options.defaultStrokeColor,
        fill: 'transparent',
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        points: [
          { x: 0, y: 0 },
          { x: toX - fromX, y: toY - fromY },
        ],
      };
      elements.push(arrow);

      // Label de transición
      if (conn.label) {
        const labelX = fromX + (toX - fromX) / 2 - 30;
        const labelY = fromY + (toY - fromY) / 2 - 10;

        const text: BoardElement = {
          id: `transition_label_${index}`,
          type: 'text',
          x: labelX,
          y: labelY,
          width: 60,
          height: 20,
          stroke: options.defaultStrokeColor,
          fill: 'transparent',
          strokeWidth: 0,
          opacity: 1,
          rotation: 0,
          fillStyle: 'solid',
          createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
          locked: false,
          text: conn.label,
          fontSize: 11,
          fontFamily: 'Arial, sans-serif',
        };
        elements.push(text);
      }
    });

    return elements;
  }

  /**
   * Convierte ER Diagram con layout de grid
   */
  private static convertER(
    ast: MermaidAST,
    options: Required<ConversionOptions>
  ): BoardElement[] {
    const elements: BoardElement[] = [];
    const entitiesPerRow = Math.ceil(Math.sqrt(ast.nodes.length));

    // Posicionar entidades en grid
    ast.nodes.forEach((entity, index) => {
      const row = Math.floor(index / entitiesPerRow);
      const col = index % entitiesPerRow;

      const x = options.startX + col * (options.nodeWidth + options.horizontalSpacing);
      const y = options.startY + row * (options.nodeHeight + options.verticalSpacing);

      const element: BoardElement = {
        id: `entity_${entity.id}`,
        type: 'rectangle',
        x,
        y,
        width: options.nodeWidth,
        height: options.nodeHeight,
        stroke: options.defaultStrokeColor,
        fill: '#e8f4f8',
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        text: entity.label,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
      };
      elements.push(element);
    });

    // Crear relaciones
    ast.connections.forEach((conn, index) => {
      const fromNode = ast.nodes.find((n) => n.id === conn.from);
      const toNode = ast.nodes.find((n) => n.id === conn.to);
      
      if (!fromNode || !toNode) return;

      const fromIndex = ast.nodes.indexOf(fromNode);
      const toIndex = ast.nodes.indexOf(toNode);

      const fromRow = Math.floor(fromIndex / entitiesPerRow);
      const fromCol = fromIndex % entitiesPerRow;
      const toRow = Math.floor(toIndex / entitiesPerRow);
      const toCol = toIndex % entitiesPerRow;

      const fromX = options.startX + fromCol * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const fromY = options.startY + fromRow * (options.nodeHeight + options.verticalSpacing) + options.nodeHeight / 2;
      const toX = options.startX + toCol * (options.nodeWidth + options.horizontalSpacing) + options.nodeWidth / 2;
      const toY = options.startY + toRow * (options.nodeHeight + options.verticalSpacing) + options.nodeHeight / 2;

      const line: BoardElement = {
        id: `relationship_${index}`,
        type: 'line',
        x: fromX,
        y: fromY,
        width: toX - fromX,
        height: toY - fromY,
        stroke: options.defaultStrokeColor,
        fill: 'transparent',
        strokeWidth: options.defaultStrokeWidth,
        opacity: 1,
        rotation: 0,
        fillStyle: 'solid',
        createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
        locked: false,
        points: [
          { x: 0, y: 0 },
          { x: toX - fromX, y: toY - fromY },
        ],
      };
      elements.push(line);

      // Label de relación
      if (conn.label) {
        const labelX = fromX + (toX - fromX) / 2 - 30;
        const labelY = fromY + (toY - fromY) / 2 - 10;

        const text: BoardElement = {
          id: `relationship_label_${index}`,
          type: 'text',
          x: labelX,
          y: labelY,
          width: 60,
          height: 20,
          stroke: options.defaultStrokeColor,
          fill: '#ffffff',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
          fillStyle: 'solid',
          createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
          locked: false,
          text: conn.label,
          fontSize: 11,
          fontFamily: 'Arial, sans-serif',
        };
        elements.push(text);
      }
    });

    return elements;
  }

  /**
   * Helper: Crea elemento para un nodo
   */
  private static createNodeElement(
    node: MermaidNode,
    position: Position,
    options: Required<ConversionOptions>
  ): BoardElement {
    // Determinar tipo de elemento según la forma
    let type: BoardElement['type'] = 'rectangle';
    if (node.shape === 'circle') type = 'circle';
    if (node.shape === 'diamond') type = 'diamond';

    return {
      id: `node_${node.id}`,
      type,
      x: position.x,
      y: position.y,
      width: options.nodeWidth,
      height: options.nodeHeight,
      stroke: options.defaultStrokeColor,
      fill: options.defaultBackgroundColor,
      strokeWidth: options.defaultStrokeWidth,
      opacity: 1,
      rotation: 0,
      fillStyle: 'solid',
      createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
      locked: false,
      text: node.label,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    };
  }

  /**
   * Helper: Crea elemento para una conexión
   */
  private static createConnectionElement(
    connection: MermaidConnection,
    fromPos: Position,
    toPos: Position,
    options: Required<ConversionOptions>
  ): BoardElement {
    const fromX = fromPos.x + options.nodeWidth / 2;
    const fromY = fromPos.y + options.nodeHeight / 2;
    const toX = toPos.x + options.nodeWidth / 2;
    const toY = toPos.y + options.nodeHeight / 2;

    const type = connection.type === 'arrow' || connection.type === 'thick' ? 'arrow' : 'line';

    return {
      id: `conn_${connection.from}_${connection.to}`,
      type,
      x: fromX,
      y: fromY,
      width: toX - fromX,
      height: toY - fromY,
      stroke: options.defaultStrokeColor,
      fill: 'transparent',
      strokeWidth: connection.type === 'thick' ? options.defaultStrokeWidth * 2 : options.defaultStrokeWidth,
      opacity: connection.type === 'dotted' ? 0.6 : 1,
      rotation: 0,
      fillStyle: 'solid',
      createdBy: 'system', zIndex: 0, createdAt: new Date(), updatedAt: new Date(),
      locked: false,
      points: [
        { x: 0, y: 0 },
        { x: toX - fromX, y: toY - fromY },
      ],
    };
  }

  /**
   * Helper: Formatea texto para clase con atributos y métodos
   */
  private static formatClassText(classNode: MermaidNode): string {
    let text = classNode.label + '\n\n';
    
    if (classNode.attributes && classNode.attributes.length > 0) {
      text += classNode.attributes.join('\n') + '\n\n';
    }
    
    if (classNode.methods && classNode.methods.length > 0) {
      text += classNode.methods.join('\n');
    }
    
    return text.trim();
  }
}
