# <img src="https://img.shields.io/badge/V_Disk_Explorer-1.0.0-6B36FF?style=for-the-badge&logo=hdd&logoColor=white" alt="Version"/>
<div align="center">

![V Disk Explorer](https://img.shields.io/badge/Virtual_Disk_Explorer-6B36FF?style=flat-square&logo=hdd&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![AI Studio](https://img.shields.io/badge/Google_AI_Studio-4285F4?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

*A sleek virtual hard disk explorer with file management, demo chat, and AI- powered features — built with Google AI Studio.*

**[Live Demo](https://v-disk-explorer.vercel.app)** ·
**[Report Bug](https://github.com/tedxteddy/v-disk-explorer/issues)** ·
**[Request Feature](https://github.com/tedxteddy/v-disk-explorer/issues)**

</div>

---

## Table of Contents
- [Features](#features)
- [AI Integration](#-ai-integration)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Customization](#-customization)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#license)

---

## Features
| Feature | Description |
|---|
| 📁 **Virtual File Explorer** | Browse, create, rename, and delete virtual files and folders |
| 💬 **Demo Chat** | Local messaging with AI-powered auto-replies using Google AI Studio |
| ⚙️ **Settings Panel** | Privacy controls, theme toggle (dark/light), and demo toggles |
| 🎨 **Responsive Design** | Mobile-first UI with 44px touch targets |
| 💾 **Persistent Storage** | All data stored locally in your browser via localStorage |

---

## 🤖 AI Integration
This project uses **Google AI Studio** (formerly MakerSuite) as its AI backend for the demo chat feature.

### Setup

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new API key
3. Create a `.env.local` file in the root directory:

```env
VITE_GOOGLE_AI_API_KEY=your_api_key_here
```

4. Restart the dev server

```bash
npm run dev
```

> **Note:** Without an API key, the chat will fall back to simulated responses. The app works fully in demo mode without AI.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/tedxteddy/v-disk-explorer.git
cd v-disk-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 📂 Project Structure

```
v-disk-explorer/
├── src/
│   ├── components/
│   │   ├── DemoChat.tsx       # AI-powered chat interface
│   │   ├── FileExplorer.tsx    # Virtual file manager
│   │   ├── Footer.tsx         # Persistent footer
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── Settings.tsx       # Settings panel
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/
├── .env.example              # Environment template
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠 Tech Stack
| Technology | Purpose |
|---|---|
| **React** | UI library |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **Google AI Studio** | AI chat backend |
| **CSS** | Custom styling (mobile-responsive) |

---

## 🎨 Customization

### Themes

The app supports **Dark** and **Light** themes. Toggle via the Settings panel.

### Adding New Files

Edit `src/components/FileExplorer.tsx` to add new file types or storage behavior.

### Modifying Chat AI

Update the prompt in `src/components/DemoChat.tsx` to customize AI responses.

---

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tedxteddy/v-disk-explorer)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables (see [AI Setup](#-ai-integration))
4. Deploy

### Netlify

```bash
npm run build
# Drag the dist/ folder to Netlify deploys
```

### Manual

Upload the `dist/` folder contents to any static hosting service.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source under the **MIT License**.

---

<div align="center">

**Built with ❤️ by [Tashmoi Dey](https://github.com/tedxteddy)** ·
**Powered by [Google AI Studio](https://aistudio.google.com)**

[![Follow on GitHub](https://img.shields.io/badge/Follow-000?style=flat&logo=github&logoColor=white)](https://github.com/tedxteddy)
[![Instagram](https://img.shields.io/badge/@tedxteddy-E4405F?style=flat&logo=instagram&logoColor=white)](https://instagram.com/tedxteddy)

</div>