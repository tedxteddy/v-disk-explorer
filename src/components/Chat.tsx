import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentParameters } from "@google/genai";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChatMessage, OperationType, VirtualFile } from '../types';
import { handleFirestoreError } from '../utils';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const uploadFileDeclaration: FunctionDeclaration = {
  name: "uploadFile",
  description: "Stores file metadata into the virtual hard disk storage. Use this when the user wants to add a new file.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the file (e.g., 'document.pdf')" },
      type: { type: Type.STRING, enum: ["image", "video", "zip", "other"], description: "The category of the file." },
      size: { type: Type.NUMBER, description: "The size of the file in bytes." },
      url: { type: Type.STRING, description: "The URL source of the file." }
    },
    required: ["name", "type", "size", "url"]
  }
};

const getFilesDeclaration: FunctionDeclaration = {
  name: "getFiles",
  description: "Returns all stored files in the user's virtual disk. Use this to list or check existing files."
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = auth.currentUser?.uid;

  // Local state to keep track of ALL files for the assistant to query
  const [allFiles, setAllFiles] = useState<VirtualFile[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Listen to all files for the user to provide context to the AI
    const filesPath = `users/${userId}/files`;
    const qFiles = query(collection(db, filesPath), orderBy('createdAt', 'desc'));
    
    const unsubscribeFiles = onSnapshot(qFiles, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VirtualFile));
      setAllFiles(docs);
    });

    const chatPath = `users/${userId}/chatHistory`;
    const chatQuery = query(
      collection(db, chatPath),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, chatPath);
    });

    return () => {
      unsubscribeFiles();
      unsubscribeChat();
    };
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    const path = `users/${userId}/chatHistory`;

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, path), {
        role: 'user',
        content: userMessage,
        timestamp: serverTimestamp()
      });

      // 2. Prepare history for Gemini
      const geminiHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const tools = [{ functionDeclarations: [uploadFileDeclaration, getFilesDeclaration] }];
      const model = "gemini-3.1-pro-preview";

      const params: GenerateContentParameters = {
        model,
        contents: [
          ...geminiHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are an intelligent Virtual Disk Assistant. You can view user files and upload new ones using tools. Be helpful and professional.",
          tools
        }
      };

      let response = await ai.models.generateContent(params);
      let functionCalls = response.functionCalls;

      if (functionCalls) {
        const toolResponses = [];
        
        for (const call of functionCalls) {
          if (call.name === "uploadFile") {
            const { name, type, size, url } = call.args as any;
            const filesPath = `users/${userId}/files`;
            await addDoc(collection(db, filesPath), {
              name,
              type: type as any,
              size,
              url,
              parentId: null,
              ownerId: userId,
              createdAt: serverTimestamp()
            });
            toolResponses.push({
              functionResponse: {
                name: "uploadFile",
                response: { status: "success", message: `Successfully uploaded ${name}` }
              }
            });
          } else if (call.name === "getFiles") {
            toolResponses.push({
              functionResponse: {
                name: "getFiles",
                response: { files: allFiles.map(f => ({ name: f.name, type: f.type, size: f.size })) }
              }
            });
          }
        }

        const nextParams: GenerateContentParameters = {
          model,
          contents: [
            ...params.contents as any,
            { role: 'model', parts: response.candidates[0].content.parts },
            { role: 'user', parts: toolResponses }
          ],
          config: {
            systemInstruction: params.config?.systemInstruction,
            tools
          }
        };
        
        response = await ai.models.generateContent(nextParams);
      }

      const modelResponse = response.text || "I've processed your request.";

      // 4. Save model response to Firestore
      await addDoc(collection(db, path), {
        role: 'model',
        content: modelResponse,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-hw-bg text-hw-text font-mono selection:bg-hw-primary/30">
      <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 bg-hw-primary/10 rounded border border-hw-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-hw-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Assistant.Neural_Link</h2>
            <span className="text-[7px] font-bold text-hw-accent uppercase tracking-[0.1em] flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-hw-accent animate-pulse" /> Ready_for_Query
            </span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hw-scrollbar p-6 space-y-6 relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(234, 88, 12, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 88, 12, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 relative z-10">
            <div className="w-16 h-16 rounded-full bg-hw-surface border border-hw-border flex items-center justify-center mb-6 shadow-2xl">
              <Bot className="w-8 h-8 text-hw-primary/50" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-hw-text-dim max-w-[200px] leading-relaxed">
              Neural processing unit online. Awaiting data stream initialization.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id || i}
            className={cn(
              "flex gap-4 max-w-[95%] relative z-10",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 shadow-lg",
              msg.role === 'user' 
                ? "bg-hw-surface border-hw-primary/30 text-hw-primary" 
                : "bg-hw-surface border-hw-accent/30 text-hw-accent"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-xl text-[11px] leading-relaxed markdown-body max-w-full shadow-2xl transition-all",
              msg.role === 'user' 
                ? "bg-hw-primary/10 border border-hw-primary/30 text-white rounded-tr-none" 
                : "bg-hw-surface border border-hw-border text-hw-text-dim rounded-tl-none"
            )}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 relative z-10">
            <div className="w-8 h-8 rounded border border-hw-accent/30 bg-hw-surface text-hw-accent flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-xl bg-hw-surface border border-hw-border text-hw-text-dim rounded-tl-none text-[10px] animate-pulse italic uppercase tracking-widest font-black">
              Neural_Processing...
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
            placeholder="ENCODE QUERY..."
            className="hw-input w-full pl-5 pr-14 py-4 uppercase shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-hw-primary text-white rounded-lg shadow-lg hover:bg-orange-500 transition-all disabled:opacity-20 disabled:grayscale active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-20 text-[7px] font-black uppercase tracking-[0.5em] select-none">
          <span>Heuristic_Mode.v3.1</span>
          <div className="w-1 h-1 rounded-full bg-hw-text" />
          <span>Core_Link: Secured</span>
        </div>
      </form>
    </div>
  );
}
