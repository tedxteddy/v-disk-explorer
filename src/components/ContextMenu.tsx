import React, { useEffect, useRef } from 'react';
import { 
  Share2, 
  Trash2, 
  Edit3, 
  Download, 
  Info, 
  Zap,
  ChevronRight,
  Shield,
  Cpu,
  Terminal
} from 'lucide-react';
import { motion } from 'motion/react';
import { VirtualFile, VirtualFolder } from '../types';
import { cn } from '../utils';

interface ContextMenuProps {
  x: number;
  y: number;
  item: VirtualFile | VirtualFolder;
  onClose: () => void;
  onShare: () => void;
  onDelete: () => void;
  onRename: () => void;
  onDownload?: () => void;
  onProperties: () => void;
  onAnalyze?: () => void;
}

export function ContextMenu({ 
  x, 
  y, 
  item, 
  onClose, 
  onShare, 
  onDelete, 
  onRename, 
  onDownload, 
  onProperties, 
  onAnalyze 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isFile = 'type' in item;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  const menuItems = [
    { 
      label: 'Share.Grant', 
      icon: <Share2 className="w-3.5 h-3.5" />, 
      onClick: onShare, 
      color: 'text-orange-500' 
    },
    { 
      label: 'Rename.Token', 
      icon: <Edit3 className="w-3.5 h-3.5" />, 
      onClick: onRename 
    },
    { 
      label: 'Delete.Block', 
      icon: <Trash2 className="w-3.5 h-3.5" />, 
      onClick: onDelete, 
      color: 'text-red-500/80' 
    },
    { divider: true },
    ...(isFile ? [
      { 
        label: 'Fetch.Data', 
        icon: <Download className="w-3.5 h-3.5" />, 
        onClick: onDownload 
      }
    ] : []),
    ...(isFile && item.type === 'image' ? [
      { 
        label: 'Execute.Vision', 
        icon: <Zap className="w-3.5 h-3.5" />, 
        onClick: onAnalyze,
        color: 'text-blue-400'
      }
    ] : []),
    { 
      label: 'System.Props', 
      icon: <Info className="w-3.5 h-3.5" />, 
      onClick: onProperties 
    },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed z-[100] w-52 bg-hw-surface border border-hw-border-bold rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,1)] font-mono hardware-panel"
      style={{ top: adjustedY, left: adjustedX }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5 bg-hw-surface-light border-b border-hw-border">
        <Cpu className="w-3 h-3 text-hw-primary/40" />
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 truncate">
            Menu.Node // Selection
          </span>
          <span className="text-[7px] font-bold text-hw-text-dim truncate uppercase opacity-60">0x{item.name.slice(0, 12)}</span>
        </div>
      </div>

      <div className="p-1.5 space-y-0.5">
        {menuItems.map((menuItem, i) => {
          if ('divider' in menuItem) {
            return <div key={i} className="h-px bg-hw-border my-1.5 mx-1" />;
          }

          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                menuItem.onClick?.();
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
                menuItem.color 
                  ? `${menuItem.color} hover:bg-white/5` 
                  : "text-hw-text-dim hover:text-white hover:bg-hw-primary/10"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className={cn(
                  "opacity-30 group-hover:opacity-100 transition-opacity",
                  !menuItem.color && "group-hover:text-hw-primary"
                )}>
                  {menuItem.icon}
                </span>
                <span className="truncate">{menuItem.label}</span>
              </div>
              <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all z-10" />
              
              {/* Hover highlight line */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-hw-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
            </button>
          );
        })}
      </div>

      <div className="px-3 py-2 bg-black/40 border-t border-hw-border flex items-center gap-4">
        <Terminal className="w-2.5 h-2.5 text-hw-text-dim/40" />
        <div className="flex-1 h-[2px] bg-hw-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-full bg-hw-primary/30" 
          />
        </div>
      </div>
    </motion.div>
  );
}
