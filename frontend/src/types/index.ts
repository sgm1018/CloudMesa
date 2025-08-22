
export class Entity {
  _id: string = '';
  createdAt: Date = new Date();
  updatedAt?: Date;
  userCreator?: string;
  userUpdater?: string;
};

export class User extends Entity {
  name!: string;
  surname!: string;
  email!: string;
  passwordHash!: string;
  avatar!: string;
  publicKey!: string;
  maxSize!: number;
  roles!: string[];
  isActive!: boolean;
  isVerified!: boolean;
  refreshToken?: RefreshToken;
};

export class RefreshToken {
  token!: string;
  revoked!: boolean;
  createdAt!: Date;
  expiresAt!: Date;
};


export class Permission {
  read: boolean = false;
  write: boolean = false;
};

export class SharedConfig {
  userId!: string;
  permissions!: Permission;
  dateShared!: Date;
  lastAccessed?: Date;
  expiresAt?: Date;
  link?: string;
  encryptedKey!: string;
};

export class EncryptedMetadata {
  name?: string;
  notes?: string;
  username?: string;
  password?: string;
  url?: string;
  description?: string;
  color?: string;
  icon?: string;
};

export class Encryption {
    
    encryptedKey?: string;  // Clave de cifrado simétrico en base64
    ephemeralPublicKey?: string;  // Needed for shared secret generation 
    keyNonce?: string;  // Needed for chcha20 + poly1305 to decrypt encriptedKey
    metadataNonce?: string;  // Needed for decrypt metadata
    fileNonce?: string; // Needed for decrypt file
};

export enum ItemType {
  FILE = 'file',
  FOLDER = 'folder',
  PASSWORD = 'password',
  GROUP = 'group'
}

export class Item extends Entity {
    userId!: string;
  type!: ItemType;
  parentId: string = '';
  encryptedMetadata!: EncryptedMetadata;
  encryption!: Encryption;
  sharedWith: SharedConfig[] = [];
  // These aren't in the original type but are useful for the UI
  size?: number;
  // path?: string[];
};

export type ViewMode = 'list' | 'grid';