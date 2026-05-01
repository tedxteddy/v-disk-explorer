import React, { useState, useEffect, useRef } from 'react';
import { DemoMessage } from '../types';
import { cn } from '../utils';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const DEMO_MESSAGES = [
  "I can help you manage your virtual disk!",
  "Try uploading some files using the file explorer.",
  "Need assistance? Just ask!",
  "This is a demo chat - no real backend required!",
  "Your files are securely stored in local storage.",
  "You can customize settings in the config panel."
];

const AUTO_RESPONSES = [
  "Processing your request...done!",
  "I've noted that. Anything else?",
  "Interesting query! Let me check...",
  "Affirmative! Executing command...",
  "Got it! Is there anything more?",
  "Understood. Moving to next task...",
  "Copy that! Your virtual disk is updating.",
  "Request received. Neural net engaged."
];

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface DemoChatProps {
  autoReplyEnabled: boolean;
}

const INITIAL_MESSAGES: DemoMessage[] = [
  {
    id: generateId(),
    sender: 'system',
    content: 'Welcome to V-Disk Assistant! This is a demo mode - messages are stored locally.',
    timestamp: Date.now() - 60000,
    simulated: true
  },
  {
    id: generateId(),
    sender: 'system',
    content: 'Try sending a message to see the auto-reply simulation in action!',
    timestamp: Date.now() - 30000,
    simulated: true
  }
];

export function DemoChat({ autoReplyEnabled }: DemoChatProps) {
  const [messages, setMessages] = useState<DemoMessage[]>(() => {
    const saved = localStorage.getItem('vdisk-chat');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('vdisk-chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: DemoMessage = {
      id: generateId(),
      sender: 'user',
      content: input,
      timestamp: Date.now(),
      simulated: false
    };

    setInput('');
    setMessages(prev => [...prev, userMsg]);

    if (autoReplyEnabled) {
      setIsTyping(true);
      const delay = 500 + Math.random() * 1500;
      await new Promise(resolve => setTimeout(resolve, delay));

      const response: DemoMessage = {
        id: generateId(),
        sender: 'system',
        content: getRandomItem(AUTO_RESPONSES),
        timestamp: Date.now(),
        simulated: true
      };

      setIsTyping(false);
      setMessages(prev => [...prev, response]);
    }
  };

  const clearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem('vdisk-chat');
  };

  return (
    <div className="flex flex-col h-full bg-hw-bg text-hw-text font-mono selection:bg-hw-primary/30">
      <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 bg-hw-primary/10 rounded border border-hw-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-hw-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Demo_Chat.v1</h2>
            <span className="text-[7px] font-bold text-hw-accent uppercase tracking-[0.1em] flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-hw-accent animate-pulse" /> Local_Mode
            </span>
          </div>
        </div>
        {messages.length > 2 && (
          <button
            onClick={clearHistory}
            className="text-[7px] font-bold uppercase tracking-wider text-hw-text-dim hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hw-scrollbar p-6 space-y-6 relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(234, 88, 12, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 88, 12, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id || i}
            className={cn(
              "flex gap-4 max-w-[95%] relative z-10",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 shadow-lg",
              msg.sender === 'user' 
                ? "bg-hw-surface border-hw-primary/30 text-hw-primary" 
                : msg.sender === 'system'
                  ? "bg-hw-surface border-hw-accent/30 text-hw-accent"
                  : "bg-hw-surface border-hw-border text-hw-text-dim"
            )}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-xl text-[11px] leading-relaxed max-w-full shadow-2xl transition-all",
              msg.sender === 'user' 
                ? "bg-hw-primary/10 border border-hw-primary/30 text-white rounded-tr-none" 
                : "bg-hw-surface border border-hw-border text-hw-text-dim rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-4 relative z-10">
            <div className="w-8 h-8 rounded border border-hw-accent/30 bg-hw-surface text-hw-accent flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-xl bg-hw-surface border border-hw-border text-hw-text-dim rounded-tl-none text-[10px] animate-pulse italic uppercase tracking-widest font-black">
              typing...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-hw-border bg-hw-surface-light relative z-20">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE MESSAGE..."
            className="hw-input w-full pl-5 pr-14 py-4 uppercase shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-hw-primary text-white rounded-lg shadow-lg hover:bg-orange-500 transition-all disabled:opacity-20 disabled:grayscale active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-20 text-[7px] font-black uppercase tracking-[0.5em] select-none">
          <span>Demo_Mode.Active</span>
          <div className="w-1 h-1 rounded-full bg-hw-text" />
          <span>{autoReplyEnabled ? 'AutoReply: ON' : 'AutoReply: OFF'}</span>
        </div>
      </form>
    </div>
  );
}