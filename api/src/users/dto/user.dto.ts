export class UserDto {
    name: string;
    surname: string;
    email: string;
    passwordHash: Uint8Array;  // Solo almacena hash de la contraseña de autenticación
    passwordSalt: Uint8Array;
    avatar?: string;
    publicKey: string;  // Clave pública del usuario (KP)
    maxSize: number;
}