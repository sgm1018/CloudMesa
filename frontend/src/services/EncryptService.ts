import { Enviroment } from './../../enviroment';
import { Item } from "../types";

class EncryptService {
  private static instance: EncryptService;
  private constructor() {}

  public static getInstance(): EncryptService {
    if (!EncryptService.instance) {
      EncryptService.instance = new EncryptService();
    }
    return EncryptService.instance;
  }

public async generateKeys(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  console.log('🚀 [1] Starting generateKeys method with ECC...');
  
  try {
    console.log('🔍 [2] Checking crypto availability...');
    
    if (!crypto) {
      console.error('❌ crypto object not available');
      throw new Error('crypto object not available');
    }
    console.log('✅ [3] crypto object available');
    
    if (!crypto.subtle) {
      console.error('❌ crypto.subtle not available');
      throw new Error('crypto.subtle not available');
    }
    console.log('✅ [4] crypto.subtle available');
    
    console.log('🌍 [5] Environment check:');
    console.log('   - URL:', window.location.href);
    console.log('   - Protocol:', window.location.protocol);
    console.log('   - Hostname:', window.location.hostname);
    console.log('   - Secure Context:', window.isSecureContext);
    
    console.log('🔐 [6] Starting ECC key generation...');
    console.log('   - Algorithm: ECDH');
    console.log('   - Named Curve: P-256');
    
    const keyGenerationParams = {
      name: "ECDH",
      namedCurve: "P-256" // También disponibles: P-384, P-521
    };
    
    console.log('📋 [7] Key generation parameters:', keyGenerationParams);
    console.log('🔄 [8] Calling crypto.subtle.generateKey...');
    
    const keyPair = await crypto.subtle.generateKey(
      keyGenerationParams,
      true,
      ["deriveBits", "deriveKey"]
    );
    
    console.log('✅ [9] ECC key generation completed!');
    console.log('🔑 [10] Key pair:', keyPair);
    console.log('   - Public key type:', keyPair.publicKey.type);
    console.log('   - Private key type:', keyPair.privateKey.type);
    
    console.log('📤 [11] Exporting public key...');
    const publicKeyBuffer = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    console.log('✅ [12] Public key exported, buffer size:', publicKeyBuffer.byteLength);
    
    console.log('📤 [13] Exporting private key...');
    const privateKeyBuffer = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    console.log('✅ [14] Private key exported, buffer size:', privateKeyBuffer.byteLength);
    
    console.log('🔄 [15] Converting to base64...');
    const result = {
      publicKey: this.arrayBufferToBase64(publicKeyBuffer),
      privateKey: this.arrayBufferToBase64(privateKeyBuffer),
    };
    console.log('✅ [16] Base64 conversion completed');
    console.log('📏 Public key length:', result.publicKey.length);
    console.log('📏 Private key length:', result.privateKey.length);
    
    console.log('🎉 [17] generateKeys completed successfully with ECC!');
    return result;
    
  } catch (error) {
    console.error('💥 [ERROR] ECC key generation failed at step:', error);
    console.error('📍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`ECC key generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


  public async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
      return await crypto.subtle.importKey(
        "spki",
        keyBuffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,
        ["encrypt"]
      );
    } catch (error) {
      throw new Error(`Failed to import public key: ${error}`);
    }
  }

  public async importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
      return await crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,
        ["decrypt"]
      );
    } catch (error) {
      throw new Error(`Failed to import private key: ${error}`);
    }
  }

  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public async generateAESKey(): Promise<string> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );

      const keyBuffer = await crypto.subtle.exportKey("raw", key);
      return this.arrayBufferToBase64(keyBuffer);
    } catch (error) {
      throw new Error(`AES key generation failed: ${error}`);
    }
  }

  // Método para importar clave AES desde base64
  public async importAESKey(aesKeyBase64: string): Promise<CryptoKey> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(aesKeyBase64);
      return await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        {
          name: "AES-GCM",
        },
        false,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      throw new Error(`Failed to import AES key: ${error}`);
    }
  }

  // Cifrar datos con AES-GCM
  public async encryptWithAES(
    data: string,
    aesKey: CryptoKey
  ): Promise<{ encryptedData: string; iv: string }> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encodedData
      );

      return {
        encryptedData: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv.buffer),
      };
    } catch (error) {
      throw new Error(`AES encryption failed: ${error}`);
    }
  }

  // Descifrar datos con AES-GCM
  public async decryptWithAES(
    encryptedData: string,
    iv: string,
    aesKey: CryptoKey
  ): Promise<string> {
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const ivBuffer = this.base64ToArrayBuffer(iv);

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
        aesKey,
        encryptedBuffer
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`AES decryption failed: ${error}`);
    }
  }

  // Cifrar clave AES con RSA
  public async encryptAESKey(
    aesKeyBase64: string,
    publicKey: CryptoKey
  ): Promise<string> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(aesKeyBase64);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        keyBuffer
      );

      return this.arrayBufferToBase64(encrypted);
    } catch (error) {
      throw new Error(`Failed to encrypt AES key: ${error}`);
    }
  }

  // Descifrar clave AES con RSA
  public async decryptAESKey(
    encryptedKeyBase64: string,
    privateKey: CryptoKey
  ): Promise<string> {
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedKeyBase64);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedBuffer
      );

      return this.arrayBufferToBase64(decrypted);
    } catch (error) {
      throw new Error(`Failed to decrypt AES key: ${error}`);
    }
  }

  public async getPublicKey(): Promise<string> {
    const response = await fetch(`${Enviroment.API_URL}users/publickey`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('accesToken')}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching public key: ${response.statusText}`);
      throw new Error('Failed to fetch public key');
    }
    
    const publicKey = await response.text();
    return publicKey; // Asumiendo que la respuesta tiene formato { publicKey: "..." }
  }

  public async encriptData(item: Item) {
    // TODO: Implementar cifrado completo del item
  }
}

export const encryptService = EncryptService.getInstance();