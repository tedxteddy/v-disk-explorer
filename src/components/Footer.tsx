import React from 'react';
import { Github, Instagram, ExternalLink, Disc } from 'lucide-react';

export function Footer() {
  const links = [
    { icon: Github, href: 'https://github.com/tedxteddy', label: 'GitHub' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: ExternalLink, href: 'https://designbytedx.framer.website', label: 'Portfolio' }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 bg-hw-surface border-t border-hw-border z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Disc className="w-4 h-4 text-hw-primary animate-spin-slow" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-hw-text-dim">V-Disk Explorer</span>
      </div>

      <div className="flex items-center gap-4">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-hw-text-dim hover:text-hw-primary transition-colors group"
          >
            <link.icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-[7px] font-bold uppercase tracking-wider">{link.label}</span>
          </a>
        ))}
      </div>
    </footer>
  );
}