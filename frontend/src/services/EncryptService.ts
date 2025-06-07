
import { webcrypto } from 'crypto';
import { Item } from "../types";

class EncryptService {
    private static instance: EncryptService;
    private constructor(){
    }


    public static getInstance(): EncryptService {
        if (!EncryptService.instance) {
            EncryptService.instance = new EncryptService();
        }
        return EncryptService.instance;
    }

    public async generateKeys(): Promise<{ publicKey: string, privateKey: string }> {
        try {
            // Generate RSA key pair with 2048-bit key size for strong security
            const keyPair = await webcrypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true, // extractable
                ["encrypt", "decrypt"]
            );

            // Export keys to PEM format
            const publicKeyBuffer = await webcrypto.subtle.exportKey("spki", keyPair.publicKey);
            const privateKeyBuffer = await webcrypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            // Convert to base64 strings
            const publicKeyBase64 = this.arrayBufferToBase64(publicKeyBuffer);
            const privateKeyBase64 = this.arrayBufferToBase64(privateKeyBuffer);

            return {
                publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`,
                privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`
            };
        } catch (error) {
            throw new Error(`Key generation failed: ${error}`);
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    public async generateAESKey(): Promise<string> {
        try {
            // Generate AES-256-GCM key using Web Crypto API
            const key = await webcrypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256, // 256-bit key for AES-256
                },
                true, // extractable
                ["encrypt", "decrypt"]
            );

            // Export the key as raw bytes
            const keyBuffer = await webcrypto.subtle.exportKey("raw", key);
            
            // Convert to base64 for storage/transmission
            return this.arrayBufferToBase64(keyBuffer);
        } catch (error) {
            throw new Error(`AES key generation failed: ${error}`);
        }
    }


    public async encriptData(item: Item){

    }
}

export const encryptService = EncryptService.getInstance();