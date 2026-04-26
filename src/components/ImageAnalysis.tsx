import React, { useState, useEffect } from 'react';
import { VirtualFile } from '../types';
import { formatBytes } from '../utils';
import { 
  FileText, 
  X, 
  FileArchive, 
  Layers, 
  HardDrive,
  Calendar,
  Clock,
  Share2,
  Shield,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ShareModal } from './ShareModal';

interface ImageAnalysisProps {
  file: VirtualFile | null;
  onClose: () => void;
}

export function ImageAnalysis({ file, onClose }: ImageAnalysisProps) {
  const [zipContents, setZipContents] = useState<string[]>([]);
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    setZipContents([]);
    if (!file) return;

    if (file.type === 'zip') {
      loadZipContents();
    }
  }, [file]);

  const loadZipContents = async () => {
    if (!file || file.type !== 'zip') return;
    setIsLoadingZip(true);
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const zip = new JSZip();
      const content = await zip.loadAsync(blob);
      const files = Object.keys(content.files).filter(name => !content.files[name].dir);
      setZipContents(files);
    } catch (error) {
      console.error('ZIP load error:', error);
    } finally {
      setIsLoadingZip(false);
    }
  };

  const handleDownload = () => {
    if (file) {
      window.open(file.url, '_blank');
    }
  };

  if (!file) return null;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[450px] bg-hw-surface border-l border-hw-border flex flex-col z-40 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] hardware-panel font-mono"
    >
      <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light">
        <div className="flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-hw-primary" />
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Sector.Details</h2>
            <span className="text-[7px] font-bold text-hw-text-dim uppercase tracking-[0.1em]">Target: 0x{file.id.slice(0,8)}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 rounded text-hw-text-dim hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hw-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <div className="hw-label px-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3" />
              <span>Visual_Buffer</span>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-hw-border overflow-hidden aspect-video relative group shadow-inner">
            {file.type === 'image' && (
              <>
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </>
            )}
            {file.type === 'video' && (
              <video src={file.url} controls autoPlay muted loop className="w-full h-full object-contain bg-black" />
            )}
            {file.type === 'zip' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-hw-primary bg-hw-primary/5">
                <FileArchive className="w-16 h-16 mb-2 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Encrypted.Container</span>
              </div>
            )}
            {file.type === 'other' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-hw-text-dim bg-white/2">
                <FileText className="w-16 h-16 mb-2" />
                <span className="text-[8px] font-bold uppercase tracking-[0.3em]">System.Block</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/5 text-[7px] font-bold uppercase tracking-widest text-hw-primary/80">
              {file.type.toUpperCase()}.SYS
            </div>
          </div>
          
          <div className="space-y-1.5 border-l-2 border-hw-primary/40 pl-5 py-2">
            <h3 className="font-black text-lg leading-tight uppercase tracking-tight text-white/90">{file.name}</h3>
            <div className="flex items-center gap-4">
              <span className="hw-label !text-hw-primary/80 lowercase italic normal-case tracking-normal">{formatBytes(file.size)} allocated</span>
              <div className="w-1 h-1 rounded-full bg-hw-border-bold" />
              <span className="hw-label !text-hw-accent/60 italic lowercase normal-case tracking-normal">Status: Verified</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Metadata.Table</span>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-hw-border border border-hw-border rounded overflow-hidden shadow-lg">
              <div className="p-3 bg-hw-surface-light flex flex-col gap-2">
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Ownership</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-2.5 h-2.5 text-hw-primary/70" />
                  <span className="text-[9px] text-white/80 truncate uppercase font-bold">{file.ownerName || 'Local User'}</span>
                </div>
              </div>

              <div className="p-3 bg-hw-surface-light flex flex-col gap-2">
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Sector_Init</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-2.5 h-2.5 text-hw-text-dim" />
                  <span className="text-[9px] text-white/60 uppercase font-bold">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowShare(true)}
            className="hw-button flex items-center justify-center gap-2 bg-hw-primary/10 border-hw-primary/30 hover:bg-hw-primary/20 text-hw-primary"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button 
            onClick={handleDownload}
            className="hw-button flex items-center justify-center gap-2 bg-hw-accent/10 border-hw-accent/30 hover:bg-hw-accent/20 text-hw-accent"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>

        {file.type === 'zip' && (
          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Container.Map</span>
            </div>
            {isLoadingZip ? (
              <div className="flex items-center gap-3 text-[8px] text-hw-text-dim italic animate-pulse mx-1">
                <div className="w-3 h-3 border-2 border-hw-primary/30 border-t-hw-primary rounded-full animate-spin" /> Loading...
              </div>
            ) : (
              <div className="bg-black/20 border border-hw-border rounded p-4 max-h-48 overflow-y-auto hw-scrollbar shadow-inner">
                {zipContents.length > 0 ? (
                  <ul className="space-y-2.5">
                    {zipContents.map((name, i) => (
                      <li key={i} className="text-[9px] text-hw-text-dim line-clamp-1 flex items-center gap-3 group">
                        <span className="opacity-10 font-bold shrink-0">0x{i.toString(16).padStart(3, '0')}</span>
                        <span className="group-hover:text-hw-primary transition-colors uppercase font-bold">{name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[9px] text-white/20 italic text-center py-4">No data signatures found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareModal item={file} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}