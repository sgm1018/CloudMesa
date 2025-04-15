import { UserGetDto } from "../user/UserGetDto";

export interface LoginTokenDto{
    accessToken : string;
    refreshToken : string;
    user : UserGetDto;  
}