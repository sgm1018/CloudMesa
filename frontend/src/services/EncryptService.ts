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
  // Genera un par de clave pública-privada y devuelve las claves pública y privada en formato Base64
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



  public base64ToPem(base64: string, label = "PRIVATE KEY") {
    const lines = [];
    for (let i = 0; i < base64.length; i += 64) {
      lines.push(base64.slice(i, i + 64));
    }
    return `-----BEGIN ${label}-----\n${lines.join(
      "\n"
    )}\n-----END ${label}-----\n`;
  }

  public pemToBase64(pemString: string): string {
    // Remove PEM headers and footers, newlines, and spaces
    const base64 = pemString
      .replace(/-----BEGIN [^-]+-----/g, '')
      .replace(/-----END [^-]+-----/g, '')
      .replace(/\s/g, '');
    return base64;
  }


  // // Cifrar datos con NaCl
  // public async encryptWithNaCl(
  //   data: string,
  //   theirPublicKeyBase64: string,
  //   myPrivateKeyBase64: string
  // ): Promise<{ encrypted: string; nonce: string }> {
  //   try {
  //     const messageBytes = new TextEncoder().encode(data);
  //     const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
  //     const myPrivateKey = this.base64ToUint8Array(myPrivateKeyBase64);

  //     const nonce = nacl.randomBytes(24); // 24 bytes para NaCl box
  //     const encrypted = nacl.box(
  //       messageBytes,
  //       nonce,
  //       theirPublicKey,
  //       myPrivateKey
  //     );

  //     if (!encrypted) {
  //       throw new Error("Encryption failed");
  //     }

  //     return {
  //       encrypted: this.uint8ArrayToBase64(encrypted),
  //       nonce: this.uint8ArrayToBase64(nonce),
  //     };
  //   } catch (error) {
  //     throw new Error(`TweetNaCl encryption failed: ${error}`);
  //   }
  // }

  // public async decryptWithNaCl(
  //   encryptedBase64: string,
  //   nonceBase64: string,
  //   theirPublicKeyBase64: string,
  //   myPrivateKeyBase64: string
  // ): Promise<string> {
  //   try {
  //     const encrypted = this.base64ToUint8Array(encryptedBase64);
  //     const nonce = this.base64ToUint8Array(nonceBase64);
  //     const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
  //     const myPrivateKey = this.base64ToUint8Array(myPrivateKeyBase64);

  //     const decrypted = nacl.box.open(
  //       encrypted,
  //       nonce,
  //       theirPublicKey,
  //       myPrivateKey
  //     );

  //     if (!decrypted) {
  //       throw new Error("Decryption failed - invalid ciphertext or keys");
  //     }

  //     return new TextDecoder().decode(decrypted);
  //   } catch (error) {
  //     throw new Error(`TweetNaCl decryption failed: ${error}`);
  //   }
  // }

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


  public async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async generateSymmetricKey(): Promise<string> {
    try {
      // Generate a 32-byte (256-bit) random key for ChaCha20
      const symmetricKey = nacl.randomBytes(32);
      return this.uint8ArrayToBase64(symmetricKey);
    } catch (error) {
      throw new Error(`Failed to generate symmetric key: ${error}`);
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
public async encryptSymmetricKey(
    symmetricKeyBase64: string,
    theirPublicKeyBase64: string
): Promise<{ encrypted: string; nonce: string; ephemeralPublicKey: string }> {
    try {
        const symmetricKeyBytes = this.base64ToUint8Array(symmetricKeyBase64);
        const theirPublicKey = this.base64ToUint8Array(theirPublicKeyBase64);
        
        // Generar par de claves temporal solo para este cifrado

        //mock: generate other random public key
        // const otherPublicKey = nacl.box.keyPair().publicKey;

        const ephemeralKeyPair = nacl.box.keyPair();
        const sharedSecret = nacl.box.before(theirPublicKey, ephemeralKeyPair.secretKey); 
        
        const nonce = nacl.randomBytes(24);
        const encrypted = nacl.box.after(symmetricKeyBytes, nonce, sharedSecret);

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
  public async decryptsymmetricKey(
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

  public async generateEncryptionKeys(_item: Item, publicKey: string): Promise<{ encrypted: string; nonce: string; ephemeralPublicKey: string; symmetricKey: string }> {
    try {
      // 1. Obtener la clave pública del destinatario
      const theirPublicKey = publicKey;
      // 3. Generar clave simétrica
      const symmetricKey = await this.generateSymmetricKey();
      // 4. Encriptar la clave simétrica con el nonce y el secreto compartido
      const { encrypted: encrypted, nonce: nonce, ephemeralPublicKey: ephemeralPublicKey } = await this.encryptSymmetricKey(symmetricKey, theirPublicKey);
      return {
        encrypted: encrypted, 
        nonce: nonce,
        ephemeralPublicKey: ephemeralPublicKey,
        symmetricKey: symmetricKey
      };
    } catch (error) {
      throw new Error(`Failed to encrypt data: ${error}`);
    }
  }


  public async cipherFullFile(file: File, _item: Item, symmetricKey: string): Promise<{ encryptedFile: Uint8Array; nonce: string }> {
    try {
      const fileData = await this.readFileAsArrayBuffer(file);
      
      // 1. Convertir la clave AES de Base64 a Uint8Array
      const key = this.base64ToUint8Array(symmetricKey);
      
      // 2. Generar nonce para secretbox (24 bytes)
      const nonce = nacl.randomBytes(24);
      
      // 3. Convertir ArrayBuffer a Uint8Array
      const fileBytes = new Uint8Array(fileData);
      
      // 4. Cifrar el archivo con NaCl secretbox (ChaCha20-Poly1305)
      const encryptedFile = nacl.secretbox(fileBytes, nonce, key);
      
      if (!encryptedFile) {
        throw new Error("File encryption failed");
      }

      return {
        encryptedFile: encryptedFile,
        nonce: this.uint8ArrayToBase64(nonce)
      };

    } catch (error) {
      throw new Error(`Failed to encrypt full file: ${error}`);
    }
  }

  public async decipherFullFile(
    encryptedFileData: Uint8Array, 
    symmetricKey: string, 
    nonceBase64: string
  ): Promise<Uint8Array> {
    try {
      // 1. Convertir la clave AES de Base64 a Uint8Array
      const key = this.base64ToUint8Array(symmetricKey);
      
      // 2. Convertir nonce de Base64 a Uint8Array
      const nonce = this.base64ToUint8Array(nonceBase64);
      
      // 3. Descifrar el archivo con NaCl secretbox
      const decryptedFile = nacl.secretbox.open(encryptedFileData, nonce, key);
      
      if (!decryptedFile) {
        throw new Error("File decryption failed - invalid ciphertext or key");
      }

      return decryptedFile;
      
    } catch (error) {
      throw new Error(`Failed to decrypt full file: ${error}`);
    }
  }

  public uint8ArrayToBinary(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
      .map((byte) => String.fromCharCode(byte))
      .join("");
  }

  // Cifrar los metadatos del item con la misma clave AES
  public async cipherItemMetadata(item: Item, symmetricKey: string): Promise<{ encryptedMetadata: string; nonce: string }> {
    try {
      // 1. Convertir la clave AES de Base64 a Uint8Array
      const key = this.base64ToUint8Array(symmetricKey);
      
      // 2. Generar nonce para secretbox (24 bytes)
      const nonce = nacl.randomBytes(24);
      
      // 3. Serializar los metadatos a JSON
      const metadataString = JSON.stringify(item.encryptedMetadata);
      const metadataBytes = new TextEncoder().encode(metadataString);
      
      // 4. Cifrar los metadatos con NaCl secretbox
      const encryptedMetadata = nacl.secretbox(metadataBytes, nonce, key);

      if (!encryptedMetadata) {
        throw new Error("Metadata encryption failed");
      }

      return {
        encryptedMetadata: this.uint8ArrayToBase64(encryptedMetadata),
        nonce: this.uint8ArrayToBase64(nonce)
      };

    } catch (error) {
      throw new Error(`Failed to encrypt item metadata: ${error}`);
    }
  }

  // Descifrar los metadatos del item
  public async decipherItemMetadata(
    encryptedMetadataBase64: string, 
    symmetricKey: string, 
    nonceBase64: string
  ): Promise<any> {
    try {
      // 1. Convertir la clave AES de Base64 a Uint8Array
      const key = this.base64ToUint8Array(symmetricKey);
      
      // 2. Convertir datos cifrados y nonce de Base64
      const encryptedMetadata = this.base64ToUint8Array(encryptedMetadataBase64);
      const nonce = this.base64ToUint8Array(nonceBase64);
      
      // 3. Descifrar los metadatos
      const decryptedMetadata = nacl.secretbox.open(encryptedMetadata, nonce, key);
      
      if (!decryptedMetadata) {
        throw new Error("Metadata decryption failed - invalid ciphertext or key");
      }

      // 4. Convertir de bytes a string y parsear JSON
      const metadataString = new TextDecoder().decode(decryptedMetadata);
      return JSON.parse(metadataString);
      
    } catch (error) {
      throw new Error(`Failed to decrypt item metadata: ${error}`);
    }
  }

  // Método completo para cifrar archivo y metadatos con la misma clave AES
  public async encryptFileAndMetadata(
    file: File, 
    item: Item, 
    publicKey: string
  ): Promise<{
    encryptedFileBlob: Blob;
    encryptedSymmetricKey: string;
    keyNonce: string;
    ephemeralPublicKey: string;
    fileNonce: string;
    encryptedMetadata: string;
    metadataNonce: string;
  }> {
    try {
      // 1. Generar claves de cifrado (clave AES + cifrarla con la clave pública)
      const { encrypted, nonce: keyNonce, ephemeralPublicKey, symmetricKey } = await this.generateEncryptionKeys(item, publicKey);
      
      // 2. Cifrar el archivo con la clave AES
      const { encryptedFile, nonce: fileNonce } = await this.cipherFullFile(file, item, symmetricKey);
      
      // 3. Cifrar los metadatos del item con la misma clave simetrica
      const { encryptedMetadata, nonce: metadataNonce } = await this.cipherItemMetadata(item, symmetricKey);
      
      // 4. Convertir archivo cifrado a Blob para envío
      const encryptedFileBlob = new Blob([new Uint8Array(encryptedFile)], { type: 'application/octet-stream' });
      
      return {
        encryptedFileBlob,           // Archivo cifrado listo para envío
        encryptedSymmetricKey: encrypted,  // Clave AES cifrada con clave pública
        keyNonce,                    // Nonce para descifrar la clave AES
        ephemeralPublicKey,          // Clave pública temporal
        fileNonce,                   // Nonce para descifrar el archivo
        encryptedMetadata,           // Metadatos cifrados
        metadataNonce               // Nonce para descifrar metadatos
      };
      
    } catch (error) {
      throw new Error(`Failed to encrypt file and metadata: ${error}`);
    }
  }

  // Método de utilidad para convertir ArrayBuffer cifrado a Blob para envío al servidor
  public arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string = 'application/octet-stream'): Blob {
    return new Blob([buffer], { type: mimeType });
  }

  // Método de utilidad para crear un archivo descargable desde ArrayBuffer
  public createDownloadableFile(
    buffer: ArrayBuffer, 
    filename: string, 
    mimeType: string = 'application/octet-stream'
  ): File {
    const blob = this.arrayBufferToBlob(buffer, mimeType);
    return new File([blob], filename, { type: mimeType });
  }

  // Método completo para cifrar archivo y preparar para upload
  public async encryptFileForUpload(
    file: File, 
    item: Item, 
    publicKey: string
  ): Promise<{
    encryptedFileBlob: Blob;
    encryptedSymmetricKey: string;
    nonce: string;
    ephemeralPublicKey: string;
    fileNonce: string;
  }> {
    try {
      // 1. Generar claves de cifrado
      const { encrypted, nonce, ephemeralPublicKey, symmetricKey } = await this.generateEncryptionKeys(item, publicKey);
      
      // 2. Cifrar el archivo
      const { encryptedFile, nonce: fileNonce } = await this.cipherFullFile(file, item, symmetricKey);
      
      // 3. Convertir a Blob para envío (de Uint8Array a Blob)
      const encryptedFileBlob = new Blob([new Uint8Array(encryptedFile)], { type: 'application/octet-stream' });
      
      return {
        encryptedFileBlob,
        encryptedSymmetricKey: encrypted,
        nonce,
        ephemeralPublicKey,
        fileNonce: fileNonce
      };
      
    } catch (error) {
      throw new Error(`Failed to encrypt file for upload: ${error}`);
    }
  }
}

export const encryptService = EncryptService.getInstance();
