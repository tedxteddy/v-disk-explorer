import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { VirtualFile, VirtualFolder, ChatMessage as ChatMsgType } from '../types';
import { getFiles, saveFile, updateFile, deleteFile, getFolders, saveFolder, updateFolder, deleteFolder, getApiKey } from '../localStorage';

const generateToken = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export function useChat(storageId: string) {
  const [messages, setMessages] = useState<ChatMsgType[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(() => `User_${generateToken(4)}`);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!storageId) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('message', (msg: ChatMsgType) => {
      setMessages(prev => [...prev, msg]);
    });

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/${storageId}`)
      .then(res => res.json())
      .then(data => setMessages(data || []));

    return () => { socket.disconnect(); };
  }, [storageId]);

  const joinChat = () => {
    socketRef.current?.emit('join', { storageId, username });
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current?.emit('message', { storageId, message: input });
    setInput('');
  };

  return { messages, input, setInput, username, setUsername, isConnected, joinChat, sendMessage };
}

export function generateShareLink(storageId: string, permissions: string = 'viewer') {
  return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storageId, permissions })
  }).then(res => res.json());
}

export function validateShareLink(token: string) {
  return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/share/${token}`)
    .then(res => res.json());
}