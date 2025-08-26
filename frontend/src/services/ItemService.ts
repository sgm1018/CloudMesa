import { BaseService, PaginationParams } from "./BaseService";
import { Item, ItemType } from "../types";
import { encryptService } from "./EncryptService";
import { chunkUploadService } from "./ChunkUploadService";
import { streamingDownloadService, DownloadProgress } from "./StreamingDownloadService";
import { useToast } from "../context/ToastContext";

class ItemService extends BaseService {
    private static instance: ItemService;
    private constructor() {
        super("items");
    }

    public static getInstance(): ItemService {
        if (!ItemService.instance) {
            ItemService.instance = new ItemService();
        }
        return ItemService.instance;
    }
    
    async findItemwByUserByParentIdPagination(paginationParams: PaginationParams) {
        const url = new URL(`${this.baseUrl}${this.controller}/parent`);
        url.searchParams.append('parentId', paginationParams.parentId!);
        url.searchParams.append('itemTypes', JSON.stringify(paginationParams.itemTypes || []));
        url.searchParams.append('page', paginationParams.page?.toString() || '1');
        url.searchParams.append('limit', paginationParams.limit?.toString() || '10');
        
        const result = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        if (!result.ok){
            console.error(`Error fetching items by parent ID: ${result.statusText}`);
        }
        const items : Item[]= await result.json();
        return items;
    }

    async findSearchItems(search: string): Promise<Item[]> {
        const url = new URL(`${this.baseUrl}${this.controller}/search`);
        url.searchParams.append('itemName', search);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            console.error(`Error searching items: ${response.statusText}`);
            return [];
        }
        
