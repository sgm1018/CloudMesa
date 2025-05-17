import { Item, User, Permission, SharedConfig } from '../types';

// Mock current user
export const mockCurrentUser: User = {
  _id: 'user-1',
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  passwordHash: 'hashed_password',
  avatar: 'https://i.pravatar.cc/150?img=68',
  publicKey: 'mock_public_key',
  maxSize: 10737418240, // 10GB
  roles: ['user'],
  isActive: true,
  isVerified: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
};

// Other mock users for sharing functionality
export const mockUsers: User[] = [
  mockCurrentUser,
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
    updatedAt: new Date('2023-01-02')
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
    updatedAt: new Date('2023-01-03')
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
    type: 'folder',
    encryptedMetadata: {
      name: 'Documents',
      icon: 'folder',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
    // // path: []
  },
  {
    _id: 'folder-2',
    name: 'Photos',
    userId: 'user-1',
    type: 'folder',
    encryptedMetadata: {
      name: 'Photos',
      icon: 'image',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-05-11'),
    updatedAt: new Date('2023-05-11'),
    // // path: []
  },
  {
    _id: 'folder-3',
    name: 'Work',
    userId: 'user-1',
    type: 'folder',
    encryptedMetadata: {
      name: 'Work',
      icon: 'briefcase',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-05-12'),
    // // path: []
  },
  
  // Files in root
  {
    _id: 'file-1',
    name: 'Resume.pdf',
    userId: 'user-1',
    type: 'file',
    encryptedMetadata: {
      name: 'Resume.pdf',
      mimeType: 'application/pdf',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
    size: 2.5 * 1024 * 1024, // 2.5MB
    // // path: []
  },
  {
    _id: 'file-2',
    name: 'Project Plan.docx',
    userId: 'user-1',
    type: 'file',
    sharedWith: [defaultSharedConfig],
    encryptedMetadata: {
      name: 'Project Plan.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-10'),
    size: 1.2 * 1024 * 1024, // 1.2MB
    // // path: []
  },
  
  // Files in Documents folder
  {
    _id: 'file-3',
    name: 'Meeting Notes.txt',
    userId: 'user-1',
    parentId: 'folder-1',
    type: 'file',
    encryptedMetadata: {
      name: 'Meeting Notes.txt',
      mimeType: 'text/plain',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-06-12'),
    updatedAt: new Date('2023-06-12'),
    size: 45 * 1024, // 45KB
    // // path: ['Documents']
  },
  {
    _id: 'file-4',
    name: 'Budget.xlsx',
    userId: 'user-1',
    parentId: 'folder-1',
    type: 'file',
    encryptedMetadata: {
      name: 'Budget.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-16'),
    size: 3.7 * 1024 * 1024, // 3.7MB
    // // path: ['Documents']
  },
  
  // Files in Photos folder
  {
    _id: 'file-5',
    name: 'Vacation.jpg',
    userId: 'user-1',
    parentId: 'folder-2',
    type: 'file',
    encryptedMetadata: {
      name: 'Vacation.jpg',
      mimeType: 'image/jpeg',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-07-01'),
    size: 4.8 * 1024 * 1024, // 4.8MB
    // path: ['Photos']
  },
  {
    _id: 'file-6',
    name: 'Family.png',
    userId: 'user-1',
    parentId: 'folder-2',
    type: 'file',
    encryptedMetadata: {
      name: 'Family.png',
      mimeType: 'image/png',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2023-07-05'),
    size: 2.1 * 1024 * 1024, // 2.1MB
    // path: ['Photos']
  },
  
  // Nested folder in Work
  {
    _id: 'folder-4',
    name: 'Project X',
    userId: 'user-1',
    parentId: 'folder-3',
    type: 'folder',
    encryptedMetadata: {
      name: 'Project X',
      icon: 'folder',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    // path: ['Work']
  },
  
  // Files in Project X folder
  {
    _id: 'file-7',
    name: 'Presentation.pptx',
    userId: 'user-1',
    parentId: 'folder-4',
    type: 'file',
    encryptedMetadata: {
      name: 'Presentation.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2023-07-10'),
    size: 8.3 * 1024 * 1024, // 8.3MB
    // path: ['Work', 'Project X']
  },
  
  // Password groups
  {
    _id: 'group-1',
    name: 'Personal',
    userId: 'user-1',
    type: 'group',
    encryptedMetadata: {
      name: 'Personal',
      icon: 'lock',
      color: '#6366f1', // primary color
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2023-08-01'),
    // // path: []
  },
  {
    _id: 'group-2',
    name: 'Work',
    userId: 'user-1',
    type: 'group',
    encryptedMetadata: {
      name: 'Work',
      icon: 'briefcase',
      color: '#10b981', // success color
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-02'),
    updatedAt: new Date('2023-08-02'),
    // // path: []
  },
  
  // Passwords in Personal group
  {
    _id: 'password-1',
    name: 'Gmail',
    userId: 'user-1',
    parentId: 'group-1',
    type: 'password',
    encryptedMetadata: {
      name: 'Gmail',
      icon: 'mail',
      username: 'john.doe@gmail.com',
      password: 'P@$$w0rd123',
      url: 'https://mail.google.com',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2023-08-10'),
    // path: ['Personal']
  },
  {
    _id: 'password-2',
    name: 'Amazon',
    userId: 'user-1',
    parentId: 'group-1',
    type: 'password',
    encryptedMetadata: {
      name: 'Amazon',
      icon: 'shopping-cart',
      username: 'john.doe@example.com',
      password: 'Am@z0n$ecure!',
      url: 'https://www.amazon.com',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-11'),
    updatedAt: new Date('2023-08-11'),
    // path: ['Personal']
  },
  
  // Passwords in Work group
  {
    _id: 'password-3',
    name: 'Company Portal',
    userId: 'user-1',
    parentId: 'group-2',
    type: 'password',
    encryptedMetadata: {
      name: 'Company Portal',
      icon: 'building',
      username: 'jdoe',
      password: 'C0mp@ny2023!',
      url: 'https://portal.company.com',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15'),
    // path: ['Work']
  },
  {
    _id: 'password-4',
    name: 'Jira',
    userId: 'user-1',
    parentId: 'group-2',
    type: 'password',
    encryptedMetadata: {
      name: 'Jira',
      icon: 'trello',
      username: 'john.doe',
      password: 'J!r@2023Secure',
      url: 'https://company.atlassian.net',
    },
    encryption: {
      iv: 'mock_iv',
      algorithm: 'AES-GCM',
      encryptedKey: 'mock_encrypted_key'
    },
    createdAt: new Date('2023-08-16'),
    updatedAt: new Date('2023-08-16'),
    // path: ['Work']
  }
];

// Helper function to get items by parent ID
export const getItemsByParentId = (parentId: string | null): Item[] => {
  return mockItems.filter(item => 
    parentId === null 
      ? item.parentId === undefined && (item.type === 'file' || item.type === 'folder')
      : item.parentId === parentId
  );
};

// Helper function to get root folders
export const getRootFolders = (): Item[] => {
  return mockItems.filter(item => 
    item.parentId === undefined && item.type === 'folder'
  );
};

// Helper function to get root password groups
export const getRootPasswordGroups = (): Item[] => {
  return mockItems.filter(item => 
    item.parentId === undefined && item.type === 'group'
  );
};

// Helper function to get all passwords
export const getAllPasswords = (): Item[] => {
  return mockItems.filter(item => item.type === 'password');
};

// Helper function to get item by ID
export const getItemById = (id: string): Item | undefined => {
  return mockItems.find(item => item._id === id);
};

// Helper function to search items
export const searchItems = (query: string): Item[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery)
  );
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};