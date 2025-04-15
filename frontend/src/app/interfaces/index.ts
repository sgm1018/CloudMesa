export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedDate: Date;
  selected: boolean;
  shared: boolean;
  owner: string;
  sharedWith?: string[];
  parentId?: string;
  mimeType?: string;
  path: string;
}

export interface ShareSettings {
  id: string;
  fileId: string;
  type: 'public' | 'protected' | 'private';
  password?: string;
  expiresAt?: Date;
  allowedUsers?: string[];
  link?: string;
  permissions?: 'read' | 'write';
  notifyByEmail?: boolean;
}

export interface StorageQuota {
  used: number;
  total: number;
  unit: 'MB' | 'GB' | 'TB';
}

export interface SearchResult {
  type: 'password' | 'file' | 'folder' | 'password-group';
  item: FileItem | PasswordEntry | PasswordGroup;
  matchScore: number;
  icon: string;
}

export interface FileOperation {
  type: 'move' | 'copy' | 'delete' | 'share';
  sourceIds: string[];
  targetId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface PasswordGroup {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  ownerId?: string;
  sharedWith?: PasswordShare[];
}

export interface PasswordShare {
  userId: string;
  accessLevel: 'view' | 'edit';
  expiresAt?: Date;
  createdAt: Date;
  lastAccessed?: Date;
}

export interface PasswordEntry {
  id: string;
  groupId?: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  ownerId: string;
  sharedWith?: PasswordShare[];
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface ShareActivity {
  id: string;
  itemId: string;
  itemType: 'password' | 'group';
  action: 'shared' | 'unshared' | 'accessed';
  userId: string;
  targetUserId: string;
  timestamp: Date;
  details?: string;
}

export interface TabInfo {
  id: string;
  label: string;
  icon: string;
}

export interface SearchFilters {
  types: ('password' | 'file' | 'folder' | 'password-group')[];
  query: string;
  owner?: string;
  shared?: boolean;
}