import { BaseService, PaginationParams } from "./BaseService";
import { Item, ItemType } from "../types";
import { encryptService } from "./EncryptService";

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

    async uploadFile(file: File, parentId: string): Promise<Item> {
        const formData = new FormData();
        


        const itemData = this.initializeItem(file, parentId);
        formData.append('file', file);
        
        // Append item data as JSON string or individual fields
        Object.keys(itemData).forEach(key => {
            const value = itemData[key as keyof Item];
            if (value !== undefined && value !== null) {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });

        const response = await fetch(`${this.baseUrl}${this.controller}/upload`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
            },
            body: formData
        });

        if (!response.ok) {
            console.error(`Error uploading file: ${response.statusText}`);
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result: Item = await response.json();
        return result;
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