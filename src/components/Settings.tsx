import React from 'react';
import { cn } from '../utils';
import { 
  Shield, 
  EyeOff, 
  MessageSquare, 
  Bell, 
  Bot, 
  HardDrive,
  Trash2,
  Lock,
  Info
} from 'lucide-react';
import { AppSettings } from '../types';
import { motion } from 'motion/react';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearStorage: () => void;
}

export function Settings({ settings, onSettingsChange, onClearStorage }: SettingsProps) {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const Toggle = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) => (
    <button
      onClick={onChange}
      aria-label={label}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0",
        enabled ? "bg-hw-primary" : "bg-hw-border-bold"
      )}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
      />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-hw-bg text-hw-text font-mono selection:bg-hw-primary/30">
      <div className="p-4 border-b border-hw-border flex items-center justify-between bg-hw-surface-light shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 bg-hw-accent/10 rounded border border-hw-accent/20">
            <Shield className="w-3.5 h-3.5 text-hw-accent" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">System.Config</h2>
            <span className="text-[7px] font-bold text-hw-accent uppercase tracking-[0.1em] flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-hw-accent" /> Parameters.Loaded
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hw-scrollbar p-4 md:p-6 space-y-6 md:space-y-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-hw-accent border-b border-hw-border pb-2">
            <Lock className="w-3 h-3" />
            <span>Privacy_Protocol</span>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <EyeOff className="w-4 h-4 text-hw-text-dim flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">Private Mode</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Mask filenames & disable sharing</span>
                </div>
              </div>
              <Toggle 
                enabled={settings.privateMode} 
                onChange={() => updateSetting('privateMode', !settings.privateMode)}
                label="Toggle Private Mode"
              />
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Info className="w-4 h-4 text-hw-text-dim flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">Hide Metadata</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Hide size & date info</span>
                </div>
              </div>
              <Toggle 
                enabled={settings.hideMetadata} 
                onChange={() => updateSetting('hideMetadata', !settings.hideMetadata)}
                label="Toggle Hide Metadata"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-hw-primary border-b border-hw-border pb-2">
            <Bot className="w-3 h-3" />
            <span>Demo_Modules</span>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare className="w-4 h-4 text-hw-primary flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">Demo Chat Mode</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Enable simulated messaging</span>
                </div>
              </div>
              <Toggle 
                enabled={settings.demoChatEnabled} 
                onChange={() => updateSetting('demoChatEnabled', !settings.demoChatEnabled)}
                label="Toggle Demo Chat Mode"
              />
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 text-hw-primary flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">Notification Catch</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Simulate incoming alerts</span>
                </div>
              </div>
              <Toggle 
                enabled={settings.notificationCatchEnabled} 
                onChange={() => updateSetting('notificationCatchEnabled', !settings.notificationCatchEnabled)}
                label="Toggle Notification Catch"
              />
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Bot className="w-4 h-4 text-hw-primary flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">Auto Reply Simulation</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Bot responds to messages</span>
                </div>
              </div>
              <Toggle 
                enabled={settings.autoReplyEnabled} 
                onChange={() => updateSetting('autoReplyEnabled', !settings.autoReplyEnabled)}
                label="Toggle Auto Reply"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-blue-400 border-b border-hw-border pb-2">
            <HardDrive className="w-3 h-3" />
            <span>Storage_Control</span>
          </div>

          <div className="p-3 md:p-4 bg-hw-surface border border-hw-border rounded-xl space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white">Storage Limit</span>
                  <span className="text-[7px] md:text-[8px] font-medium text-hw-text-dim hidden sm:block">Set artificial limit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.storageLimitMB}
                  onChange={(e) => updateSetting('storageLimitMB', parseInt(e.target.value) || 100)}
                  className="w-16 md:w-20 bg-black/40 border border-hw-border rounded px-2 py-1 text-[10px] md:text-[11px] font-bold text-center uppercase"
                  min={1}
                  max={10000}
                />
                <span className="text-[7px] md:text-[8px] font-bold text-hw-text-dim uppercase">MB</span>
              </div>
            </div>

            <button
              onClick={onClearStorage}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Clear Storage</span>
            </button>
          </div>
        </section>

        <div className="pb-20 md:pb-24 text-center opacity-30 text-[7px] md:text-[8px] font-black uppercase tracking-widest">
          <span>Prototype.v1.02 // Non-Persistent</span>
        </div>
      </div>
    </div>
  );
}