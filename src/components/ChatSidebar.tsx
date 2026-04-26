import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Users, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatSidebarProps {
  storageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ storageId, isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showJoin, setShowJoin] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !storageId) return;

    // Connect to socket server
    const socket = io(window.location.origin.replace(':3000', ':3001') || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('userJoined', (data: { username: string; message: string }) => {
      setMessages(prev => [...prev, {
        id: 'system',
        username: 'System',
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    socket.on('userLeft', (data: { username: string; message: string }) => {
      setMessages(prev => [...prev, {
        id: 'system',
        username: 'System',
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    // Fetch previous messages
    fetch(`/api/chat/${storageId}`)
      .then(res => res.json())
      .then(data => setMessages(data || []));

    return () => {
      socket.disconnect();
    };
  }, [isOpen, storageId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChat = () => {
    if (username.trim() && socketRef.current) {
      socketRef.current.emit('join', { storageId, username: username.trim() });
      setShowJoin(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('message', { storageId, message: input.trim() });
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="w-72 bg-hw-surface border-r border-hw-border flex flex-col h-full font-mono"
    >
      {/* Header */}
      <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-hw-primary" />
          <span className="text-[10px] font-black uppercase tracking-wider">Chat</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded">
          <X className="w-4 h-4 text-hw-text-dim" />
        </button>
      </div>

      {/* Join or Chat */}
      {showJoin ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-[10px] text-hw-text-dim mb-4 text-center">Enter your name to join the chat</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name..."
            className="w-full p-2 bg-black/40 border border-hw-border rounded text-xs mb-2 focus:outline-none focus:border-hw-primary"
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
          />
          <button
            onClick={joinChat}
            className="w-full py-2 bg-hw-primary text-white text-xs font-black uppercase rounded"
          >
            Join Chat
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={cn(
                  "text-xs",
                  msg.id === 'system' ? "text-center text-hw-text-dim italic" :
                  msg.username === username ? "text-right" : "text-left"
                )}
              >
                {msg.id !== 'system' && (
                  <span className="text-[8px] text-hw-primary block">{msg.username}</span>
                )}
                <span className={cn(
                  "inline-block px-2 py-1 rounded",
                  msg.id === 'system' ? "bg-transparent" :
                  msg.username === username ? "bg-hw-primary/20 border border-hw-primary/30" : "bg-hw-surface border border-hw-border"
                )}>
                  {msg.message}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-hw-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type..."
                className="flex-1 p-2 bg-black/40 border border-hw-border rounded text-xs focus:outline-none focus:border-hw-primary"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-hw-primary text-white rounded disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[8px] text-hw-text-dim">
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-hw-accent" : "bg-red-500")} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
}