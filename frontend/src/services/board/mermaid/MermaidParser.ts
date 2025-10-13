/**
 * MermaidParser.ts
 * 
 * Parser para convertir código Mermaid a un AST intermedio.
 * Soporta 5 tipos de diagramas: flowchart, sequence, class, state, er
 */

export type MermaidDiagramType = 'flowchart' | 'sequence' | 'class' | 'state' | 'er';

export interface MermaidNode {
  id: string;
  label: string;
  type: string;
  shape?: 'rectangle' | 'rounded' | 'stadium' | 'circle' | 'diamond' | 'hexagon';
  attributes?: string[];
  methods?: string[];
  participants?: string[];
}

export interface MermaidConnection {
  from: string;
  to: string;
  label?: string;
  type: 'arrow' | 'line' | 'dotted' | 'thick';
  direction?: 'left' | 'right' | 'up' | 'down' | 'bidirectional';
  relationship?: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'one-to-many' | 'many-to-many';
}

export interface MermaidAST {
  type: MermaidDiagramType;
  nodes: MermaidNode[];
  connections: MermaidConnection[];
  metadata?: {
    title?: string;
    direction?: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
  };
}

export class MermaidParser {
  /**
   * Detecta el tipo de diagrama Mermaid
   */
  static detectType(code: string): MermaidDiagramType | null {
    const trimmed = code.trim();
    
    if (trimmed.startsWith('flowchart') || trimmed.startsWith('graph')) {
      return 'flowchart';
    }
    if (trimmed.startsWith('sequenceDiagram')) {
      return 'sequence';
    }
    if (trimmed.startsWith('classDiagram')) {
      return 'class';
    }
    if (trimmed.startsWith('stateDiagram')) {
      return 'state';
    }
    if (trimmed.startsWith('erDiagram')) {
      return 'er';
    }
    
    return null;
  }

  /**
   * Parsea código Mermaid y devuelve AST
   */
  static parse(code: string, explicitType?: MermaidDiagramType): MermaidAST {
    const type = explicitType || this.detectType(code);
    
    if (!type) {
      throw new Error('Unable to detect Mermaid diagram type');
    }

    switch (type) {
      case 'flowchart':
        return this.parseFlowchart(code);
      case 'sequence':
        return this.parseSequence(code);
      case 'class':
        return this.parseClass(code);
      case 'state':
        return this.parseState(code);
      case 'er':
        return this.parseER(code);
      default:
        throw new Error(`Unsupported diagram type: ${type}`);
    }
  }

