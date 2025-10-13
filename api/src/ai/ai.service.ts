import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'state' | 'er';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. AI features will not work.');
    } else {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized successfully');
    }
  }

  /**
   * Generar código Mermaid a partir de texto natural
   */
  async generateMermaid(
    prompt: string,
    diagramType: DiagramType = 'flowchart',
  ): Promise<{ mermaidCode: string; explanation: string }> {
    if (!this.openai) {
      throw new BadRequestException('AI service not configured. Please set OPENAI_API_KEY.');
    }

    try {
      const systemPrompt = this.getSystemPrompt(diagramType);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      
      if (!response) {
        throw new BadRequestException('Empty response from AI');
      }
      
      // Extraer código Mermaid y explicación
      const { mermaidCode, explanation } = this.parseMermaidResponse(response);

      this.logger.log(`Generated ${diagramType} diagram for prompt: "${prompt.substring(0, 50)}..."`);

      return { mermaidCode, explanation };
    } catch (error) {
      this.logger.error('Error generating Mermaid code:', error);
      throw new BadRequestException('Failed to generate diagram. Please try again.');
    }
  }

  /**
   * Mejorar un diagrama Mermaid existente
   */
  async improveMermaid(
    mermaidCode: string,
    improvements: string,
  ): Promise<{ mermaidCode: string; explanation: string }> {
    if (!this.openai) {
      throw new BadRequestException('AI service not configured. Please set OPENAI_API_KEY.');
    }

    try {
      const systemPrompt = `You are an expert in Mermaid diagram syntax. 
Your task is to improve an existing Mermaid diagram based on user feedback.
Return ONLY valid Mermaid code wrapped in \`\`\`mermaid blocks, followed by a brief explanation.

Guidelines:
- Preserve the diagram type and structure
- Apply the requested improvements
- Ensure syntactically correct Mermaid code
- Keep it clean and readable`;

      const userPrompt = `Here's the current Mermaid diagram:

\`\`\`mermaid
${mermaidCode}
\`\`\`

Please improve it with the following changes:
${improvements}

Return the improved Mermaid code and a brief explanation of what you changed.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      
      if (!response) {
        throw new BadRequestException('Empty response from AI');
      }
      
      const { mermaidCode: improvedCode, explanation } = this.parseMermaidResponse(response);

      this.logger.log(`Improved Mermaid diagram with: "${improvements.substring(0, 50)}..."`);

      return { mermaidCode: improvedCode, explanation };
    } catch (error) {
      this.logger.error('Error improving Mermaid code:', error);
      throw new BadRequestException('Failed to improve diagram. Please try again.');
    }
  }

  /**
   * Obtener el prompt del sistema según el tipo de diagrama
   */
  private getSystemPrompt(diagramType: DiagramType): string {
    const basePrompt = `You are an expert in Mermaid diagram syntax. 
Your task is to convert natural language descriptions into valid Mermaid diagrams.
Return ONLY valid Mermaid code wrapped in \`\`\`mermaid blocks, followed by a brief explanation.

Important guidelines:
- Use correct Mermaid syntax for ${diagramType} diagrams
- Keep it clean and well-structured
- Use meaningful node IDs and labels
- Follow Mermaid best practices`;

    const typeSpecificGuidelines = {
      flowchart: `
Flowchart syntax:
- Start with: flowchart TD (or LR, BT, RL for direction)
- Nodes: id[Label], id(Label), id{Decision}, id((Circle))
- Arrows: --> (solid), -.-> (dashed), ==> (thick)
- Labels on arrows: -->|Label|
Example:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\``,

      sequence: `
Sequence diagram syntax:
- Start with: sequenceDiagram
- Participants: participant Name
- Messages: Name->>OtherName: Message
- Activations: activate/deactivate
Example:
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Server
    User->>Server: Request
    Server-->>User: Response
\`\`\``,

      class: `
Class diagram syntax:
- Start with: classDiagram
- Classes: class ClassName { +attribute -method() }
- Relationships: <|-- (inheritance), *-- (composition), o-- (aggregation)
Example:
\`\`\`mermaid
classDiagram
    Animal <|-- Dog
    Animal : +name
    Animal : +makeSound()
\`\`\``,

      state: `
State diagram syntax:
- Start with: stateDiagram-v2
- States: state StateName
- Transitions: State1 --> State2
- Special: [*] for start/end
Example:
\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Active
    Active --> [*]
\`\`\``,

      er: `
Entity Relationship diagram syntax:
- Start with: erDiagram
- Entities: EntityName { type attribute }
- Relationships: Entity1 ||--o{ Entity2 : relationship
Example:
\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER { string name }
    ORDER { int id }
\`\`\``,
    };

    return `${basePrompt}\n\n${typeSpecificGuidelines[diagramType]}`;
  }

  /**
   * Parsear la respuesta de OpenAI para extraer código Mermaid
   */
  private parseMermaidResponse(response: string): { mermaidCode: string; explanation: string } {
    // Buscar bloques de código Mermaid
    const mermaidMatch = response.match(/```mermaid\n([\s\S]*?)```/);
    
    if (!mermaidMatch) {
      // Intentar extraer sin el wrapper
      const lines = response.split('\n');
      const mermaidLines = lines.filter(line => 
        line.trim().startsWith('flowchart') ||
        line.trim().startsWith('sequenceDiagram') ||
        line.trim().startsWith('classDiagram') ||
        line.trim().startsWith('stateDiagram') ||
        line.trim().startsWith('erDiagram') ||
        line.includes('-->') ||
        line.includes('[') ||
        line.includes('{')
      );

      if (mermaidLines.length === 0) {
        throw new BadRequestException('Could not extract valid Mermaid code from AI response');
      }

      const mermaidCode = mermaidLines.join('\n').trim();
      const explanation = response.replace(mermaidCode, '').trim();

      return { mermaidCode, explanation: explanation || 'Diagram generated successfully' };
    }

    const mermaidCode = mermaidMatch[1].trim();
    const explanation = response.replace(mermaidMatch[0], '').trim() || 'Diagram generated successfully';

    return { mermaidCode, explanation };
  }

  /**
   * Validar que el código Mermaid sea válido (básico)
   */
  private isValidMermaid(code: string): boolean {
    const validStarts = [
      'flowchart',
      'graph',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
    ];

    return validStarts.some(start => code.trim().startsWith(start));
  }
}
