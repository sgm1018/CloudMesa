import { UserDto } from "./UserDto";

export class UserLoginDto{    
    accessToken : string = '';
    refreshToken : string = '';
    user : UserDto = new UserDto();  
}