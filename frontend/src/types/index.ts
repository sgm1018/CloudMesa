export type User = {
  _id: string;
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  publicKey: string;
  maxSize: number;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  refreshToken?: RefreshToken;
  createdAt: Date;
  updatedAt: Date;
  userCreator?: string;
  userUpdater?: string;
};


export type RefreshToken = {
  token: string;
  revoked: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export class Entity {
  _id: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  userCreator?: string;
  userUpdater?: string;
};

export type Permission = {
  read: boolean;
  write: boolean;
};

export type SharedConfig = {
  userId: string;
  permissions: Permission;
  dateShared: Date;
  lastAccessed?: Date;
  expiresAt?: Date;
  link?: string;
  encryptedKey: string;
};

export type EncryptedMetadata = {
  name: string;
  mimeType?: string;
  notes?: string;
  username?: string;
  password?: string;
  url?: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type Encryption = {
  iv: string;
  algorithm: string;
  encryptedKey: string;
};

export type ItemType = 'file' | 'folder' | 'password' | 'group';

export type Item = {
  _id: string;
  name: string;
  userId: string;
  type: ItemType;
  parentId?: string;
  encryptedMetadata: EncryptedMetadata;
  encryption: Encryption;
  sharedWith?: SharedConfig[];
  createdAt: Date;
  updatedAt: Date;
  userCreator?: string;
  userUpdater?: string;
  
  // These aren't in the original type but are useful for the UI
  size?: number;
  // path?: string[];
};

export type ViewMode = 'list' | 'grid';