import React, { useState, useEffect } from 'react';
import { VirtualFile, VirtualFolder, FileType } from '../types';
import { formatBytes } from '../utils';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  Video, 
  Archive, 
  Trash2, 
  Home,
  Search,
  Upload,
  FolderPlus,
  Disc,
  Cpu,
  Share2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { ShareModal } from './ShareModal';
import { ContextMenu } from './ContextMenu';
import { getFiles, saveFile, updateFile, deleteFile, getFolders, saveFolder, updateFolder, deleteFolder } from '../localStorage';

interface FileExplorerProps {
  onFileSelect: (file: VirtualFile) => void;
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [shareItem, setShareItem] = useState<VirtualFile | VirtualFolder | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: VirtualFile | VirtualFolder } | null>(null);
  const [renamingItem, setRenamingItem] = useState<{ id: string, name: string, type: 'file' | 'folder' } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');
  const [filterSize, setFilterSize] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFiles(getFiles());
    setFolders(getFolders());
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    saveFolder({
      name: newFolderName,
      parentId: currentFolderId,
      ownerId: 'local',
      ownerName: 'Local User'
    });
    setNewFolderName('');
    setIsAddingFolder(false);
    loadData();
  };

  const handleDeleteFile = (id: string) => {
    deleteFile(id);
    loadData();
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    loadData();
  };

  const handleRename = () => {
    if (!renamingItem || !renamingItem.name.trim()) return;
    
    if (renamingItem.type === 'file') {
      updateFile(renamingItem.id, { name: renamingItem.name });
    } else {
      updateFolder(renamingItem.id, { name: renamingItem.name });
    }
    setRenamingItem(null);
    loadData();
  };

  const handleContextMenu = (e: React.MouseEvent, item: VirtualFile | VirtualFolder) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const navigateToFolder = (folder: VirtualFolder | null) => {
    setSearchQuery('');
    if (!folder) {
      setCurrentFolderId(null);
      setBreadcrumb([{ id: null, name: 'Root' }]);
    } else {
      setCurrentFolderId(folder.id);
      const index = breadcrumb.findIndex(b => b.id === folder.id);
      if (index !== -1) {
        setBreadcrumb(breadcrumb.slice(0, index + 1));
      } else {
        setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
      }
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'zip': return <Archive className="w-5 h-5 text-orange-400" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const filterFiles = (fileList: VirtualFile[]) => {
    return fileList.filter(f => {
      const matchesSearch = searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : (f.parentId === currentFolderId);
      if (!matchesSearch) return false;

      if (filterType !== 'all' && f.type !== filterType) return false;

      if (filterSize !== 'all') {
        const sizeMB = f.size / (1024 * 1024);
        if (filterSize === 'small' && sizeMB > 1) return false;
        if (filterSize === 'medium' && (sizeMB <= 1 || sizeMB > 10)) return false;
        if (filterSize === 'large' && sizeMB <= 10) return false;
      }

      if (filterDate !== 'all') {
        const fileDate = f.createdAt ? new Date(f.createdAt).getTime() : 0;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (filterDate === 'today' && now - fileDate > oneDay) return false;
        if (filterDate === 'week' && now - fileDate > oneDay * 7) return false;
        if (filterDate === 'month' && now - fileDate > oneDay * 30) return false;
      }

      return true;
    });
  };

  const displayFiles = filterFiles(files);

  const displayFolders = searchQuery
    ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : folders.filter(f => f.parentId === currentFolderId);

  const addFileToDisk = (name: string, type: FileType, size: number, url: string) => {
    saveFile({
      name,
      type,
      size,
      url,
      parentId: currentFolderId,
      ownerId: 'local',
      ownerName: 'Local User',
      permissions: ['owner', 'read', 'write', 'delete']
    });
    loadData();
  };

  const handleRandomUpload = () => {
    const randomTypes: FileType[] = ['image', 'video', 'zip', 'other'];
    const type = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    const names = {
      image: ['vacation.jpg', 'profile.png', 'screenshot.webp'],
      video: ['movie.mp4', 'tutorial.mov', 'clip.avi'],
      zip: ['backup.zip', 'project.rar', 'source.7z'],
      other: ['notes.txt', 'budget.xlsx', 'resume.pdf']
    };
    const name = names[type][Math.floor(Math.random() * names[type].length)];
    const url = type === 'image' 
      ? `https://picsum.photos/seed/${Math.random().toString(36)}/800/600`
      : 'https://example.com/mock-file-' + Math.random().toString(36);
    
    addFileToDisk(name, type, Math.floor(Math.random() * 50000000), url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: FileType = 'other';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.includes('zip') || file.name.endsWith('.zip')) type = 'zip';

    const url = URL.createObjectURL(file);
    addFileToDisk(file.name, type, file.size, url);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    for (const file of droppedFiles) {
      let type: FileType = 'other';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.includes('zip') || file.name.endsWith('.zip')) type = 'zip';

      const url = URL.createObjectURL(file);
      addFileToDisk(file.name, type, file.size, url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-hw-bg text-hw-text font-mono selection:bg-hw-primary/30">
      <div className="p-3 sm:p-4 border-b border-hw-border flex flex-col lg:flex-row items-start lg:items-center justify-between bg-hw-surface-light shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-20 gap-3">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-black/20 rounded border border-hw-border shrink-0">
            <Disc className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-hw-accent animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-hw-accent/80 hidden sm:inline">Local.Storage</span>
          </div>
          
          <div className="relative flex-1 min-w-0 group">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20 group-focus-within:opacity-100 group-focus-within:text-hw-primary transition-all" />
            <input
              type="text"
              placeholder="Query sectors..."
              className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 bg-black/40 border border-hw-border rounded text-[10px] sm:text-[10px] font-bold focus:outline-none focus:border-hw-primary/50 transition-all uppercase placeholder:text-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors",
                isFilterOpen || filterType !== 'all' || filterSize !== 'all' || filterDate !== 'all' ? "text-hw-primary bg-hw-primary/10" : "text-hw-text-dim hover:text-white"
              )}
            >
              <Filter className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-black/20 rounded border border-hw-border">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => document.getElementById('file-upload')?.click()}
              className="hw-button flex items-center gap-1.5 sm:gap-2 bg-transparent border-none hover:bg-white/5 px-2 sm:px-3"
              title="Upload to Sector"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[9px] sm:text-[10px]">Upload</span>
            </button>
            <button 
              onClick={handleRandomUpload}
              className="hw-button flex items-center gap-1.5 sm:gap-2 bg-transparent border-none hover:bg-white/5 px-2 sm:px-3"
              title="Allocate Random Block"
            >
              <Disc className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="hidden sm:inline text-[9px] sm:text-[10px]">Random</span>
            </button>
          </div>

          <button 
            onClick={() => setIsAddingFolder(true)}
            className="hw-button hw-button-primary flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-[10px]">New Dir</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-3 bg-[#0D0E10] border-b border-hw-border flex items-center justify-between text-[9px] font-bold tracking-[0.2em] text-hw-text-dim uppercase">
        <div className="flex items-center gap-2">
          <Home className="w-3 h-3" />
          <span className="opacity-10">/</span>
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={b.id || 'root'}>
                <button 
                  onClick={() => navigateToFolder(b as VirtualFolder)}
                  className={cn(
                    "hover:text-hw-primary transition whitespace-nowrap",
                    i === breadcrumb.length - 1 && "text-hw-text"
                  )}
                >
                  {b.name}
                </button>
                {i < breadcrumb.length - 1 && <span className="opacity-10">/</span>}
              </React.Fragment>
            ))}
            {searchQuery && (
              <>
                <span className="opacity-10">/</span>
                <span className="text-hw-primary underline underline-offset-4 decoration-hw-primary/30">Search: {searchQuery}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div 
        className="flex-1 overflow-auto p-8 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-hw-primary/20 backdrop-blur-sm border-4 border-dashed border-hw-primary m-4 rounded-3xl flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="bg-hw-surface p-8 rounded-full shadow-2xl mb-6">
                <Upload className="w-16 h-16 text-hw-primary animate-bounce" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white drop-shadow-2xl">Drop to Allocate</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 relative z-10">
          <AnimatePresence mode="popLayout">
            {isAddingFolder && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hw-card p-4 border-hw-primary/30 bg-hw-primary/5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-center py-8 bg-black/20 rounded border border-hw-border">
                  <Folder className="w-12 h-12 text-hw-primary drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]" />
                </div>
                <form onSubmit={handleCreateFolder} className="space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="NAME.DIR"
                    className="w-full text-[10px] bg-transparent border-b border-hw-border-bold py-1 focus:outline-none focus:border-hw-primary uppercase font-bold text-center"
                    onBlur={() => !newFolderName && setIsAddingFolder(false)}
                  />
                  <div className="flex justify-center">
                    <button type="submit" className="text-[9px] font-black uppercase tracking-[0.2em] text-hw-primary hover:text-white transition">Init Sequence</button>
                  </div>
                </form>
              </motion.div>
            )}

            {displayFolders.map(folder => (
              <motion.div
                layout
                key={folder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative cursor-pointer"
                onClick={() => navigateToFolder(folder)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
              >
                <div className="hw-card p-5 hover:bg-white/5 hover:border-hw-primary/30 transition-all flex flex-col items-center group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                  <div className="w-full flex justify-between items-center mb-6 px-1">
                    <Cpu className="w-3.5 h-3.5 opacity-10 group-hover:opacity-100 group-hover:text-hw-primary transition-all" />
                    <div className="w-1.5 h-3 bg-hw-primary/50 rounded-full" />
                  </div>
                  <Folder className="w-16 h-16 text-hw-primary mb-5 drop-shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-transform group-hover:scale-110" />
                  
                  {renamingItem?.id === folder.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={renamingItem.name}
                      onChange={(e) => setRenamingItem({ ...renamingItem, name: e.target.value })}
                      onBlur={handleRename}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                      onClick={(e) => e.stopPropagation()}
                      className="hw-input w-full text-center"
                    />
                  ) : (
                    <div className="space-y-1 w-full text-center">
                      <p className="text-[11px] font-black uppercase tracking-wider truncate px-2 text-white/90">{folder.name}</p>
                      <p className="text-[7px] font-bold text-hw-text-dim uppercase tracking-[0.2em]">Dir_Sector_0x{folder.id.slice(0,4)}</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShareItem(folder); }}
                    className="absolute top-3 left-3 p-1.5 text-hw-text-dim hover:text-hw-primary transition-all group-hover:opacity-100 opacity-60 bg-hw-surface/40 rounded-lg backdrop-blur-sm border border-transparent hover:border-hw-primary/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    className="absolute top-3 right-3 p-1.5 text-red-500/30 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {displayFiles.map(file => (
              <motion.div
                layout
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative cursor-pointer z-10"
                onClick={() => onFileSelect(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <div className="hw-card p-5 hover:bg-white/5 hover:border-hw-primary/30 transition-all group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                  <div className="w-full flex justify-between items-center mb-6 px-1">
                    <span className="text-[7px] font-black tracking-[0.2em] text-hw-text-dim">0x{file.id.slice(0,4)} // {file.type.toUpperCase()}</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-1 h-1 rounded-full bg-hw-primary shadow-[0_0_5px_rgba(234,88,12,0.5)]" />
                      <div className="w-1.5 h-4 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="aspect-square flex items-center justify-center p-4 bg-black/40 rounded border border-hw-border mb-5 relative overflow-hidden group-hover:border-hw-primary/20 transition-colors shadow-inner">
                    {file.type === 'image' ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100"
                      />
                    ) : (
                      <div className="group-hover:scale-125 transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 text-center">
                    {renamingItem?.id === file.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={renamingItem.name}
                        onChange={(e) => setRenamingItem({ ...renamingItem, name: e.target.value })}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        onClick={(e) => e.stopPropagation()}
                        className="hw-input w-full text-center"
                      />
                    ) : (
                      <p className="text-[11px] font-black uppercase tracking-wider truncate text-white/90 underline decoration-white/5 underline-offset-4">{file.name}</p>
                    )}
                    <p className="text-[8px] font-bold text-hw-text-dim tracking-[0.2em]">{formatBytes(file.size)}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setShareItem(file); }}
                    className="absolute top-3 left-3 p-1.5 text-hw-text-dim hover:text-hw-primary transition-all group-hover:opacity-100 opacity-60 bg-hw-surface/40 rounded-lg backdrop-blur-sm border border-transparent hover:border-hw-primary/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                    className="absolute top-3 right-3 p-1.5 text-red-500/30 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {displayFiles.length === 0 && displayFolders.length === 0 && !isAddingFolder && (
          <div className="flex flex-col items-center justify-center h-96 text-white/10">
            <Cpu className="w-16 h-16 mb-6 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-[0.4em]">Empty Memory Block</p>
            <p className="text-[10px] uppercase tracking-widest mt-2">{searchQuery ? "No matches found in active sectors" : "Execute Init Sequence to store data"}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {shareItem && (
          <ShareModal 
            item={shareItem} 
            onClose={() => setShareItem(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onClose={() => setContextMenu(null)}
            onShare={() => setShareItem(contextMenu.item)}
            onDelete={() => {
              if ('type' in contextMenu.item) handleDeleteFile(contextMenu.item.id);
              else handleDeleteFolder(contextMenu.item.id);
            }}
            onRename={() => setRenamingItem({ 
              id: contextMenu.item.id, 
              name: contextMenu.item.name, 
              type: 'type' in contextMenu.item ? 'file' : 'folder' 
            })}
            onDownload={() => {
              if ('type' in contextMenu.item) {
                window.open((contextMenu.item as VirtualFile).url, '_blank');
              }
            }}
            onProperties={() => {
              if ('type' in contextMenu.item) onFileSelect(contextMenu.item as VirtualFile);
            }}
            onAnalyze={() => {
              if ('type' in contextMenu.item && contextMenu.item.type === 'image') {
                onFileSelect(contextMenu.item as VirtualFile);
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="px-6 py-2 bg-hw-bg border-t border-hw-border flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-hw-text-dim">
        <div className="flex gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-hw-accent animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <span className="text-white/60">Local.Storage.Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-40">Allocated:</span>
            <span className="text-hw-primary/60">{displayFiles.length + displayFolders.length} Units</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[7px] tracking-[0.5em] opacity-40">V-DISK.LOCAL_v1.0.0</span>
        </div>
      </div>
    </div>
  );
}