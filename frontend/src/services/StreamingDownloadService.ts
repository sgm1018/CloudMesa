import { BaseService } from "./BaseService";

export interface DownloadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface DownloadOptions {
    onProgress?: (progress: DownloadProgress) => void;
    onComplete?: (blob: Blob) => void;
    onError?: (error: Error) => void;
    signal?: AbortSignal; // Para cancelar la descarga
}

class StreamingDownloadService extends BaseService {
    private static instance: StreamingDownloadService;
    private activeDownloads: Map<string, AbortController> = new Map();

    private constructor() {
        super("items");
    }

    public static getInstance(): StreamingDownloadService {
        if (!StreamingDownloadService.instance) {
            StreamingDownloadService.instance = new StreamingDownloadService();
        }
        return StreamingDownloadService.instance;
    }

    /**
     * Descarga un archivo usando streaming moderno con soporte para progreso y cancelación
     */
    async downloadFileStream(
        itemId: string,
        options: DownloadOptions = {}
    ): Promise<ReadableStream<Uint8Array>> {
        const downloadId = `download_${itemId}_${Date.now()}`;
        const abortController = new AbortController();
        
        // Usar el signal proporcionado o crear uno nuevo
        const signal = options.signal || abortController.signal;
        
        if (!options.signal) {
            this.activeDownloads.set(downloadId, abortController);
        }

        try {
            const url = new URL(`${this.baseUrl}${this.controller}/${itemId}/download`);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getAuthHeaders(),
                signal
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body available for streaming');
            }

            const contentLength = response.headers.get('Content-Length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            let loaded = 0;

            // Crear un transform stream para trackear el progreso
            const progressTrackingStream = new TransformStream({
                transform(chunk, controller) {
                    loaded += chunk.byteLength;
                    
                    if (options.onProgress && total > 0) {
                        options.onProgress({
                            loaded,
                            total,
                            percentage: Math.round((loaded / total) * 100)
                        });
                    }
                    
                    controller.enqueue(chunk);
                }
            });

            // Procesar el stream
            const processedStream = response.body.pipeThrough(progressTrackingStream);

            // Cleanup cuando termine
            signal.addEventListener('abort', () => {
                this.activeDownloads.delete(downloadId);
            });

            return processedStream;

        } catch (error) {
            this.activeDownloads.delete(downloadId);
            if (options.onError) {
                options.onError(error as Error);
            }
            throw error;
        }
    }

    /**
     * Descarga un archivo y lo convierte automáticamente a Blob
     */
    async downloadFileAsBlob(
        itemId: string,
        options: DownloadOptions = {}
    ): Promise<Blob> {
        const stream = await this.downloadFileStream(itemId, options);
        
        const chunks: Uint8Array[] = [];
        const reader = stream.getReader();

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
            }

            const blob = new Blob(chunks as BlobPart[], { type: 'application/octet-stream' });
            
            if (options.onComplete) {
                options.onComplete(blob);
            }
            
            return blob;

        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Descarga un archivo y lo guarda automáticamente usando la API moderna de File System Access
     * Fallback a descarga tradicional si no está disponible
     */
    async downloadAndSaveFile(
        itemId: string,
        suggestedName: string = 'file',
        options: DownloadOptions = {}
    ): Promise<void> {
        try {
            // Intentar usar la API moderna de File System Access (Chrome 86+)
            if ('showSaveFilePicker' in window) {
                await this.downloadWithFileSystemAccess(itemId, suggestedName, options);
            } else {
                // Fallback a método tradicional
                await this.downloadWithTraditionalMethod(itemId, suggestedName, options);
            }
        } catch (error) {
            if (options.onError) {
                options.onError(error as Error);
            }
            throw error;
        }
    }

    /**
     * Descarga usando la API moderna de File System Access
     */
    private async downloadWithFileSystemAccess(
        itemId: string,
        suggestedName: string,
        options: DownloadOptions
    ): Promise<void> {
        try {
            // @ts-ignore - File System Access API no está en todos los tipos de TypeScript
            const fileHandle = await window.showSaveFilePicker({
                suggestedName,
                types: [{
                    description: 'All files',
                    accept: { '*/*': [] }
                }]
            });

            const writable = await fileHandle.createWritable();
            const stream = await this.downloadFileStream(itemId, options);
            
            await stream.pipeTo(writable);
            
            if (options.onComplete) {
                // Para mantener compatibilidad, creamos un blob vacío
                options.onComplete(new Blob([]));
            }

        } catch (error) {
            if ((error as any).name === 'AbortError') {
                // Usuario canceló el diálogo de guardado
                return;
            }
            throw error;
        }
    }

    /**
     * Descarga usando el método tradicional (crear elemento <a>)
     */
    private async downloadWithTraditionalMethod(
        itemId: string,
        suggestedName: string,
        options: DownloadOptions
    ): Promise<void> {
        const blob = await this.downloadFileAsBlob(itemId, options);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Cancela una descarga activa
     */
    cancelDownload(downloadId: string): boolean {
        const controller = this.activeDownloads.get(downloadId);
        if (controller) {
            controller.abort();
            this.activeDownloads.delete(downloadId);
            return true;
        }
        return false;
    }

    /**
     * Cancela todas las descargas activas
     */
    cancelAllDownloads(): void {
        for (const controller of this.activeDownloads.values()) {
            controller.abort();
        }
        this.activeDownloads.clear();
    }

    /**
     * Obtiene metadata del archivo sin descargarlo
     */
    async getFileMetadata(itemId: string): Promise<{
        size: number;
        exists: boolean;
        item: any | null;
    }> {
        try {
            const url = new URL(`${this.baseUrl}${this.controller}/${itemId}/metadata`);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Metadata fetch failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`Error fetching file metadata: ${error}`);
            return { size: 0, exists: false, item: null };
        }
    }

    /**
     * Verifica si el navegador soporta streaming downloads
     */
    supportsStreaming(): boolean {
        return 'ReadableStream' in window && 'fetch' in window;
    }

    /**
     * Obtiene las descargas activas
     */
    getActiveDownloads(): string[] {
        return Array.from(this.activeDownloads.keys());
    }
}

export const streamingDownloadService = StreamingDownloadService.getInstance();
