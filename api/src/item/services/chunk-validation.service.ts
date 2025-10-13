import { Injectable, BadRequestException } from '@nestjs/common';
import { ChunkUploadDto } from '../dto/chunk-upload.dto';

@Injectable()
export class ChunkValidationService {
  
  /**
   * Valida que un chunk cumpla con los requisitos básicos
   */
  validateChunk(chunkData: ChunkUploadDto, file: Express.Multer.File): void {
    // Validar que el archivo existe
    if (!file || !file.buffer) {
      throw new BadRequestException('Chunk file is required');
    }

    // Validar que el número de chunk es válido
    if (chunkData.chunkNumber < 0 || chunkData.chunkNumber >= chunkData.totalChunks) {
      throw new BadRequestException('Invalid chunk number');
    }

    // Validar tamaño máximo de chunk (10MB)
    const maxChunkSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxChunkSize) {
      throw new BadRequestException(`Chunk size exceeds maximum allowed size of ${maxChunkSize} bytes`);
    }

    // // Para el último chunk, puede ser más pequeño
    // const expectedMaxSize = this.calculateExpectedChunkSize(
    //   chunkData.chunkNumber, 
    //   chunkData.totalChunks, 
    //   chunkData.totalSize
    // );

    // if (file.size > expectedMaxSize) {
    //   throw new BadRequestException(`Chunk ${chunkData.chunkNumber} size (${file.size}) exceeds expected size (${expectedMaxSize})`);
    // }
  }

  /**
   * Calcula el tamaño esperado para un chunk específico
   */
  private calculateExpectedChunkSize(chunkNumber: number, totalChunks: number, totalSize: number): number {
    const standardChunkSize = Math.ceil(totalSize / totalChunks);
    
    // El último chunk puede ser más pequeño
    if (chunkNumber === totalChunks - 1) {
      const remainingSize = totalSize - (chunkNumber * standardChunkSize);
      return Math.min(remainingSize, standardChunkSize);
    }
    
    return standardChunkSize;
  }

  /**
   * Valida la integridad de los parámetros de subida
   */
  validateUploadParams(totalSize: number, totalChunks: number): void {
    if (totalSize <= 0) {
      throw new BadRequestException('Total size must be greater than 0');
    }

    if (totalChunks <= 0) {
      throw new BadRequestException('Total chunks must be greater than 0');
    }

    // Validar tamaño máximo de archivo (1GB)
    const maxFileSize = 1024 * 1024 * 1024; // 1GB
    if (totalSize > maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
    }

    // Validar número máximo de chunks (1000)
    const maxChunks = 1000;
    if (totalChunks > maxChunks) {
      throw new BadRequestException(`Number of chunks exceeds maximum allowed (${maxChunks})`);
    }

  }

}
