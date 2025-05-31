import { error } from "console";
import { BaseService, PaginationParams } from "./BaseService";
import { Item } from "../types";

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
    
    async findItemwByUserByParentIdPagination(id: string, paginationParams: PaginationParams) {
        const url = new URL(`${this.baseUrl}${this.controller}/${id}/parent`);
        url.searchParams.append('paginationParams.page', paginationParams.page.toString());
        url.searchParams.append('paginationParams.limit', paginationParams.limit.toString());
        
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
}

export const itemService = ItemService.getInstance();