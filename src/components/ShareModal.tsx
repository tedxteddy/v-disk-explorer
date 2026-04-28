import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Link as LinkIcon, 
  UserPlus, 
  Mail, 
  Shield, 
  Check, 
  Copy,
  Users,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { VirtualFile, VirtualFolder, OperationType } from '../types';
import { handleFirestoreError } from '../utils';
import { cn } from '../utils';

interface ShareModalProps {
  item: VirtualFile | VirtualFolder;
  onClose: () => void;
}

export function ShareModal({ item, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sharedWith, setSharedWith] = useState(item.sharedWith || {});

  const userId = auth.currentUser?.uid;
  const isOwner = item.ownerId === userId;

  const shareLink = `${window.location.origin}/share/${item.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWithUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSearching) return;

    setIsSearching(true);
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Internal System Error: Target user identity not found in indexed sectors.');
        setIsSearching(false);
        return;
      }

      const targetUser = querySnapshot.docs[0].data();
      const targetUserId = targetUser.uid;

      if (targetUserId === auth.currentUser?.uid) {
        alert('Self-allocation detected. Source and destination identity match.');
        setIsSearching(false);
        return;
      }

      // Check if already shared
      if (sharedWith[targetUserId]) {
        alert('Identity already has access tokens for this block.');
        setIsSearching(false);
        return;
      }

      const updatedSharedWith = {
        ...sharedWith,
        [targetUserId]: {
          email: email.trim(),
          role
        }
      };

      const collectionName = 'type' in item ? 'files' : 'folders';
      const path = `users/${item.ownerId}/${collectionName}/${item.id}`;
      
      await updateDoc(doc(db, path), {
        sharedWith: updatedSharedWith
      });

      setSharedWith(updatedSharedWith);
      setEmail('');
    } catch (error) {
      handleFirestoreError(error as any, OperationType.UPDATE, 'sharing');
    } finally {
      setIsSearching(false);
    }
  };

  const removeShare = async (targetId: string) => {
    const updatedSharedWith = { ...sharedWith };
    delete updatedSharedWith[targetId];
    
    const collectionName = 'type' in item ? 'files' : 'folders';
    const path = `users/${item.ownerId}/${collectionName}/${item.id}`;
    
    try {
      await updateDoc(doc(db, path), {
        sharedWith: updatedSharedWith
      });
      setSharedWith(updatedSharedWith);
    } catch (error) {
       handleFirestoreError(error as any, OperationType.UPDATE, 'sharing');
    }
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
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Access.Grant // Operation</h2>
              <span className="text-[7px] font-bold text-hw-text-dim uppercase tracking-[0.1em]">Target: {item.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded text-hw-text-dim hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto hw-scrollbar max-h-[80vh]">
          {/* Share Link Section */}
          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <LinkIcon className="w-3 h-3" />
              <span>Public.Interface_Link</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-hw-border rounded px-4 py-3 text-[10px] text-hw-text-dim truncate select-all font-bold shadow-inner uppercase tracking-wider">
                {shareLink}
              </div>
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "px-5 py-3 rounded border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95",
                  isCopied 
                    ? "bg-hw-accent/20 border-hw-accent text-hw-accent" 
                    : "bg-hw-surface-light border-hw-border hover:bg-white/5 text-hw-text"
                )}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Cached' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="h-px bg-hw-border" />

          {/* Direct Share Section */}
          <div className="space-y-5">
            <div className="hw-label px-1 flex items-center gap-2">
              <UserPlus className="w-3 h-3" />
              <span>Identity.Provisioning</span>
            </div>
            
            <form onSubmit={handleShareWithUser} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-hw-text-dim/50 group-focus-within:text-hw-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENCODE_DESTINATION@EMAIL.SYS"
                  className="hw-input w-full pl-12 pr-4 py-4"
                />
              </div>
              
              <div className="flex items-center justify-between gap-6">
                <div className="flex bg-black/40 p-1.5 rounded-lg border border-hw-border shadow-inner">
                  <button 
                    type="button"
                    onClick={() => setRole('viewer')}
                    className={cn(
                      "px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      role === 'viewer' ? "bg-hw-surface text-hw-text-dim border border-hw-border shadow-lg" : "text-hw-text-dim/40 hover:text-hw-text-dim/80"
                    )}
                  >
                    Viewer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('editor')}
                    className={cn(
                      "px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      role === 'editor' ? "bg-hw-surface text-hw-text-dim border border-hw-border shadow-lg" : "text-hw-text-dim/40 hover:text-hw-text-dim/80"
                    )}
                  >
                    Editor
                  </button>
                </div>
                
                <button 
                  type="submit"
                  disabled={!email.trim() || isSearching}
                  className="hw-button hw-button-primary px-8 py-3.5"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize'}
                </button>
              </div>
            </form>
          </div>

          <div className="h-px bg-hw-border" />

          {/* Shared List */}
          <div className="space-y-4">
            <div className="hw-label px-1 flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>Access_Tokens.Active</span>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto hw-scrollbar pr-2">
              {Object.entries(sharedWith).map(([targetUserId, share]) => (
                <div key={targetUserId} className="hw-card p-4 flex items-center justify-between hover:border-hw-primary/20 transition-colors group">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/80 font-black truncate uppercase tracking-wider">{share.email}</span>
                    <span className="text-[8px] text-hw-accent uppercase font-black tracking-widest italic">{share.role}</span>
                  </div>
                  {isOwner && (
                    <button 
                      onClick={() => removeShare(targetUserId)}
                      className="text-[9px] font-bold text-red-500/40 hover:text-red-500 underline underline-offset-4 decoration-red-500/20 uppercase tracking-widest transition-all italic hover:bg-red-500/5 px-2 py-1 rounded"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {Object.keys(sharedWith).length === 0 && (
                <div className="text-center py-10 border border-dashed border-hw-border rounded-xl opacity-20">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">No External Handshaking</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-hw-surface-light border-t border-hw-border flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.3em] text-hw-text-dim">
          <Shield className="w-3 h-3 text-hw-accent/50" />
          <span>Encryption enabled for all external data routing</span>
        </div>
      </motion.div>
    </div>
  );
}
