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