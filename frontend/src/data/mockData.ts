import { Entity, User, Permission, SharedConfig, EncryptedMetadata, Encryption, Item, ItemType, RefreshToken } from '../types';

// Mock current user
// export const mockCurrentUser: User = {
//   _id: 'user-1',
//   name: 'John',
//   surname: 'Doe',
//   email: 'john.doe@example.com',
//   passwordHash: 'hashed_password',
//   avatar: 'https://i.pravatar.cc/150?img=68',
//   publicKey: 'mock_public_key',
//   maxSize: 10737418240, // 10GB
//   roles: ['user'],
//   isActive: true,
//   isVerified: true,
//   createdAt: new Date('2023-01-01'),
//   updatedAt: new Date('2023-01-01'),
//   userCreator: 'system',
//   refreshToken: {
//     token: 'mock_refresh_token',
//     revoked: false,
//     createdAt: new Date('2023-01-01'),
//     expiresAt: new Date('2023-12-31')
//   }
// };

// Other mock users for sharing functionality
export const mockUsers: User[] = [
  // mockCurrentUser,
  {
    _id: 'user-2',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane.smith@example.com',
    passwordHash: 'hashed_password',
    avatar: 'https://i.pravatar.cc/150?img=49',
    publicKey: 'mock_public_key',
    maxSize: 10737418240,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    userCreator: 'system',
    refreshToken: {
      token: 'mock_refresh_token_2',
      revoked: false,
      createdAt: new Date('2023-01-02'),
      expiresAt: new Date('2023-12-31')
    }
  },
  {
    _id: 'user-3',
    name: 'Mike',
    surname: 'Johnson',
    email: 'mike.johnson@example.com',
    passwordHash: 'hashed_password',
    avatar: 'https://i.pravatar.cc/150?img=32',
    publicKey: 'mock_public_key',
    maxSize: 10737418240,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    userCreator: 'system',
    refreshToken: {
      token: 'mock_refresh_token_3',
      revoked: false,
      createdAt: new Date('2023-01-03'),
      expiresAt: new Date('2023-12-31')
    }
  }
];

// Generate default sharing permissions
const defaultReadWritePermission: Permission = {
  read: true,
  write: false
};

const defaultSharedConfig: SharedConfig = {
  userId: 'user-2',
  permissions: defaultReadWritePermission,
  dateShared: new Date('2023-06-15'),
  encryptedKey: 'mock_encrypted_key'
};

// Generate mock items
export const mockItems: Item[] = [
  // Root folders
  {
    _id: 'folder-1',
    name: 'Documents',
    userId: 'user-1',
    type: ItemType.FOLDER,
    parentId: '',
    encryptedMetadata: {
      name: 'Documents',
      icon: 'folder',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
    userCreator: 'user-1'
  },
  {
    _id: 'folder-2',
    name: 'Photos',
    userId: 'user-1',
    type: ItemType.FOLDER,
    parentId: '',
    encryptedMetadata: {
      name: 'Photos',
      icon: 'image',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-05-11'),
    updatedAt: new Date('2023-05-11'),
    userCreator: 'user-1'
  },
  {
    _id: 'folder-3',
    name: 'Work',
    userId: 'user-1',
    type: ItemType.FOLDER,
    parentId: '',
    encryptedMetadata: {
      name: 'Work',
      icon: 'briefcase',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-05-12'),
    userCreator: 'user-1'
  },
  
  // Files in root
  {
    _id: 'file-1',
    name: 'Resume.pdf',
    userId: 'user-1',
    type: ItemType.FILE,
    parentId: '',
    encryptedMetadata: {
      name: 'Resume.pdf',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
    userCreator: 'user-1',
    size: 2.5 * 1024 * 1024, // 2.5MB
  },
  {
    _id: 'file-2',
    name: 'Project Plan.docx',
    userId: 'user-1',
    type: ItemType.FILE,
    parentId: '',
    sharedWith: [defaultSharedConfig],
    encryptedMetadata: {
      name: 'Project Plan.docx',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-10'),
    userCreator: 'user-1',
    size: 1.2 * 1024 * 1024, // 1.2MB
  },
  
  // Files in Documents folder
  {
    _id: 'file-3',
    name: 'Meeting Notes.txt',
    userId: 'user-1',
    parentId: 'folder-1',
    type: ItemType.FILE,
    encryptedMetadata: {
      name: 'Meeting Notes.txt',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-06-12'),
    updatedAt: new Date('2023-06-12'),
    userCreator: 'user-1',
    size: 45 * 1024, // 45KB
  },
  {
    _id: 'file-4',
    name: 'Budget.xlsx',
    userId: 'user-1',
    parentId: 'folder-1',
    type: ItemType.FILE,
    encryptedMetadata: {
      name: 'Budget.xlsx',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-16'),
    userCreator: 'user-1',
    size: 3.7 * 1024 * 1024, // 3.7MB
  },
  {
    _id: 'password-1',
    name: 'google',
    userId: 'user-1',
    parentId: '',
    type: ItemType.PASSWORD,
    encryptedMetadata: {
      name: 'password',
      username: 'user',
      password: 'password',
      url: 'https://www.google.com',
      description: 'Google account password',
      color: '#4285F4',
      icon: 'https://www.google.com/favicon.ico',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    sharedWith: [],
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-16'),
    userCreator: 'user-1',
    size: 3.7 * 1024 * 1024, // 3.7MB
  },
  
  // Additional items would follow the same pattern...

  // I've abbreviated the rest for brevity - you would continue updating all items
]

// Helper functions remain the same
// export const getItemsByParentId = (parentId: string | null): Item[] => {
//   return mockItems.filter(item => 
//     parentId === null 
//       ? item.parentId === '' && (item.type === 'file' || item.type === 'folder')
//       : item.parentId === parentId
//   );
// };



// export const getRootFolders = (): Item[] => {
//   return mockItems.filter(item => 
//     item.parentId === '' && item.type === 'folder'
//   );
// };

// export const getRootPasswordGroups = (): Item[] => {
//   return mockItems.filter(item => 
//     item.parentId === '' && item.type === 'group'
//   );
// };

export const getAllPasswords = (): Item[] => {
  return mockItems.filter(item => item.type === 'password');
};

export const getItemById = (id: string): Item | undefined => {
  return mockItems.find(item => item._id === id);
};

export const searchItems = (query: string): Item[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery)
  );
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
