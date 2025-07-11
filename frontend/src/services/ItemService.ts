import { error } from "console";
import { BaseService, PaginationParams } from "./BaseService";
import { Item } from "../types";
import { json } from "stream/consumers";

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
        const url = new URL(`${this.baseUrl}/parent`);
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
        const url = new URL(`${this.baseUrl}/search`);
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
}

export const itemService = ItemService.getInstance();