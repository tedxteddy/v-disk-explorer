import React, { useState } from 'react';
import { X, Share2, Link as LinkIcon, Copy, Shield, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { VirtualFile, VirtualFolder } from '../types';
import { cn } from '../utils';

interface ShareModalProps {
  item: VirtualFile | VirtualFolder;
  onClose: () => void;
}

export function ShareModal({ item, onClose }: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareLink = `${window.location.origin}/?shared=${item.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono text-hw-text">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-hw-surface border border-hw-border-bold rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] hardware-panel"
      >
        <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light">
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4 text-hw-primary" />
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Access.Grant</h2>
              <span className="text-[7px] font-bold text-hw-text-dim uppercase tracking-[0.1em]">Target: {item.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded text-hw-text-dim hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto hw-scrollbar max-h-[80vh]">
          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <LinkIcon className="w-3 h-3" />
              <span>Public Link</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-hw-border rounded px-4 py-3 text-[10px] text-hw-text-dim truncate select-all font-bold shadow-inner uppercase tracking-wider">
                {shareLink}
              </div>
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "px-5 py-3 rounded border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95",
                  isCopied ? "bg-hw-accent/20 border-hw-accent text-hw-accent" : "bg-hw-surface-light border-hw-border hover:bg-white/5 text-hw-text"
                )}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="h-px bg-hw-border" />

          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <Share2 className="w-3 h-3" />
              <span>Sharing Info</span>
            </div>
            <p className="text-[9px] text-hw-text-dim leading-relaxed uppercase tracking-wider">
              In local storage mode, sharing creates a link that can be opened on the same device.
            </p>
          </div>
        </div>

        <div className="px-8 py-4 bg-hw-surface-light border-t border-hw-border flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.3em] text-hw-text-dim">
          <Shield className="w-3 h-3 text-hw-accent/50" />
          <span>Local storage mode - no cloud sync</span>
        </div>
      </motion.div>
    </div>
  );
}