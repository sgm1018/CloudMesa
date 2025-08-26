import { BaseService, PaginationParams } from "./BaseService";
import { Item, ItemType } from "../types";
import { encryptService } from "./EncryptService";
import { chunkUploadService } from "./ChunkUploadService";
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
        const url = new URL(`${this.baseUrl}/count`);
        
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

    async downloadItem(item: Item, privateKey: string): Promise<void> {

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
            //Setter mensaje a NotificacionComponent de error
            return;
        }

        const url = new URL(`${this.baseUrl}${this.controller}/${item._id}/download`);
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { authorization: `Bearer ${sessionStorage.getItem('accessToken')}` } // NO uso el this.getAuthHeaders() porque necesito otro content-type distinto de application/json
        });

        if (!response.ok) {
            console.error(`Error downloading file: ${response.statusText}`);
            throw new Error(`Error downloading file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const encryptedFile = new Uint8Array(arrayBuffer);

        const decryptedSymetricKey = await encryptService.decryptsymmetricKey(item.encryption.encryptedKey, item.encryption.keyNonce, item.encryption.ephemeralPublicKey, privateKey);
        if (decryptedSymetricKey == null || decryptedSymetricKey == '') {
            //Setter mensaje a NotificacionComponent de error
            return;
        }
        const decryptedFileBuffer = await encryptService.decipherFullFile(encryptedFile, decryptedSymetricKey, item.encryption.fileNonce);
        if (decryptedFileBuffer == null) {
            //Setter mensaje a NotificacionComponent de error
            return;
        }

        // Create a copy backed by a plain ArrayBuffer to satisfy Blob's type requirements
        const fileUint8 = (decryptedFileBuffer instanceof Uint8Array)
            ? new Uint8Array(decryptedFileBuffer) // copies into an ArrayBuffer-backed view
            : new Uint8Array(decryptedFileBuffer as any);

        const blob = new Blob([fileUint8], { type: 'application/octet-stream' });
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = 'file';
        document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
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


    downloadFile(){
        // const urlBlob = URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = urlBlob;
        // a.download = 'file';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
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