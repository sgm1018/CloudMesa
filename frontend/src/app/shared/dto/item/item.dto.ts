import { Entity } from "../../entities/Entity";

export interface ItemDto extends Entity{
    name: string; 
    userId: string;
    type: 'file' | 'folder' | 'password' | 'group';
    parentId?: string;
    encryptedMetadata: EncryptedMetadata;
    encryption: Encryption;
    sharedWith?: SharedConfig[];
}

export interface EncryptedMetadata  {
    name: string;  // Encrypted name in base64
    mimeType?: string;  // Encrypted MIME type in base64
    notes?: string;  // Encrypted notes in base64
    username?: string;  // Encrypted username in base64
    password?: string;  // Encrypted password in base64
    url?: string;  // Encrypted URL in base64
    description?: string;  // Encrypted description in base64
    color?: string;  // Encrypted color in base64
    icon?: string;  // Encrypted icon in base64
}

export interface Encryption {
    iv: string;  // Vector de inicialización para AES-256-GCM
    algorithm: string;
    encryptedKey: string;  // Clave de cifrado simétrico en base64

}
export interface Permission {
    read: boolean;
    write: boolean;
}
export interface SharedConfig {
    userId: string;
    permissions: Permission;
    dateShared: Date;
    lastAccessed?: Date;
    expiresAt?: Date;
    link?: string;
    encryptedKey: string;  // Clave de cifrado simétrico en base64
}