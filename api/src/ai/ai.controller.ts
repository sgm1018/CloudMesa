import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService, DiagramType } from './ai.service';

// Nota: Usar el guard de autenticación que ya tienes en tu proyecto
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class GenerateMermaidDto {
  prompt: string;
  diagramType?: DiagramType;
}

export class ImproveMermaidDto {
  mermaidCode: string;
  improvements: string;
}

@Controller('ai')
// @UseGuards(JwtAuthGuard) // Descomentar cuando integres con autenticación
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-mermaid')
  async generateMermaid(
    @Request() req,
    @Body() generateMermaidDto: GenerateMermaidDto,
  ) {
    const { prompt, diagramType = 'flowchart' } = generateMermaidDto;
    
    return await this.aiService.generateMermaid(prompt, diagramType);
  }

  @Post('improve-mermaid')
  async improveMermaid(
    @Request() req,
    @Body() improveMermaidDto: ImproveMermaidDto,
  ) {
    const { mermaidCode, improvements } = improveMermaidDto;
    
    return await this.aiService.improveMermaid(mermaidCode, improvements);
  }
}