  /**
   * Parsea Flowchart/Graph
   * Ejemplo:
   * flowchart TD
   *   A[Start] --> B{Decision}
   *   B -->|Yes| C[Action 1]
   *   B -->|No| D[Action 2]
   */
  private static parseFlowchart(code: string): MermaidAST {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    const nodes: MermaidNode[] = [];
    const connections: MermaidConnection[] = [];
    const nodeMap = new Map<string, MermaidNode>();

    // Detectar dirección
    const firstLine = lines[0];
    const directionMatch = firstLine.match(/flowchart|graph\s+(TD|TB|BT|RL|LR)/i);
    const direction = directionMatch ? directionMatch[1] as 'TB' | 'TD' | 'BT' | 'RL' | 'LR' : 'TD';

    // Regex para nodos con diferentes formas
    const nodeShapeRegex = /(\w+)(\[|\(|\{|\(\(|\[\[)([^\]\)\}]+)(\]|\)|\}|\)\)|\]\])/g;
    
    // Regex para conexiones
    const connectionRegex = /(\w+)\s*(-->|---|-\.-|==>)\s*(\|[^|]+\|)?\s*(\w+)/g;

    lines.slice(1).forEach(line => {
      // Extraer nodos
      let match;
      nodeShapeRegex.lastIndex = 0;
      while ((match = nodeShapeRegex.exec(line)) !== null) {
        const [, id, openBracket, label] = match;
        
        if (!nodeMap.has(id)) {
          const shape = this.getFlowchartShape(openBracket);
          const node: MermaidNode = {
            id,
            label: label.trim(),
            type: 'node',
            shape,
          };
          nodes.push(node);
          nodeMap.set(id, node);
        }
      }

      // Extraer conexiones
      connectionRegex.lastIndex = 0;
      while ((match = connectionRegex.exec(line)) !== null) {
        const [, from, arrow, labelMatch, to] = match;
        
        // Asegurar que los nodos existen
        if (!nodeMap.has(from)) {
          const node: MermaidNode = { id: from, label: from, type: 'node', shape: 'rectangle' };
          nodes.push(node);
          nodeMap.set(from, node);
        }
        if (!nodeMap.has(to)) {
          const node: MermaidNode = { id: to, label: to, type: 'node', shape: 'rectangle' };
          nodes.push(node);
          nodeMap.set(to, node);
        }

        const connection: MermaidConnection = {
          from,
          to,
          label: labelMatch ? labelMatch.replace(/\|/g, '').trim() : undefined,
          type: this.getConnectionType(arrow),
        };
        connections.push(connection);
      }
    });

    return {
      type: 'flowchart',
      nodes,
      connections,
      metadata: { direction },
    };
  }

  /**
   * Parsea Sequence Diagram
   * Ejemplo:
   * sequenceDiagram
   *   Alice->>Bob: Hello Bob!
   *   Bob-->>Alice: Hi Alice!
   */
  private static parseSequence(code: string): MermaidAST {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    const participants = new Set<string>();
    const connections: MermaidConnection[] = [];

    // Regex para participantes explícitos
    const participantRegex = /participant\s+(\w+)(?:\s+as\s+(.+))?/i;
    
    // Regex para mensajes
    const messageRegex = /(\w+)([-\->]+|[->]+)(\w+):\s*(.+)/;

    lines.slice(1).forEach(line => {
      // Participantes explícitos
      const participantMatch = line.match(participantRegex);
      if (participantMatch) {
        participants.add(participantMatch[1]);
        return;
      }

      // Mensajes (también detectan participantes implícitos)
      const messageMatch = line.match(messageRegex);
      if (messageMatch) {
        const [, from, arrow, to, label] = messageMatch;
        participants.add(from);
        participants.add(to);

        connections.push({
          from,
          to,
          label: label.trim(),
          type: arrow.includes('--') ? 'dotted' : 'arrow',
        });
      }
    });

    const nodes: MermaidNode[] = Array.from(participants).map(id => ({
      id,
      label: id,
      type: 'participant',
    }));

    return {
      type: 'sequence',
      nodes,
      connections,
    };
  }

  /**
   * Parsea Class Diagram
   * Ejemplo:
   * classDiagram
   *   Animal <|-- Duck
   *   Animal : +int age
   *   Animal : +String name
   *   Animal: +makeSound()
   */
  private static parseClass(code: string): MermaidAST {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    const nodes: MermaidNode[] = [];
    const connections: MermaidConnection[] = [];
    const classMap = new Map<string, MermaidNode>();

    // Regex para relaciones
    const relationRegex = /(\w+)\s*(<\|--|<\|\.\.|o--|--o|\*--|--\*|-->|\.\.>|--)\s*(\w+)/;
    
    // Regex para atributos y métodos
    const memberRegex = /(\w+)\s*:\s*([+-])?(.+)/;

    lines.slice(1).forEach(line => {
      // Relaciones entre clases
      const relationMatch = line.match(relationRegex);
      if (relationMatch) {
        const [, from, arrow, to] = relationMatch;
        
        // Asegurar que las clases existen
        if (!classMap.has(from)) {
          const node: MermaidNode = { id: from, label: from, type: 'class', attributes: [], methods: [] };
          nodes.push(node);
          classMap.set(from, node);
        }
        if (!classMap.has(to)) {
          const node: MermaidNode = { id: to, label: to, type: 'class', attributes: [], methods: [] };
          nodes.push(node);
          classMap.set(to, node);
        }

        connections.push({
          from,
          to,
          type: 'arrow',
          relationship: this.getClassRelationship(arrow),
        });
        return;
      }

      // Miembros de clase (atributos y métodos)
      const memberMatch = line.match(memberRegex);
      if (memberMatch) {
        const [, className, visibility, member] = memberMatch;

        if (!classMap.has(className)) {
          const node: MermaidNode = { id: className, label: className, type: 'class', attributes: [], methods: [] };
          nodes.push(node);
          classMap.set(className, node);
        }

        const classNode = classMap.get(className)!;
        const memberStr = `${visibility || ''}${member.trim()}`;
        
        // Determinar si es método (contiene paréntesis) o atributo
        if (member.includes('(')) {
          classNode.methods!.push(memberStr);
        } else {
          classNode.attributes!.push(memberStr);
        }
      }
    });

    return {
      type: 'class',
      nodes,
      connections,
    };
  }

  /**
   * Parsea State Diagram
   * Ejemplo:
   * stateDiagram-v2
   *   [*] --> Still
   *   Still --> Moving : Start
   *   Moving --> Still : Stop
   */
  private static parseState(code: string): MermaidAST {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    const nodes: MermaidNode[] = [];
    const connections: MermaidConnection[] = [];
    const stateMap = new Map<string, MermaidNode>();

    // Regex para transiciones
    const transitionRegex = /(\[?\*?\]?|\w+)\s*(-->|--)\s*(\[?\*?\]?|\w+)(?:\s*:\s*(.+))?/;

    lines.slice(1).forEach(line => {
      const transitionMatch = line.match(transitionRegex);
      if (transitionMatch) {
        const [, from, _arrow, to, label] = transitionMatch;
        const fromId = from.trim();
        const toId = to.trim();

        // Crear nodos si no existen
        if (!stateMap.has(fromId) && fromId !== '[*]') {
          const node: MermaidNode = { id: fromId, label: fromId, type: 'state' };
          nodes.push(node);
          stateMap.set(fromId, node);
        }
        if (!stateMap.has(toId) && toId !== '[*]') {
          const node: MermaidNode = { id: toId, label: toId, type: 'state' };
          nodes.push(node);
          stateMap.set(toId, node);
        }

        connections.push({
          from: fromId,
          to: toId,
          label: label?.trim(),
          type: 'arrow',
        });
      }
    });

    return {
      type: 'state',
      nodes,
      connections,
    };
  }

  /**
   * Parsea Entity Relationship Diagram
   * Ejemplo:
   * erDiagram
   *   CUSTOMER ||--o{ ORDER : places
   *   ORDER ||--|{ LINE-ITEM : contains
   */
  private static parseER(code: string): MermaidAST {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    const nodes: MermaidNode[] = [];
    const connections: MermaidConnection[] = [];
    const entityMap = new Map<string, MermaidNode>();

    // Regex para relaciones ER
    const relationRegex = /([\w-]+)\s*(\|\||o\||o\{|\|\{)(--|\.\.)(\|\||o\||o\}|\|\})\s*([\w-]+)(?:\s*:\s*(.+))?/;
    
    // Regex para atributos de entidad
    const attributeRegex = /([\w-]+)\s*\{[\s\S]*?\}/;

    lines.slice(1).forEach(line => {
      // Relaciones
      const relationMatch = line.match(relationRegex);
      if (relationMatch) {
        const [, entity1, left, connector, right, entity2, label] = relationMatch;

        // Crear entidades si no existen
        if (!entityMap.has(entity1)) {
          const node: MermaidNode = { id: entity1, label: entity1, type: 'entity', attributes: [] };
          nodes.push(node);
          entityMap.set(entity1, node);
        }
        if (!entityMap.has(entity2)) {
          const node: MermaidNode = { id: entity2, label: entity2, type: 'entity', attributes: [] };
          nodes.push(node);
          entityMap.set(entity2, node);
        }

        connections.push({
          from: entity1,
          to: entity2,
          label: label?.trim(),
          type: connector === '..' ? 'dotted' : 'line',
          relationship: this.getERRelationship(left, right),
        });
      }

      // Atributos de entidad (simplificado)
      const attributeMatch = line.match(attributeRegex);
      if (attributeMatch) {
        const [, entityName] = attributeMatch;
        if (!entityMap.has(entityName)) {
          const node: MermaidNode = { id: entityName, label: entityName, type: 'entity', attributes: [] };
          nodes.push(node);
          entityMap.set(entityName, node);
        }
      }
    });

    return {
      type: 'er',
      nodes,
      connections,
    };
  }

  /**
   * Helper: Determina la forma del nodo en flowchart según el bracket
   */
  private static getFlowchartShape(bracket: string): MermaidNode['shape'] {
    switch (bracket) {
      case '[': return 'rectangle';
      case '(': return 'rounded';
      case '((': return 'circle';
      case '{': return 'diamond';
      case '[[': return 'rectangle';
      default: return 'rectangle';
    }
  }

  /**
   * Helper: Determina el tipo de conexión según la flecha
   */
  private static getConnectionType(arrow: string): MermaidConnection['type'] {
    if (arrow.includes('==>')) return 'thick';
    if (arrow.includes('-.-')) return 'dotted';
    if (arrow.includes('---')) return 'line';
    return 'arrow';
  }

  /**
   * Helper: Determina la relación en diagramas de clases
   */
  private static getClassRelationship(arrow: string): MermaidConnection['relationship'] {
    if (arrow.includes('<|--') || arrow.includes('<|..')) return 'inheritance';
    if (arrow.includes('*--') || arrow.includes('--*')) return 'composition';
    if (arrow.includes('o--') || arrow.includes('--o')) return 'aggregation';
    return 'association';
  }

  /**
   * Helper: Determina la relación en diagramas ER
   */
  private static getERRelationship(left: string, right: string): MermaidConnection['relationship'] {
    const hasOne = (s: string) => s.includes('||');
    const hasMany = (s: string) => s.includes('{') || s.includes('}');

    const leftOne = hasOne(left);
    const rightOne = hasOne(right);
    const leftMany = hasMany(left);
    const rightMany = hasMany(right);

    if ((leftOne && rightMany) || (leftMany && rightOne)) {
      return 'one-to-many';
    }
    if (leftMany && rightMany) {
      return 'many-to-many';
    }

    return 'association';
  }

  /**
   * Valida si el código Mermaid tiene errores básicos de sintaxis
   */
  static validate(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('Code is empty');
      return { valid: false, errors };
    }

    const type = this.detectType(code);
    if (!type) {
      errors.push('Unable to detect diagram type. Must start with flowchart, sequenceDiagram, classDiagram, stateDiagram, or erDiagram');
      return { valid: false, errors };
    }

    try {
      const ast = this.parse(code, type);
      
      if (ast.nodes.length === 0) {
        errors.push('No nodes found in diagram');
      }
      
      // Validar que las conexiones referencian nodos existentes
      const nodeIds = new Set(ast.nodes.map(n => n.id));
      ast.connections.forEach((conn, index) => {
        if (!nodeIds.has(conn.from) && conn.from !== '[*]') {
          errors.push(`Connection ${index + 1}: Source node "${conn.from}" not found`);
        }
        if (!nodeIds.has(conn.to) && conn.to !== '[*]') {
          errors.push(`Connection ${index + 1}: Target node "${conn.to}" not found`);
        }
      });

    } catch (error) {
      errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
