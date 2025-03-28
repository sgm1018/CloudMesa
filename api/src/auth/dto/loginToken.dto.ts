import { User } from './../../users/entities/user.entity';
export class LoginTokenDto{
    name: string;
    surname: string;
    email: string;
    publicKey: string;
    maxSize: number;
    token: string;

    constructor() {}

    createFromUser(User : User, token: string) : LoginTokenDto{
        this.name = User.name;
        this.surname = User.surname;
        this.email = User.email;
        this.publicKey = User.publicKey;
        this.maxSize = User.maxSize;
        this.token = token;
        return this;
    }
}