import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VirtualFile, FileComment, OperationType } from '../types';
import { 
  Loader2, 
  Zap, 
  FileText, 
  Info, 
  X, 
  FileArchive, 
  Layers, 
  MessageSquare, 
  Send,
  User as UserIcon,
  Clock,
  HardDrive,
  Disc,
  Calendar,
  Shield,
  Fingerprint,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, formatBytes } from '../utils';
import { ShareModal } from './ShareModal';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ImageAnalysisProps {
  file: VirtualFile | null;
  onClose: () => void;
}

export function ImageAnalysis({ file, onClose }: ImageAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zipContents, setZipContents] = useState<string[]>([]);
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [comments, setComments] = useState<FileComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    setAnalysis(null);
    setZipContents([]);
    setComments([]);
    if (!file) return;

    if (file.type === 'zip') {
      loadZipContents();
    }

    // Load comments
    const commentsPath = `users/${file.ownerId}/files/${file.id}/comments`;
    const q = query(collection(db, commentsPath), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileComment));
      setComments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, commentsPath);
    });

    return () => unsubscribe();
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !commentText.trim() || isSending) return;

    setIsSending(true);
    const path = `users/${file.ownerId}/files/${file.id}/comments`;
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || 'Anonymous',
        userPhoto: auth.currentUser?.photoURL,
        text: commentText,
        timestamp: serverTimestamp()
      });
      setCommentText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSending(false);
    }
  };

  const analyzeImage = async () => {
    if (!file || file.type !== 'image' || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;

      const genAIResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this image in detail. Identify objects, colors, mood, and provide a technical summary. Use markdown." },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ]
      });

      setAnalysis(genAIResponse.text || "Could not analyze image.");
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis("Error analyzing image.");
    } finally {
      setIsAnalyzing(false);
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Sector.Details // Analysis</h2>
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
            <span className="text-hw-accent italic lowercase underline underline-offset-4 decoration-hw-accent/20">SATA_STREAM_v0.9</span>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
            {file.type === 'video' && (
              <video 
                src={file.url} 
                controls 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-contain bg-black"
              />
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
              <Fingerprint className="w-3 h-3" />
              <span>Metadata.Table</span>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-hw-border border border-hw-border rounded overflow-hidden shadow-lg">
              <div className="p-3 bg-hw-surface-light flex flex-col gap-2 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-hw-primary/5 rotate-45 translate-x-4 -translate-y-4" />
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Ownership</span>
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-2.5 h-2.5 text-hw-primary/70" />
                  <span className="text-[9px] text-white/80 truncate uppercase font-bold">{file.ownerName || 'Unknown'}</span>
                </div>
              </div>

              <div className="p-3 bg-hw-surface-light flex flex-col gap-2 relative group overflow-hidden">
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Access_Mask</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Shield className="w-2.5 h-2.5 text-hw-accent/70" />
                  <span className="text-[9px] text-hw-accent/80 uppercase font-black">
                    {file.permissions?.join(' | ') || 'Default'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-hw-surface-light flex flex-col gap-2 relative group overflow-hidden">
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Sector_Init</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-2.5 h-2.5 text-hw-text-dim" />
                  <span className="text-[9px] text-white/60 uppercase font-bold">
                    {file.createdAt?.toDate ? file.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-hw-surface-light flex flex-col gap-2 relative group overflow-hidden">
                <span className="text-[7px] text-hw-text-dim uppercase font-black tracking-widest">Last_Refresh</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-2.5 h-2.5 text-hw-text-dim" />
                  <span className="text-[9px] text-white/60 uppercase font-bold">
                    {file.updatedAt?.toDate ? file.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
            <span>Grant Access</span>
          </button>
          <button 
            className="hw-button flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fetch Data</span>
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
                <div className="w-3 h-3 border-2 border-hw-primary/30 border-t-hw-primary rounded-full animate-spin" /> Querying Sector F.A.T...
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

        {file.type === 'image' && (
          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-hw-primary" />
                <span>Neural_Engine.Output</span>
              </div>
              {!analysis && !isAnalyzing && (
                <button 
                  onClick={analyzeImage}
                  className="text-hw-primary hover:underline lowercase font-bold tracking-normal italic"
                >
                  execute_scan?
                </button>
              )}
            </div>
            
            <div className="hw-card p-6 relative overflow-hidden group min-h-[120px] shadow-inner bg-black/20">
              {isAnalyzing && (
                <div className="absolute inset-0 z-10 bg-hw-surface/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-1 bg-hw-border-bold rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-hw-primary shadow-[0_0_10px_rgba(234,88,12,0.5)]"
                      animate={{ x: [-64, 64] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] animate-pulse text-hw-primary">Scanning.Sectors...</span>
                </div>
              )}
              
              {!analysis && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-10 text-hw-text-dim select-none opacity-40 group-hover:opacity-100 transition-opacity">
                  <Fingerprint className="w-12 h-12 mb-4 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed">Neural signature required for heuristic data extraction</span>
                </div>
              )}

              {analysis && (
                <div className="markdown-body transition-opacity duration-500 text-sm">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commenting System */}
        <div className="space-y-6 pt-8 border-t border-hw-border">
          <div className="flex items-center justify-between hw-label px-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comm.Logs</span>
            </div>
            <span className="italic lowercase">{comments.length} Entries registered</span>
          </div>

          <form onSubmit={handleAddComment} className="relative group">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="ENCODE MESSAGE..."
              className="hw-input w-full pl-5 pr-12 py-4 bg-black/40"
            />
            <button 
              type="submit"
              disabled={!commentText.trim() || isSending}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-hw-text-dim hover:text-hw-primary transition-all disabled:opacity-10"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin text-hw-primary" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hw-card p-4 space-y-3 relative group overflow-hidden hover:border-hw-primary/30 transition-colors"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                    <MessageSquare className="w-10 h-10 rotate-12" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      {comment.userPhoto ? (
                        <img src={comment.userPhoto} className="w-4 h-4 rounded-full border border-hw-border" alt="" />
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center bg-hw-primary/10 rounded-full">
                          <UserIcon className="w-2.5 h-2.5 text-hw-primary" />
                        </div>
                      )}
                      <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{comment.userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] text-hw-text-dim font-bold">
                      <Clock className="w-2.5 h-2.5" />
                      {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing'}
                    </div>
                  </div>
                  <p className="text-[10px] text-hw-text-dim leading-relaxed uppercase tracking-wider relative z-10 select-text font-bold">
                    {comment.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {comments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <div className="w-8 h-8 border border-white/10 rounded rotate-45 flex items-center justify-center mb-3">
                  <span className="text-[10px] -rotate-45">?</span>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em]">Silence in Sector.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareModal 
            item={file} 
            onClose={() => setShowShare(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
