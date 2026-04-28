export type FileType = 'image' | 'video' | 'zip' | 'other';

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  ownerName?: string;
  permissions?: string[];
  sharedWith?: {
    [userId: string]: {
      email: string;
      role: 'viewer' | 'editor';
    };
  };
}

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  ownerName?: string;
  sharedWith?: {
    [userId: string]: {
      email: string;
      role: 'viewer' | 'editor';
    };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface FileComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface StorageErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}