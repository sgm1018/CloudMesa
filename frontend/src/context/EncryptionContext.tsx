import React, { createContext, useContext, useCallback, useRef } from 'react';
import { encryptService } from '../services/EncryptService';

interface Encryption {
  publicKey?: CryptoKey;
  privateKey?: CryptoKey;
  publicKeyB64?: string;
  privateKeyB64?: string;
  timestamp?: number;
}

interface EncryptionContextType {
  getPublicKeyCrypto: (publicKeyBase64: string) => Promise<CryptoKey>;
  getPrivateKeyCrypto: (privateKeyBase64: string) => Promise<CryptoKey>;
  clearKeyCache: () => void;
  isKeyCached: (type: 'public' | 'private', keyBase64: string) => boolean;
  createKeys: () => Promise<{ publicKey: string; privateKey: string }>;
}

const EncrypytionContext = createContext<EncryptionContextType | undefined>(undefined);

const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutos

export const EncriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const EncryptionRef = useRef<Encryption>({});

  const createKeys = async (): Promise<{ publicKey: string; privateKey: string }> => {
    console.log('🔄 Generating new keys')
    const { publicKey, privateKey } = await encryptService.generateKeys();
    getPublicKeyCrypto(publicKey);
    getPrivateKeyCrypto(privateKey);
    return { publicKey, privateKey };
  }
  const isCacheValid = (): boolean => {
    if (!EncryptionRef.current.timestamp) return false;
    return Date.now() - EncryptionRef.current.timestamp < CACHE_EXPIRY_MS;
  };

  const getPublicKeyCrypto = async (publicKeyBase64: string): Promise<CryptoKey> => {
    // Verificar si la clave está cacheada y es válida
    if (
      EncryptionRef.current.publicKeyB64 === publicKeyBase64 &&
      EncryptionRef.current.publicKey &&
      isCacheValid()
    ) {
      console.log('📌 Using cached public key');
      return EncryptionRef.current.publicKey;
    }

    console.log('🔄 Importing new public key');
    // Importar nueva clave
    const publicKey = await encryptService.importPublicKey(publicKeyBase64);
    
    // Actualizar cache
    EncryptionRef.current.publicKey = publicKey;
    EncryptionRef.current.publicKeyB64 = publicKeyBase64;
    EncryptionRef.current.timestamp = Date.now();

    return publicKey;
  };

  const getPrivateKeyCrypto = async (privateKeyBase64: string): Promise<CryptoKey> => {
    // Verificar si la clave está cacheada y es válida
    if (
      EncryptionRef.current.privateKeyB64 === privateKeyBase64 &&
      EncryptionRef.current.privateKey &&
      isCacheValid()
    ) {
      console.log('📌 Using cached private key');
      return EncryptionRef.current.privateKey;
    }

    console.log('🔄 Importing new private key');
    // Importar nueva clave
    const privateKey = await encryptService.importPrivateKey(privateKeyBase64);
    
    // Actualizar cache
    EncryptionRef.current.privateKey = privateKey;
    EncryptionRef.current.privateKeyB64 = privateKeyBase64;
    EncryptionRef.current.timestamp = Date.now();

    return privateKey;
  };

  const clearKeyCache = useCallback(() => {
    // console.log('🧹 Clearing key cache');
    // EncryptionRef.current = {};
  }, []);

  const isKeyCached = (type: 'public' | 'private', keyBase64: string): boolean => {
    if (!isCacheValid()) return false;
    
    if (type === 'public') {
      return EncryptionRef.current.publicKeyB64 === keyBase64 && !!EncryptionRef.current.publicKey;
    } else {
      return EncryptionRef.current.privateKeyB64 === keyBase64 && !!EncryptionRef.current.privateKey;
    }
  };

  // Limpiar cache automáticamente
  // React.useEffect(() => {
  //   const handleBeforeUnload = () => { // Limpiar cache al cerrar la ventana
  //     clearKeyCache();
  //   };

  //   const intervalId = setInterval(() => { 
  //     if (!isCacheValid()) {
  //       clearKeyCache();
  //     }
  //   }, 60000); // Verificar cada minuto

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     clearInterval(intervalId);
  //     clearKeyCache();
  //   };
  // }, []);



  return (
    <EncrypytionContext.Provider value={{ getPublicKeyCrypto, getPrivateKeyCrypto, clearKeyCache, isKeyCached, createKeys }}>
      {children}
    </EncrypytionContext.Provider>
  );
};

export const useKeyCache = (): EncryptionContextType => {
  const context = useContext(EncrypytionContext);
  if (context === undefined) {
    throw new Error('useKeyCache must be used within a KeyCacheProvider');
  }
  return context;
};