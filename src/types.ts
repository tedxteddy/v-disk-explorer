export type FileType = 'image' | 'video' | 'zip' | 'other';

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  parentId: string | null;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
  ownerId: string;
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
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
  ownerId: string;
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
  timestamp: any; // Firestore Timestamp
}

export interface DemoMessage {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: number;
  simulated: boolean;
}

export interface AppSettings {
  privateMode: boolean;
  hideMetadata: boolean;
  demoChatEnabled: boolean;
  notificationCatchEnabled: boolean;
  autoReplyEnabled: boolean;
  storageLimitMB: number;
}

export interface FileComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
