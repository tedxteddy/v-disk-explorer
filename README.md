# V-Disk Explorer

A futuristic virtual hard disk file explorer with a retro mechanical aesthetic. Drag, drop, and manage your files in style!

![V-Disk Explorer](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

## Live Demo

🔗 **https://v-disk-explorer.vercel.app**

## Features

### Core Features
- 🖥️ **Retro Hard Disk UI** - Click the disk to spin it up with mechanical sound effects
- 🎬 **Animated Transitions** - Smooth cinematic transitions to explorer view
- 📁 **File Explorer** - Virtual storage organized like a real hard drive
- 📁 **Folder Creation** - Create nested directories (folders inside folders)
- 📤 **Drag & Drop Upload** - Drag files directly into the app to upload
- 💾 **Drag & Drop Files** - Drag files between folders to organize

### File Management
- 🖼️ **Image Preview** - View images directly in app (JPG, PNG, GIF, WebP)
- 🎥 **Video Preview** - Watch videos inline (MP4, MOV, AVI, WebM)
- 📦 **ZIP Inspector** - Preview ZIP file contents without extracting
- ⬇️ **File Download** - Download any file with one click
- 🔍 **Search** - Find files by name across all storage
- 🔎 **Advanced Filters** - Filter by type, size, or date

### User Experience
- 🌙 **Dark/Light Theme** - Toggle between dark and light modes
- 📱 **Responsive Design** - Works on desktop and tablets
- 🎯 **Context Menus** - Right-click for quick actions (rename, delete, share)
- 🔔 **Share Links** - Generate shareable links for files and folders
- 💾 **Local Storage** - All data stored locally in your browser

### UI/UX
- 🎨 **Hardware Aesthetic** - Mechanical hard drive inspired design
- ✨ **Smooth Animations** - Powered by Motion (Framer Motion)
- 🎭 **Hardware Sounds** - Mechanical click and spin sounds
- 📊 **Status Indicators** - Real-time storage usage display

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tedxteddy/v-disk-explorer.git
cd v-disk-explorer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

### Vercel (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New → Project"
3. Import `tedxteddy/v-disk-explorer`
4. Click "Deploy"

### Netlify
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `dist` folder
3. Get your live URL!

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **ZIP Handling:** JSZip
- **Audio:** Howler.js

## Project Structure

```
v-disk-explorer/
├── src/
│   ├── components/
│   │   ├── Chat.tsx          # AI Chat (optional feature)
│   │   ├── ChatSidebar.tsx    # Chat sidebar
│   │   ├── ContextMenu.tsx   # Right-click menu
│   │   ├── DiskLanding.tsx    # Landing disk UI
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── FileExplorer.tsx  # Main file explorer
│   │   ├── ImageAnalysis.tsx  # File details panel
│   │   └── ShareModal.tsx    # Share link modal
│   ├── App.tsx               # Main app component
│   ├── localStorage.ts       # Local storage utilities
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── server.ts                # Backend server (optional)
└── package.json
```

## Upcoming Features

### Phase 2 - Backend Integration
- 🔗 **Real Share Links** - Token-based shared storage access
- 👥 **Multi-User Chat** - Real-time chat via WebSocket
- 👥 **User Presence** - See who's online
- 🔐 **Permission Levels** - Viewer / Contributor roles

### Phase 3 - Cloud Storage
- ☁️ **Cloud Backend** - Firebase / Supabase integration
- 🔄 **Cross-Device Sync** - Access your files anywhere
- 📱 **Progressive Web App** - Installable PWA
- 🔔 **Push Notifications** - Real-time updates

### Phase 4 - Advanced Features
- 🤖 **AI File Assistant** - Smart file organization
- 📊 **Storage Analytics** - Usage visualizations
- 🎭 **Custom Themes** - Upload custom themes
- 📤 **Bulk Operations** - Multi-file select & move
- 🔒 **Encryption** - Client-side file encryption

## Known Limitations

- 📱 **Mobile Not Supported** - Desktop/Tablet only
- 💾 **Browser Storage** - Data limited to browser localStorage
- 🌐 **No Cloud Sync** - Files stay in current browser (prototype)

## Credits

Created with 🔥 by [Tashmoi Dey](https://github.com/tedxteddy) using [Google AI Studio](https://aistudio.google.com)

---

⭐ Star the repo if you like it!