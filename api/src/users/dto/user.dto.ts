import { Entity } from "src/base/entities/entity";
import { User } from "../entities/user.entity";

export class UserGetDto extends Entity {
    name: string;
    surname: string;
    email: string;
    avatar?: string;
    publicKey: string;
    maxSize: number;
    roles: string[];
    constructor(){
        super();
    }

    static fromUser(user: User): UserGetDto {
        const userGetDto = new UserGetDto();
        userGetDto._id = user._id;
        userGetDto.name = user.name;
        userGetDto.surname = user.surname;
        userGetDto.email = user.email;
        userGetDto.avatar = user.avatar;
        userGetDto.publicKey = user.publicKey;
        userGetDto.maxSize = user.maxSize;
        userGetDto.roles = user.roles;
        return userGetDto;
    }




}