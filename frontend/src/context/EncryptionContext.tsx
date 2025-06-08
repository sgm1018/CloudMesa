import React, { createContext, useContext, useCallback, useRef, useState } from 'react';



interface EncryptionContextType {
  publicKey : string | null;
  privateKey : string | null;
  setPublicKey: (state : string | null) => void;
  setPrivateKey: (state : string | null) => void;

}

const EncrypytionContext = createContext<EncryptionContextType | undefined>(undefined);


export const EncriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);


  const value: EncryptionContextType = {
      publicKey,
      privateKey,
      setPublicKey,
      setPrivateKey,
  };

  return (
    <EncrypytionContext.Provider value={value}>
      {children}
    </EncrypytionContext.Provider>
  );
};

export const useEncryption = (): EncryptionContextType => {
  const context = useContext(EncrypytionContext);
  if (context === undefined) {
    throw new Error('useKeyCache must be used within a KeyCacheProvider');
  }
  return context;
};