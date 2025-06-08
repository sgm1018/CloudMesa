import { User } from "../types";
import { BaseService, PaginationParams } from "./BaseService";

class UserService extends BaseService{

    private static instance: UserService;
    private constructor(controller : string){
        super(controller);
    }


    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService("users");
        }
        return UserService.instance;
    }

    public async updatePublicKey(publicKey: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.baseUrl}/publicKey`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
                },
                body: JSON.stringify({ publicKey }),
            });
            if (!response.ok) {
                console.error(`Error updating public key: ${response.statusText}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating public key: ${error}`);
            return null;
        }
    }



    async findUsersPaginated(paginationParams: PaginationParams) {
        const url = new URL(`${this.baseUrl}`);
        url.searchParams.append('page', paginationParams.page!.toString());
        url.searchParams.append('limit', paginationParams.limit!.toString());
        
        return await fetch(url.toString(), {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
            }
        });
    }


}
export const userService = UserService.getInstance();