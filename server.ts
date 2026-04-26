import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const DATA_DIR = './data';
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory storage (can be replaced with database)
let shareLinks: Record<string, any> = {};
let chatMessages: Record<string, any> = {};
let files: Record<string, any> = {};

// Load data from files
try {
  if (existsSync('./data/shares.json')) {
    shareLinks = JSON.parse(readFileSync('./data/shares.json', 'utf-8'));
  }
  if (existsSync('./data/chats.json')) {
    chatMessages = JSON.parse(readFileSync('./data/chats.json', 'utf-8'));
  }
  if (existsSync('./data/files.json')) {
    files = JSON.parse(readFileSync('./data/files.json', 'utf-8'));
  }
} catch (e) {}

// Save data helper
function saveData() {
  writeFileSync('./data/shares.json', JSON.stringify(shareLinks, null, 2));
  writeFileSync('./data/chats.json', JSON.stringify(chatMessages, null, 2));
  writeFileSync('./data/files.json', JSON.stringify(files, null, 2));
}

// Generate random token
function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// API Routes

// Get files for a storage ID
app.get('/api/files/:storageId', (req, res) => {
  const { storageId } = req.params;
  res.json(files[storageId] || { files: [], folders: [] });
});

// Save files for a storage ID
app.post('/api/files/:storageId', (req, res) => {
  const { storageId } = req.params;
  const { files: fileList, folders } = req.body;
  files[storageId] = { files: fileList || [], folders: folders || [] };
  saveData();
  res.json({ success: true });
});

// Create share link
app.post('/api/share', (req, res) => {
  const { storageId, permissions } = req.body;
  const token = generateToken();
  const shareLink = {
    token,
    storageId,
    permissions: permissions || 'viewer',
    createdAt: new Date().toISOString(),
    expiresAt: null
  };
  shareLinks[token] = shareLink;
  saveData();
  res.json({ link: `${token}`, ...shareLink });
});

// Validate share link
app.get('/api/share/:token', (req, res) => {
  const { token } = req.params;
  const shareLink = shareLinks[token];
  if (shareLink) {
    res.json({ valid: true, ...shareLink });
  } else {
    res.json({ valid: false });
  }
});

// Get chat messages for a storage
app.get('/api/chat/:storageId', (req, res) => {
  const { storageId } = req.params;
  res.json(chatMessages[storageId] || []);
});

// WebSocket Chat
const userSockets: Record<string, string> = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins a storage room
  socket.on('join', ({ storageId, username }) => {
    socket.join(storageId);
    userSockets[socket.id] = storageId;
    socket.username = username || `User_${socket.id.slice(0, 4)}`;
    
    // Notify others
    socket.to(storageId).emit('userJoined', {
      username: socket.username,
      message: `${socket.username} joined the chat`
    });
  });

  // User sends message
  socket.on('message', ({ storageId, message }) => {
    const msgData = {
      id: generateToken(8),
      username: socket.username,
      message,
      timestamp: new Date().toISOString()
    };
    
    // Store message
    if (!chatMessages[storageId]) {
      chatMessages[storageId] = [];
    }
    chatMessages[storageId].push(msgData);
    
    // Keep last 100 messages
    if (chatMessages[storageId].length > 100) {
      chatMessages[storageId] = chatMessages[storageId].slice(-100);
    }
    saveData();
    
    // Broadcast to room
    io.to(storageId).emit('message', msgData);
  });

  // User disconnects
  socket.on('disconnect', () => {
    const storageId = userSockets[socket.id];
    if (storageId) {
      socket.to(storageId).emit('userLeft', {
        username: socket.username,
        message: `${socket.username} left the chat`
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});