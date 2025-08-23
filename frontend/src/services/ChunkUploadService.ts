import { Enviroment } from "../../enviroment";

/**
 * Servicio para manejar subida de archivos en chunks
 */
export class ChunkUploadService {
    private static instance: ChunkUploadService;
    private chunkSize: number;

    private constructor(chunkSize: number = 1024 * 1024) { // 1MB por defecto
        this.chunkSize = chunkSize;
    }

    public static getInstance(): ChunkUploadService {
    if (!ChunkUploadService.instance) {
      ChunkUploadService.instance = new ChunkUploadService();
    }
    return ChunkUploadService.instance;
  }

  /**
   * Sube un archivo completo en chunks
   */
  async uploadFile(
    file: File, 
    metadata: any, 
    onProgress?: (progress: number) => void,
    onChunkComplete?: (chunkNumber: number, totalChunks: number) => void
  ): Promise<any> {
    try {
      const totalChunks = Math.ceil(file.size / this.chunkSize);
      
      // 1. Inicializar subida
      const uploadId = await this.initializeUpload(file.size, totalChunks);
      
      // 2. Subir chunks
      const failedChunks: number[] = [];
      for (let i = 0; i < totalChunks; i++) {
        try {
          await this.uploadChunk(file, uploadId, i, totalChunks);
          onChunkComplete?.(i, totalChunks);
          onProgress?.(((i + 1) / totalChunks) * 100);
        } catch (error) {
          console.error(`Failed to upload chunk ${i}:`, error);
          failedChunks.push(i);
        }
      }

      // 3. Reintentar chunks fallidos
      if (failedChunks.length > 0) {
        console.log(`Retrying ${failedChunks.length} failed chunks...`);
        await this.retryFailedChunks(file, uploadId, failedChunks, totalChunks);
      }

      // 4. Finalizar subida
      const result = await this.finishUpload(uploadId, metadata);
      onProgress?.(100);
      
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Inicializa una nueva sesión de subida
   */
  private async initializeUpload(totalSize: number, totalChunks: number): Promise<string> {
    const response = await fetch(`${Enviroment.API_URL}items/chunk-upload/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalSize,
        totalChunks
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize upload: ${response.statusText}`);
    }

    const data = await response.json();
    return data.uploadId;
  }

  /**
   * Sube un chunk individual
   */
  private async uploadChunk(file: File, uploadId: string, chunkNumber: number, totalChunks: number): Promise<void> {
    const start = chunkNumber * this.chunkSize;
    const end = Math.min(start + this.chunkSize, file.size);
    const chunkBlob = file.slice(start, end);

    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('totalSize', file.size.toString());
    formData.append('chunk', chunkBlob);

    const response = await fetch(`${Enviroment.API_URL}items/chunk-upload/chunk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${chunkNumber}: ${response.statusText}`);
    }
  }

  /**
   * Reintenta chunks fallidos
   */
  private async retryFailedChunks(file: File, uploadId: string, failedChunks: number[], totalChunks: number): Promise<void> {
    const maxRetries = 3;
    
    for (let retry = 0; retry < maxRetries; retry++) {
      const stillFailed: number[] = [];
      
      for (const chunkNumber of failedChunks) {
        try {
          await this.uploadChunk(file, uploadId, chunkNumber, totalChunks);
        } catch (error) {
          stillFailed.push(chunkNumber);
        }
      }
      
      if (stillFailed.length === 0) {
        break; // Todos los chunks se subieron exitosamente
      }
      
      if (retry === maxRetries - 1 && stillFailed.length > 0) {
        throw new Error(`Failed to upload chunks after ${maxRetries} retries: ${stillFailed.join(', ')}`);
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
    }
  }

  /**
   * Finaliza la subida
   */
  private async finishUpload(uploadId: string, itemData: any): Promise<any> {
    const response = await fetch(`${Enviroment.API_URL}items/chunk-upload/finish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadId,
        itemData
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to finish upload: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene el estado de una subida
   */
  async getUploadStatus(uploadId: string): Promise<any> {
    const response = await fetch(`${Enviroment.API_URL}items/chunk-upload/status/${uploadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload status: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Cancela una subida
   */
  async cancelUpload(uploadId: string): Promise<void> {
    const response = await fetch(`${Enviroment.API_URL}items/chunk-upload/cancel/${uploadId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel upload: ${response.statusText}`);
    }
  }

  /**
   * Reanuda una subida interrumpida
   */
  async resumeUpload(uploadId: string, file: File, metadata: any, onProgress?: (progress: number) => void): Promise<any> {
    try {
      // Obtener estado actual
      const status = await this.getUploadStatus(uploadId);
      const { missingChunks, totalChunks } = status;

      if (missingChunks.length === 0) {
        // Todos los chunks ya están subidos, finalizar
        return await this.finishUpload(uploadId, metadata);
      }

      // Subir chunks faltantes
      for (let i = 0; i < missingChunks.length; i++) {
        const chunkNumber = missingChunks[i];
        await this.uploadChunk(file, uploadId, chunkNumber, totalChunks);
        
        const progress = ((totalChunks - missingChunks.length + i + 1) / totalChunks) * 100;
        onProgress?.(progress);
      }

      // Finalizar subida
      const result = await this.finishUpload(uploadId, metadata);
      onProgress?.(100);
      
      return result;
    } catch (error) {
      console.error('Resume upload failed:', error);
      throw error;
    }
  }
}

// Ejemplo de uso
export const uploadFileExample = async () => {
  const client = ChunkUploadService.getInstance();

  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const file = fileInput.files?.[0];
  
  if (!file) return;

  const metadata = {
    name: file.name,
    description: 'Archivo subido con chunks',
    parentId: 'some-parent-id',
    type: 'file',
    encryptedMetadata: {
      name: file.name,
      size: file.size,
      mimetype: file.type
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2'
    }
  };

  try {
    const result = await client.uploadFile(
      file,
      metadata,
      (progress) => {
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      },
      (chunkNumber, totalChunks) => {
        console.log(`Chunk ${chunkNumber + 1}/${totalChunks} completed`);
      }
    );
    
    console.log('Upload completed:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};


export const chunkUploadService = ChunkUploadService.getInstance();
