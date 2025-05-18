import { log } from 'console';
import { Entity } from '../types';
import { Enviroment } from './../../enviroment';

// Common interfaces


export interface PaginationParams {
    page: number;
    limit: number;
}


export class BaseService {
    protected baseUrl: string;
    protected controller: string;

    constructor(endpoint: string) {
        this.baseUrl = `${Enviroment.API_URL}/${endpoint}`;
        this.controller = "base";
    }

    async create(entity: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity),
            });
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error creating entity: ${error}`);
            return null;
        }
    }

    async findAll(filter = {}): Promise<any> {
        try {
            const params = new URLSearchParams(this.serializeFilter(filter));
            const response = await fetch(`${this.baseUrl}${this.controller}?${params}`);
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching entities: ${error}`);
            return null
        }
    }

    async findById(id: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}/${id}`);
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching entity: ${error}`);
            return null
        }
    }

    async findPaginated(filter = {}, paginationParams: PaginationParams): Promise<any> {
        try {
            const params = new URLSearchParams(this.serializeFilter(filter));
            params.append('page', paginationParams.page.toString());
            params.append('limit', paginationParams.limit.toString());
            
            const response = await fetch(`${this.baseUrl}${this.controller}/paginated?${params}`);
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error paginated fetching entities: ${error}`);
            return null
        }
    }

    async update(entity: any): Promise<any> {
        
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}/${entity._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity),
            });
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error updating entity: ${error}`);
            return null;
        }
    }

    async remove(id: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error removing entity: ${error}`);
            return null
        }
    }

    async count(filter = {}): Promise<any> {
        try {
            const params = new URLSearchParams(this.serializeFilter(filter));
            const response = await fetch(`${this.baseUrl}${this.controller}/count?${params}`);
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error Counting entities: ${error}`);
            return null
        }
    }

    async exists(filter = {}): Promise<any> {
        try {
            const params = new URLSearchParams(this.serializeFilter(filter));
            const response = await fetch(`${this.baseUrl}${this.controller}/exists?${params}`);
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error checking if exists entity: ${error}`);
            return null
        }
    }

    private serializeFilter(filter: any): Record<string, string> {
        const result: Record<string, string> = {};
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                result[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
            }
        });
        return result;
    }
}