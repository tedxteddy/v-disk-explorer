import { VirtualFile, VirtualFolder, ChatMessage } from './types';

const STORAGE_KEYS = {
  FILES: 'vdisk_files',
  FOLDERS: 'vdisk_folders',
  CHAT: 'vdisk_chat'
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getFiles(): VirtualFile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILES);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveFile(file: Omit<VirtualFile, 'id' | 'createdAt'>): VirtualFile {
  const files = getFiles();
  const newFile: VirtualFile = { ...file, id: generateId(), createdAt: new Date().toISOString() };
  files.push(newFile);
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  return newFile;
}

export function updateFile(id: string, updates: Partial<VirtualFile>): void {
  const files = getFiles();
  const index = files.findIndex(f => f.id === id);
  if (index !== -1) {
    files[index] = { ...files[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }
}

export function deleteFile(id: string): void {
  const files = getFiles().filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
}

export function getFolders(): VirtualFolder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveFolder(folder: Omit<VirtualFolder, 'id' | 'createdAt'>): VirtualFolder {
  const folders = getFolders();
  const newFolder: VirtualFolder = { ...folder, id: generateId(), createdAt: new Date().toISOString() };
  folders.push(newFolder);
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  return newFolder;
}

export function updateFolder(id: string, updates: Partial<VirtualFolder>): void {
  const folders = getFolders();
  const index = folders.findIndex(f => f.id === id);
  if (index !== -1) {
    folders[index] = { ...folders[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }
}

export function deleteFolder(id: string): void {
  const folders = getFolders().filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}