import { User } from '../types';

// Función para formatear el tamaño de archivos
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Usuarios mock para el ShareModal
export const mockUsers: User[] = [
  {
    _id: '1',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    avatar: '',
    passwordHash: '',
    publicKey: '',
    maxSize: 0,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    _id: '2',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane.smith@example.com',
    avatar: '',
    passwordHash: '',
    publicKey: '',
    maxSize: 0,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    _id: '3',
    name: 'Bob',
    surname: 'Johnson',
    email: 'bob.johnson@example.com',
    avatar: '',
    passwordHash: '',
    publicKey: '',
    maxSize: 0,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    _id: '4',
    name: 'Alice',
    surname: 'Wilson',
    email: 'alice.wilson@example.com',
    avatar: '',
    passwordHash: '',
    publicKey: '',
    maxSize: 0,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    _id: '5',
    name: 'Charlie',
    surname: 'Brown',
    email: 'charlie.brown@example.com',
    avatar: '',
    passwordHash: '',
    publicKey: '',
    maxSize: 0,
    roles: ['user'],
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
  }
];