import { log } from "console";
import { Enviroment } from "../../enviroment";
import { LoginDto } from "../dto/auth/Login.dto";
import { RefreshTokenDto } from "../dto/auth/RefreshTokenDto";
import { RegisterDto } from "../dto/auth/Register.dto";
import { UserLoginDto } from "../dto/auth/UserLoginDto";
import { RefreshToken } from "../types";
import { encryptService } from "./EncryptService";
import { userService } from "./UserService";
class AuthService {
    public static instance: AuthService;
    private controller: string;
    
    private constructor(){
        this.controller = "auth";
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(email: string, password: string): Promise<UserLoginDto | null> {


        if (!email || !password) {
            throw new Error('Please enter both email and password');
        }
        try{
            const loginDto = new LoginDto();
            loginDto.email = email;
            loginDto.password = password;
            const response = await fetch(`${Enviroment.API_URL}${this.controller}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginDto),
            });
            
            if (!response.ok) throw new Error(response.statusText);
            const user : UserLoginDto = await response.json();
            sessionStorage.setItem('accesToken', user.accessToken);
            sessionStorage.setItem('refreshToken', user.refreshToken);
            return user;
            
        }catch( error : any){
            console.error('Login error:', error);
            return null;
        }
    }
    async register(name: string, surname: string, email: string, password: string): Promise<UserLoginDto | null> {
        if (!name || !surname || !email || !password) {
            throw new Error('Please fill in all fields');
        }
        try{
            const registerDto = new RegisterDto();
            registerDto.name = name;
            registerDto.surname = surname;
            registerDto.email = email;
            registerDto.password = password;
            const {publicKey, privateKey} = await encryptService.generateKeys(); 
            // const {publicKey, privateKey, keySize} = await encryptService.generateKeysWithWorker();
            registerDto.publicKey = publicKey; // Assuming publicKey is optional or not used in this demo
            const response = await fetch(`${Enviroment.API_URL}${this.controller}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, surname, email, password , publicKey }),
            });
            
            if (!response.ok) throw new Error(response.statusText);

            // await userService.updatePublicKey(publicKey);
            

            console.log('User registered successfully');
            const user: UserLoginDto = await response.json();
            sessionStorage.setItem('accesToken', user.accessToken);
            sessionStorage.setItem('refreshToken', user.refreshToken);
            return user;

        }catch(error){
            console.error('Registration error:', error);
            return null;
        }
    
    }

    async logout(): Promise<void> {

        const refreshTokenDto : RefreshTokenDto = new RefreshTokenDto();
        refreshTokenDto.refreshToken = sessionStorage.getItem('refreshToken') || '';
        const response =    await fetch(`${Enviroment.API_URL}${this.controller}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}` },
            body: JSON.stringify(refreshTokenDto),
        });
        if (!response.ok) {
            console.error(`Error logging out: ${response.statusText}`);
        }
        sessionStorage.removeItem('accesToken'); 
        sessionStorage.removeItem('refreshToken'); 
        window.location.href = '/login';
    }


}

export const authService = AuthService.getInstance();