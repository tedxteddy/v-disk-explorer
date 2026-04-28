import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  signOut,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FileExplorer } from './components/FileExplorer';
import { Chat } from './components/Chat';
import { DemoChat } from './components/DemoChat';
import { Settings } from './components/Settings';
import { Footer } from './components/Footer';
import { ImageAnalysis } from './components/ImageAnalysis';
import { DiskLanding } from './components/DiskLanding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VirtualFile, AppSettings } from './types';
import { cn } from './utils';
import { 
  Disc, 
  LogOut, 
  Grid, 
  MessageSquare, 
  HardDrive, 
  Settings, 
  ShieldCheck,
  Cpu,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [activeTab, setActiveTab] = useState<'explorer' | 'chat' | 'settings'>('explorer');
  const [hasEntered, setHasEntered] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('vdisk-settings');
    return saved ? JSON.parse(saved) : {
      privateMode: false,
      hideMetadata: false,
      demoChatEnabled: true,
      notificationCatchEnabled: false,
      autoReplyEnabled: true,
      storageLimitMB: 100
    };
  });

  const handleClearStorage = () => {
    localStorage.removeItem('vdisk-files');
    localStorage.removeItem('vdisk-demo-messages');
    window.location.reload();
  };

  useEffect(() => {
    localStorage.setItem('vdisk-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vdisk-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
}, []);

  useEffect(() => {
    localStorage.setItem('vdisk-settings', JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('vdisk-theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Set a default display name for anonymous users if not present
        if (currentUser.isAnonymous && !currentUser.displayName) {
          try {
            await updateProfile(currentUser, { displayName: `Guest_${currentUser.uid.slice(0, 4)}` });
          } catch (e) {
            console.error("Profile update failed:", e);
          }
        }

        const userRef = doc(db, `users/${currentUser.uid}`);
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email || 'anonymous',
          displayName: currentUser.displayName || `Guest_${currentUser.uid.slice(0, 4)}`,
          isAnonymous: currentUser.isAnonymous,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, { merge: true });
        setUser(currentUser);
      } else {
        // Automatically sign in anonymously if no user is present
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous auth failed:", error);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-hw-bg text-hw-text">
        <Cpu className="w-12 h-12 text-hw-primary animate-pulse mb-6 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-hw-primary/60 animate-pulse">Initializing.Core</p>
          <div className="w-32 h-0.5 bg-hw-border-bold rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-hw-primary"
              animate={{ x: [-128, 128] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!hasEntered) {
    return <DiskLanding onEnter={() => setHasEntered(true)} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-hw-bg text-hw-text font-mono overflow-hidden">
        {/* Hardware Sidebar */}
        <aside className="w-16 lg:w-64 bg-hw-surface border-r border-hw-border flex flex-col z-30 shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-6 mb-8 cursor-pointer group flex items-center gap-4" onClick={() => { setActiveTab('explorer'); setSelectedFile(null); }}>
            <div className="p-2 bg-hw-primary/10 rounded-lg group-hover:bg-hw-primary/20 transition-all shadow-[0_0_15px_rgba(234,88,12,0.1)]">
              <Disc className="w-8 h-8 text-hw-primary animate-spin-slow" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase italic leading-none">V-Disk</span>
              <span className="text-[7px] font-bold text-hw-text-dim uppercase tracking-[0.4em] mt-1">SATA-III v1.02</span>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-3">
            <div className="mb-4 px-3 flex items-center justify-between text-[8px] font-black uppercase text-hw-text-dim tracking-widest">
              <span className="hidden lg:block">Data.Operations</span>
              <HardDrive className="w-3 h-3 opacity-30" />
            </div>

            {[
              { id: 'explorer', icon: Grid, label: 'Sector.Explorer' },
              { id: 'chat', icon: MessageSquare, label: 'Assistant.AI' },
              { id: 'settings', icon: Settings, label: 'System.Config' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group",
                  activeTab === item.id 
                    ? "bg-hw-primary text-white shadow-[0_0_25px_rgba(234,88,12,0.3)]" 
                    : "text-hw-text-dim hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "animate-pulse" : "opacity-40 group-hover:opacity-100")} />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" 
                  />
                )}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-hw-border space-y-4">
              <div className="px-3 hidden lg:block">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-hw-text-dim mb-3">
                  <span>Capacity_Used</span>
                  <span className="text-hw-primary">8.4%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full border border-hw-border overflow-hidden">
                  <div className="h-full bg-hw-primary w-[8.4%] shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                </div>
              </div>

              

              <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-hw-text-dim hover:text-white hover:bg-white/5 group"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 opacity-40 group-hover:opacity-100" /> : <Moon className="w-5 h-5 opacity-40 group-hover:opacity-100" />}
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {user?.isAnonymous && (
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all bg-hw-accent/10 text-hw-accent hover:bg-hw-accent/20 border border-hw-accent/20 group shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                >
                  <LogIn className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                  <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Infiltrate (Gmail)</span>
                </button>
              )}
            </div>
          </nav>

          <div className="p-4 mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 text-hw-text-dim hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Eject Sector</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex overflow-hidden relative pb-12">
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(234,88,12,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'explorer' ? (
                <motion.div 
                  key="explorer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 overflow-hidden"
                >
                  <FileExplorer onFileSelect={setSelectedFile} />
                </motion.div>
              ) : activeTab === 'chat' ? (
                settings.demoChatEnabled ? (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 overflow-hidden h-full"
                  >
                    <DemoChat autoReplyEnabled={settings.autoReplyEnabled} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 overflow-hidden h-full"
                  >
                    <Chat />
                  </motion.div>
                )
              ) : (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 overflow-hidden h-full"
                >
                  <Settings 
                    settings={settings} 
                    onSettingsChange={setSettings}
                    onClearStorage={handleClearStorage}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selectedFile && (
              <ImageAnalysis 
                file={selectedFile} 
                onClose={() => setSelectedFile(null)} 
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}