        const items: Item[] = await response.json();
        return items;

    }
    async countItems(type: string[], parentId: string): Promise<number> {
        const url = new URL(`${this.baseUrl}${this.controller}/count`);
        
        url.searchParams.append('type', JSON.stringify(type));
        url.searchParams.append('parentId', parentId);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            console.error(`Error searching items: ${response.statusText}`);
            return 0;
        }
        
        const items : number = await response.json();
        return items;

    }

    async uploadFile(file: File, parentId: string, onProgress?: (progress: number) => void, onChunkComplete?: (chunkNumber: number, totalChunks: number) => void): Promise<Item> {
        const publicKey = sessionStorage.getItem('publicKey') || await encryptService.getPublicKey() || '';

        const itemData = this.initializeItem(file, parentId);

        const {
            encryptedFileBlob,
            encryptedSymmetricKey,
            keyNonce,
            ephemeralPublicKey,
            fileNonce,
            encryptedMetadata,
            metadataNonce
        } = await encryptService.encryptFileAndMetadata(file, itemData, publicKey);

        itemData.encryption = {
            encryptedKey: encryptedSymmetricKey,
            ephemeralPublicKey,
            keyNonce,
            metadataNonce,
            fileNonce,
        };

        itemData.encryptedMetadata = encryptedMetadata;


        // Convertir el blob cifrado a File (si no lo es) para que ChunkUploadService lo acepte
        const encryptedFile: File = (encryptedFileBlob instanceof File) ? encryptedFileBlob : new File([encryptedFileBlob as Blob], file.name);

        // Delegar la subida al servicio de chunks. El servicio espera recibir el archivo cifrado y
        // como itemMetadata recibe la metadata del item (itemData) que ya contiene la info de cifrado.
        const result = await chunkUploadService.uploadFile(encryptedFile, itemData, onProgress, onChunkComplete);

        // El servicio de chunks realizará el POST final y deberá devolver el Item creado por el backend.
        // Aseguramos que el resultado tenga la forma esperada y lo retornamos.
        const createdItem: Item = result as Item;
        return createdItem;
    }

    async downloadItem(item: Item, privateKey: string, onProgress?: (progress: DownloadProgress) => void): Promise<void> {

        if (item.encryption == null || item.encryption.encryptedKey == null 
            || item.encryption.encryptedKey =='' 
            || item.encryption.ephemeralPublicKey == null 
            || item.encryption.ephemeralPublicKey == ''
            || item.encryption.fileNonce == null
            || item.encryption.fileNonce == ''
            || item.encryption.keyNonce == null
            || item.encryption.keyNonce == ''
            || item.encryption.metadataNonce == null
            || item.encryption.metadataNonce == ''
        ) {
            console.error('Missing encryption data in item');
            return;
        }

        try {
            // Usar el servicio de streaming para descargar el archivo
            const encryptedBlob = await streamingDownloadService.downloadFileAsBlob(item._id, {
                onProgress,
                onError: (error) => {
                    console.error(`Download error: ${error.message}`);
                }
            });

            // Convertir el blob a Uint8Array para el descifrado
            const arrayBuffer = await encryptedBlob.arrayBuffer();
            const encryptedFile = new Uint8Array(arrayBuffer);

            // Descifrar la clave simétrica
            const decryptedSymetricKey = await encryptService.decryptsymmetricKey(
                item.encryption.encryptedKey, 
                item.encryption.keyNonce, 
                item.encryption.ephemeralPublicKey, 
                privateKey
            );
            
            if (decryptedSymetricKey == null || decryptedSymetricKey == '') {
                console.error('Failed to decrypt symmetric key');
                return;
            }

            // Descifrar el archivo
            const decryptedFileBuffer = await encryptService.decipherFullFile(
                encryptedFile, 
                decryptedSymetricKey, 
                item.encryption.fileNonce
            );
            
            if (decryptedFileBuffer == null) {
                console.error('Failed to decrypt file');
                return;
            }

            // Obtener el nombre original del archivo desde la metadata descifrada
            const fileName = item?.encryptedMetadata?.name || 'downloaded_file';

            // Crear blob con el archivo descifrado
            const fileUint8 = (decryptedFileBuffer instanceof Uint8Array)
                ? new Uint8Array(decryptedFileBuffer)
                : new Uint8Array(decryptedFileBuffer as any);

            const blob = new Blob([fileUint8], { type: 'application/octet-stream' });
            
            // Método tradicional como fallback
            const urlBlob = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlBlob);

        } catch (error) {
            console.error(`Error downloading file: ${error}`);
            throw error;
        }
    }

    /**
     * Descarga avanzada con más opciones de control
     */
    async downloadItemAdvanced(
        item: Item, 
        privateKey: string, 
        options: {
            onProgress?: (progress: DownloadProgress) => void;
            onDecryptProgress?: (stage: string) => void;
            signal?: AbortSignal;
            suggestedName?: string;
        } = {}
    ): Promise<void> {
        if (item.encryption == null || item.encryption.encryptedKey == null 
            || item.encryption.encryptedKey =='' 
            || item.encryption.ephemeralPublicKey == null 
            || item.encryption.ephemeralPublicKey == ''
            || item.encryption.fileNonce == null
            || item.encryption.fileNonce == ''
            || item.encryption.keyNonce == null
            || item.encryption.keyNonce == ''
            || item.encryption.metadataNonce == null
            || item.encryption.metadataNonce == ''
        ) {
            throw new Error('Missing encryption data in item');
        }

        try {
            // Notificar progreso de descarga
            options.onDecryptProgress?.('Downloading encrypted file...');

            // Usar streaming download con progreso
            const encryptedBlob = await streamingDownloadService.downloadFileAsBlob(item._id, {
                onProgress: options.onProgress,
                signal: options.signal,
                onError: (error) => {
                    console.error(`Download error: ${error.message}`);
                }
            });

            // Verificar si la descarga fue cancelada
            if (options.signal?.aborted) {
                throw new Error('Download was cancelled');
            }

            options.onDecryptProgress?.('Decrypting symmetric key...');

            // Convertir blob a array buffer
            const arrayBuffer = await encryptedBlob.arrayBuffer();
            const encryptedFile = new Uint8Array(arrayBuffer);

            // Descifrar clave simétrica
            const decryptedSymetricKey = await encryptService.decryptsymmetricKey(
                item.encryption.encryptedKey, 
                item.encryption.keyNonce, 
                item.encryption.ephemeralPublicKey, 
                privateKey
            );
            
            if (!decryptedSymetricKey) {
                throw new Error('Failed to decrypt symmetric key');
            }

            if (options.signal?.aborted) {
                throw new Error('Download was cancelled');
            }

            options.onDecryptProgress?.('Decrypting file content...');

            // Descifrar archivo
            const decryptedFileBuffer = await encryptService.decipherFullFile(
                encryptedFile, 
                decryptedSymetricKey, 
                item.encryption.fileNonce
            );
            
            if (!decryptedFileBuffer) {
                throw new Error('Failed to decrypt file');
            }

            if (options.signal?.aborted) {
                throw new Error('Download was cancelled');
            }

            options.onDecryptProgress?.('Preparing download...');

            // Obtener nombre del archivo
            let fileName = options.suggestedName;
            if (!fileName) {
                const decryptedItem = await this.getDecryptMetadata(item, privateKey);
                fileName = decryptedItem?.encryptedMetadata?.name || 'downloaded_file';
            }

            // Crear blob final
            const fileUint8 = (decryptedFileBuffer instanceof Uint8Array)
                ? new Uint8Array(decryptedFileBuffer)
                : new Uint8Array(decryptedFileBuffer as any);

            const finalBlob = new Blob([fileUint8], { type: 'application/octet-stream' });

            options.onDecryptProgress?.('Saving file...');

            // Crear URL y descargar usando el método tradicional
            const urlBlob = URL.createObjectURL(finalBlob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = fileName || 'downloaded_file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlBlob);

            options.onDecryptProgress?.('Download completed!');

        } catch (error) {
            if ((error as Error).name === 'AbortError' || (error as Error).message.includes('cancelled')) {
                console.log('Download was cancelled by user');
                return;
            }
            console.error(`Error in advanced download: ${error}`);
            throw error;
        }
    }

    /**
     * Obtiene información sobre las capacidades de descarga del navegador
     */
    getDownloadCapabilities(): {
        supportsStreaming: boolean;
        supportsRangeRequests: boolean;
        supportsCancellation: boolean;
    } {
        return {
            supportsStreaming: streamingDownloadService.supportsStreaming(),
            supportsRangeRequests: 'AbortController' in window,
            supportsCancellation: 'AbortController' in window
        };
    }


    async getDecryptMetadata(item: Item, privateKey: string): Promise<Item | null> {
        if (item.encryption == null || item.encryption.encryptedKey == null 
            || item.encryption.encryptedKey =='' 
            || item.encryption.ephemeralPublicKey == null 
            || item.encryption.ephemeralPublicKey == ''
            || item.encryption.keyNonce == null
            || item.encryption.keyNonce == ''
            || item.encryption.metadataNonce == null
            || item.encryption.metadataNonce == ''
        ) {
            console.error('Missing encryption data in item');
            return null;
        }

        try {
            const decryptedSymmetricKey = await encryptService.decryptsymmetricKey(
                item.encryption.encryptedKey,
                item.encryption.keyNonce,
                item.encryption.ephemeralPublicKey,
                privateKey
            );

            if (!decryptedSymmetricKey) {
                console.error('Failed to decrypt symmetric key');
                return null;
            }

            const decryptedMetadata = await encryptService.decipherItemMetadata(
                item.encryptedMetadata,
                decryptedSymmetricKey,
                item.encryption.metadataNonce
            );

            if (!decryptedMetadata) {
                console.error('Failed to decrypt metadata');
                return null;
            }

            // Return a new Item object with decrypted metadata
            return {
                ...item,
                encryptedMetadata: decryptedMetadata
            };
        } catch (error) {
            console.error(`Error decrypting metadata: ${error}`);
            return null;
        }

    }




    initializeItem(file: File, parentId: string): Item {
        const item: Item = {
            _id: '',
            type: ItemType.FILE,
            parentId: parentId,
            userId: '', // Se asignará en el servidor
            encryptedMetadata: {
                name: file.name,
                description: '',
                notes: '',
            },
            encryption: {
                encryptedKey: undefined,
                ephemeralPublicKey: undefined,
                keyNonce: undefined,
                metadataNonce: undefined,
                fileNonce: undefined,
            },
            sharedWith: [],
            size: undefined, // Tamaño del archivo
            createdAt: new Date(),
            updatedAt: undefined,
            userCreator: undefined,
            userUpdater: undefined
        };
        
        return item;
    }

    initializeFolder(name: string, parentId: string = ''): Item {
        const item: Item = {
            _id: '',
            type: ItemType.FOLDER,
            parentId: parentId,
            userId: '', // Se asignará en el servidor
            encryptedMetadata: {
                name: name,
                description: '',
                notes: '',
                username: undefined,
                password: undefined,
                url: undefined,
                color: undefined,
                icon: 'folder'
            },
            encryption: {
                encryptedKey: undefined,
                ephemeralPublicKey: undefined,
                keyNonce: undefined,
                metadataNonce: undefined,
                fileNonce: undefined,
            },
            sharedWith: [],
            size: undefined, // Las carpetas no tienen tamaño
            createdAt: new Date(),
            updatedAt: undefined,
            userCreator: undefined,
            userUpdater: undefined
        };
        
        return item;
    }

    initializePassword(data: {
        name: string;
        username?: string;
        password?: string;
        url?: string;
        notes?: string;
        color?: string;
        icon?: string;
        parentId?: string;
    }): Item {
        const item: Item = {
            _id: '',
            type: ItemType.PASSWORD,
            parentId: data.parentId || '',
            userId: '', // Se asignará en el servidor
            encryptedMetadata: {
                name: data.name,
                username: data.username || '',
                password: data.password || '',
                url: data.url || '',
                notes: data.notes || '',
                description: '',
                color: data.color || 'blue',
                icon: data.icon || 'key'
            },
            encryption: {
                encryptedKey: undefined,
                ephemeralPublicKey: undefined,
                keyNonce: undefined,
                metadataNonce: undefined,
                fileNonce: undefined,
            },
            sharedWith: [],
            size: undefined, // Las contraseñas no tienen tamaño
            createdAt: new Date(),
            updatedAt: undefined,
            userCreator: undefined,
            userUpdater: undefined
        };
        
        return item;
    }

    initializeGroup(name: string, parentId: string = ''): Item {
        const item: Item = {
            _id: '',
            type: ItemType.GROUP,
            parentId: parentId,
            userId: '', // Se asignará en el servidor
            encryptedMetadata: {
                name: name,
                description: '',
                notes: '',
                username: undefined,
                password: undefined,
                url: undefined,
                color: 'purple',
                icon: 'folder'
            },
            encryption: {
              encryptedKey: undefined,
                ephemeralPublicKey: undefined,
                keyNonce: undefined,
                metadataNonce: undefined,
                fileNonce: undefined,
            },
            sharedWith: [],
            size: undefined, // Los grupos no tienen tamaño
            createdAt: new Date(),
            updatedAt: undefined,
            userCreator: undefined,
            userUpdater: undefined
        };
        
        return item;
    }

    async getBreadcrumbPath(itemId: string): Promise<Item[]> {
        try {
            const path: Item[] = [];
            let currentItemId: string | null = itemId;
            let depth = 0;
            const maxDepth = 10; // Prevenir loops infinitos
            
            while (currentItemId && depth < maxDepth) {
                const item = await this.findById(currentItemId);
                
                if (!item) {
                    break;
                }
                
                path.unshift(item); // Añadir al inicio para mantener el orden correcto
                currentItemId = item.parentId || null;
                depth++;
            }
            
            return path;
        } catch (error) {
            console.error(`Error fetching breadcrumb path: ${error}`);
            return [];
        }
    }
}

export const itemService = ItemService.getInstance();