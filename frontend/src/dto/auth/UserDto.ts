import { Entity } from "../../types";

    export class UserDto extends Entity{
        name: string= '';
        surname: string= '';
        email: string= '';
        avatar?: string= '';
        publicKey: string= '';
        maxSize: number= 0;
        roles: string[]= [];
    }