import React, { createContext, useContext, useState } from 'react';

interface EncryptionContextType {
  publicKey : string | null;
  privateKey : string | null;
  setPublicKey: (state : string | null) => void;
  setPrivateKey: (state : string | null) => void;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const EncryptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const value: EncryptionContextType = {
      publicKey,
      privateKey,
      setPublicKey,
      setPrivateKey,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = (): EncryptionContextType => {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
};