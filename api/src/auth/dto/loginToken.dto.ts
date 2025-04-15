import { RefreshToken } from './../../users/entities/RefreshToken.entity';
import { UserGetDto } from 'src/users/dto/user.dto';
import { User } from './../../users/entities/user.entity';
export class LoginTokenDto{
    accessToken : string;
    refreshToken : string;
    user : UserGetDto;  

    constructor() {}

    createFromUser(User : User, AccesToken: string, RefreshToken : string) : LoginTokenDto{
        this.user = UserGetDto.fromUser(User);
        this.accessToken = AccesToken;
        this.refreshToken = RefreshToken;
        return this;
    }
}