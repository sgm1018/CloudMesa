
import { Enviroment } from '../../enviroment';
// Common interfaces


export interface  PaginationParams {
    parentId?: string;
    itemTypes?: string[];
    page?: number;
    limit?: number;
}


export abstract class BaseService {
    protected baseUrl: string;
    protected controller: string;

    constructor(endpoint: string) {
        this.baseUrl = `${Enviroment.API_URL}`;
        this.controller = endpoint;
    }

    async create(entity: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}`, {
                method: 'POST',
                headers: this.getAuthHeaders() ,
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
            const response = await fetch(`${this.baseUrl}${this.controller}?${params}` , {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching entities: ${error}`);
            return null
        }
    }

    async findById(id: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${this.controller}/find/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching entity: ${error}`);
            return null
        }
    }

    async findPaginated(filter = {}, paginationParams: PaginationParams): Promise<any> {
        try {
            paginationParams.limit = paginationParams.limit || 10;
            paginationParams.page = paginationParams.page || 1;
            const params = new URLSearchParams(this.serializeFilter(filter));
            params.append('page', paginationParams.page!.toString());
            params.append('limit', paginationParams.limit!.toString());
            
            const response = await fetch(`${this.baseUrl}${this.controller}/paginated?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            
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
                headers: this.getAuthHeaders(),
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
                headers: this.getAuthHeaders(),
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
            const response = await fetch(`${this.baseUrl}${this.controller}/count?${params}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                }
            );
            
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
            const response = await fetch(`${this.baseUrl}${this.controller}/exists?${params}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                }
            );
            
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error(`Error checking if exists entity: ${error}`);
            return null
        }
    }

    protected serializeFilter(filter: any): Record<string, string> {
        const result: Record<string, string> = {};
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                result[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
            }
        });
        return result;
    }


    protected getAuthHeaders(): Record<string, string> {
        const accesToken = sessionStorage.getItem('accesToken');
        return {
            'Content-Type': 'application/json',
            ...(accesToken ? { 'Authorization': `Bearer ${accesToken}` } : {})
        };
    }
}