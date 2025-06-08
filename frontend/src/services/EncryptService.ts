import { Enviroment } from "./../../enviroment";
import { Item } from "../types";
import nacl from "tweetnacl";
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
    // console.log('🚀 [1] Starting generateKeys method with TweetNaCl...');

    try {
      // console.log('🔍 [2] Checking TweetNaCl availability...');

      if (!nacl) {
        console.error("❌ TweetNaCl not available");
        throw new Error("TweetNaCl not available");
      }
      // console.log('✅ [3] TweetNaCl available');

      // console.log('🌍 [4] Environment check:');
      // console.log('   - URL:', window.location.href);
      // console.log('   - Protocol:', window.location.protocol);
      // console.log('   - Hostname:', window.location.hostname);
      // console.log('   - Secure Context:', window.isSecureContext);

      // console.log('🔐 [5] Starting NaCl key generation...');
      // console.log('   - Algorithm: Curve25519 (NaCl Box)');
      // console.log('   - Key Length: 32 bytes each');

      // console.log('🔄 [6] Calling nacl.box.keyPair...');

      const keyPair = nacl.box.keyPair();

      // console.log('✅ [7] NaCl key generation completed!');
      // console.log('🔑 [8] Key pair generated');
      // console.log('   - Public key length:', keyPair.publicKey.length, 'bytes');
      // console.log('   - Secret key length:', keyPair.secretKey.length, 'bytes');

      // console.log('🔄 [9] Converting to base64...');
      const result = {
        publicKey: this.uint8ArrayToBase64(keyPair.publicKey),
        privateKey: this.uint8ArrayToBase64(keyPair.secretKey),
      };
      // console.log('✅ [10] Base64 conversion completed');
      // console.log('📏 Public key length:', result.publicKey.length, 'chars');
      // console.log('📏 Private key length:', result.privateKey.length, 'chars');

      // console.log('🎉 [11] generateKeys completed successfully with TweetNaCl!');
      // console.log('🛡️ Security: Curve25519 - High security, fast performance');

      return result;
    } catch (error) {
      console.error("💥 [ERROR] TweetNaCl key generation failed:", error);
      console.error("📍 Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `TweetNaCl key generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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

  public base64ToPem(base64: string, label = "PRIVATE KEY") {
    const lines = [];
    for (let i = 0; i < base64.length; i += 64) {
      lines.push(base64.slice(i, i + 64));
    }
    return `-----BEGIN ${label}-----\n${lines.join(
      "\n"
    )}\n-----END ${label}-----\n`;
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
  public async encryptWithNaCl(
    data: string,
    theirPublicKeyBase64: string,
    myPrivateKeyBase64: string
  ): Promise<{ encrypted: string; nonce: string }> {
    try {
      const messageBytes = new TextEncoder().encode(data);
      const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
      const myPrivateKey = this.base64ToUint8Array(myPrivateKeyBase64);

      const nonce = nacl.randomBytes(24); // 24 bytes para NaCl box
      const encrypted = nacl.box(
        messageBytes,
        nonce,
        theirPublicKey,
        myPrivateKey
      );

      if (!encrypted) {
        throw new Error("Encryption failed");
      }

      return {
        encrypted: this.uint8ArrayToBase64(encrypted),
        nonce: this.uint8ArrayToBase64(nonce),
      };
    } catch (error) {
      throw new Error(`TweetNaCl encryption failed: ${error}`);
    }
  }

  public async decryptWithNaCl(
    encryptedBase64: string,
    nonceBase64: string,
    theirPublicKeyBase64: string,
    myPrivateKeyBase64: string
  ): Promise<string> {
    try {
      const encrypted = this.base64ToUint8Array(encryptedBase64);
      const nonce = this.base64ToUint8Array(nonceBase64);
      const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
      const myPrivateKey = this.base64ToUint8Array(myPrivateKeyBase64);

      const decrypted = nacl.box.open(
        encrypted,
        nonce,
        theirPublicKey,
        myPrivateKey
      );

      if (!decrypted) {
        throw new Error("Decryption failed - invalid ciphertext or keys");
      }

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`TweetNaCl decryption failed: ${error}`);
    }
  }

  // CODIFICAR: Uint8Array → Base64 string
  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
  }

  // DECODIFICAR: Base64 string → Uint8Array
  private base64ToUint8Array(base64: string): Uint8Array {
    return new Uint8Array(
      atob(base64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
  }

  // Tu método actual: Base64 string → ArrayBuffer
  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // ← Retorna ArrayBuffer, no Uint8Array
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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("accesToken")}`,
      },
    });

    if (!response.ok) {
      console.error(`Error fetching public key: ${response.statusText}`);
      throw new Error("Failed to fetch public key");
    }

    const publicKey = await response.text();
    return publicKey; // Asumiendo que la respuesta tiene formato { publicKey: "..." }
  }

  public async encriptData(item: Item) {
    // TODO: Implementar cifrado completo del item
  }
}

export const encryptService = EncryptService.getInstance();
