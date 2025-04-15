import { Entity } from "../../entities/Entity";

export interface UserGetDto extends Entity {
    name: string;
    surname: string;
    email: string;
    avatar?: string;
    publicKey: string;
    maxSize: number;
    roles: string[];
}