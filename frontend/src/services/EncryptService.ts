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


      const keyPair = nacl.box.keyPair();


      const result = {
        publicKey: this.uint8ArrayToBase64(keyPair.publicKey),
        privateKey: this.uint8ArrayToBase64(keyPair.secretKey),
      };
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

  // Base64 string → ArrayBuffer
  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // ← Retorna ArrayBuffer, no Uint8Array
  }

  async generateAESKey(): Promise<string> {
    try {
      // Generate a 32-byte (256-bit) random key for AES-256
      const aesKey = nacl.randomBytes(32);
      return this.uint8ArrayToBase64(aesKey);
    } catch (error) {
      throw new Error(`Failed to generate AES key: ${error}`);
    }
  }

  async importAESKey(aesKeyBase64: string): Promise<CryptoKey> {
    try {
      const keyBytes = this.base64ToUint8Array(aesKeyBase64);
      return await crypto.subtle.importKey(
        "raw",
        keyBytes,
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

  /* 
    Genero la clave AES.
    Genero secreto comparido => 
        autogenero claves temporales
        genero secreoto compartido con mi clave publica y la clave privada temporal generada 
    Cifrar + autenticar (ChaCha20-Poly1305)
      encripto la clave aes con el nonce y el secreto compartido

    Envio la clave AES encriptada, el nonce y la clave publica terporal al destinatario al destinatario.
    

    Para desencriptar:
       Necesita la clave privada del destinatario y la clave publica temporal del secreto compartido + el nonce (salt para cifrados).

    Ventajas de este enfoque:
        - SI roban la clave privada, no pueden descifrar los mensajes anteriores porque cada mensaje usa una clave publica temporal diferente.
  // Encripto la clave AES con el secreto compartido. (mi clave privada y la clave pública del destinatario)

  // Guardar en la BBDD la clave AES encriptada, el nonce y la clave pública temporal por cada ITEM.
  */
public async encryptAESKey(
    aesKeyBase64: string,
    theirPublicKeyBase64: string
): Promise<{ encrypted: string; nonce: string; ephemeralPublicKey: string }> {
    try {
        const aesKeyBytes = this.base64ToUint8Array(aesKeyBase64);
        const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
        
        // Generar par de claves temporal solo para este cifrado
        const ephemeralKeyPair = nacl.box.keyPair();
        const sharedSecret = nacl.box.before(theirPublicKey, ephemeralKeyPair.secretKey);
        
        const nonce = nacl.randomBytes(24);
        const encrypted = nacl.box.after(aesKeyBytes, nonce, sharedSecret);
        
        if (!encrypted) {
            throw new Error("AES key encryption failed");
        }
        
        return {
            encrypted: this.uint8ArrayToBase64(encrypted),
            nonce: this.uint8ArrayToBase64(nonce),
            ephemeralPublicKey: this.uint8ArrayToBase64(ephemeralKeyPair.publicKey)
        };
    } catch (error) {
        throw new Error(`Failed to encrypt AES key anonymously: ${error}`);
    }
}
  // Descifrar clave AES con NaCl
  public async decryptAESKey(
    encryptedKeyBase64: string,
    nonceBase64: string,
    ephemeralPublicKey: string,
    myPrivateKeyBase64: string
  ): Promise<string> {
    try {
      const encrypted = this.base64ToUint8Array(encryptedKeyBase64);
      const nonce = this.base64ToUint8Array(nonceBase64);
      const theirPublicKey = this.base64ToUint8Array(ephemeralPublicKey);
      const myPrivateKey = this.base64ToUint8Array(myPrivateKeyBase64);

      const decrypted = nacl.box.open(
        encrypted,
        nonce,
        theirPublicKey,
        myPrivateKey
      );

      if (!decrypted) {
        throw new Error("AES key decryption failed - invalid ciphertext or keys");
      }

      return this.uint8ArrayToBase64(decrypted);
    } catch (error) {
      throw new Error(`Failed to decrypt AES key with NaCl: ${error}`);
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

  public async encriptData(item: Item, publicKey: string): Promise<{ encryptedData: string; encryptedAESKey: string; nonce: string; aesNonce: string }> {
    try {
      // 1. Obtener la clave pública del destinatario
      const theirPublicKey = publicKey;
            // 3. Generar clave AES
      const aesKey = await this.generateAESKey();
      
      // 4. Encriptar los datos del item con AES
      this.encryptAESKey()
      
      // 5. Encriptar la clave AES con NaCl usando las claves públicas/privadas
      const encryptedAESResult = await this.encryptAESKey(
        aesKey,
        theirPublicKey,
        myKeys.privateKey
      );
      
      return {
        encryptedData: this.arrayBufferToBase64(encryptedDataBuffer),
        encryptedAESKey: encryptedAESResult.encrypted,
        nonce: encryptedAESResult.nonce,
        aesNonce: this.uint8ArrayToBase64(aesNonce)
      };
    } catch (error) {
      throw new Error(`Failed to encrypt data: ${error}`);
    }
  }
}

export const encryptService = EncryptService.getInstance();
