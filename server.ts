import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VFile {
  id: string;
  name: string;
  type: "image" | "video" | "zip" | "other";
  size: number;
  url: string;
  createdAt: string;
  parentId?: string;
}

interface VFolder {
  id: string;
  name: string;
  parentId?: string;
}

// In-memory "Virtual Disk"
let files: VFile[] = [
  { id: "f1", name: "beach.jpg", type: "image", size: 1024 * 500, url: "https://picsum.photos/seed/beach/800/600", createdAt: new Date().toISOString() },
  { id: "f2", name: "presentation.zip", type: "zip", size: 1024 * 5000, url: "#", createdAt: new Date().toISOString() },
  { id: "f3", name: "demo.mp4", type: "video", size: 1024 * 15000, url: "#", createdAt: new Date().toISOString() },
];

let folders: VFolder[] = [
  { id: "root", name: "Root" },
  { id: "work", name: "Work", parentId: "root" },
  { id: "media", name: "Media", parentId: "root" },
];

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Virtual Disk API
  app.get("/api/disk/files", (req, res) => {
    const parentId = req.query.parentId as string;
    const filtered = files.filter(f => f.parentId === parentId || (parentId === "root" && !f.parentId));
    res.json(filtered);
  });

  app.get("/api/disk/folders", (req, res) => {
    const parentId = req.query.parentId as string;
    const filtered = folders.filter(f => f.parentId === parentId || (parentId === "root" && !f.parentId));
    res.json(filtered);
  });

  app.post("/api/disk/upload", (req, res) => {
    const { name, size, type, parentId } = req.body;
    // Simple classification logic if not provided
    let classifiedType: "image" | "video" | "zip" | "other" = type || "other";
    if (!type) {
      const ext = name.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) classifiedType = "image";
      else if (["mp4", "mov", "avi", "mkv"].includes(ext)) classifiedType = "video";
      else if (["zip", "rar", "7z", "tar"].includes(ext)) classifiedType = "zip";
    }

    const newFile: VFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      size: size || 0,
      type: classifiedType,
      url: classifiedType === "image" ? `https://picsum.photos/seed/${name}/800/600` : "#",
      createdAt: new Date().toISOString(),
      parentId
    };
    files.push(newFile);
    res.json(newFile);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
