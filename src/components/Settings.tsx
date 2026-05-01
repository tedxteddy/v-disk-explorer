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
  Info,
  Database,
  Shuffle,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
        "relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 shadow-inner",
        enabled ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]" : "bg-hw-border-bold"
      )}
    >
      <motion.div
        layout
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full shadow-lg flex items-center justify-center",
          enabled ? "bg-white" : "bg-white/50"
        )}
      >
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="w-2 h-2 rounded-full bg-orange-500"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );

  const SettingCard = ({ 
    icon: Icon, 
    iconActive, 
    label, 
    description, 
    enabled, 
    onChange,
    accentColor = "hw-accent"
  }: { 
    icon: React.ElementType; 
    iconActive: React.ElementType;
    label: string; 
    description: string; 
    enabled: boolean; 
    onChange: () => void;
    accentColor?: string;
  }) => (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onChange}
      className={cn(
        "w-full flex items-center justify-between p-4 sm:p-5 bg-hw-surface border rounded-2xl gap-4 transition-all duration-300 group cursor-pointer",
        enabled 
          ? "border-orange-500/40 shadow-[0_0_20px_rgba(234,88,12,0.15)]" 
          : "border-hw-border hover:border-hw-border-bold"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className={cn(
          "p-2.5 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0",
          enabled 
            ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 shadow-lg" 
            : "bg-hw-border-bold/30 group-hover:bg-hw-border-bold/50"
        )}>
          <AnimatePresence mode="wait">
            {enabled ? (
              <motion.div
                key="active"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6 text-orange-400")} />
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: -90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-hw-text-dim" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <span className={cn(
            "text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-300 truncate",
            enabled ? "text-white" : "text-white/70"
          )}>
            {label}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-hw-text-dim mt-0.5 sm:mt-1">{description}</span>
        </div>
      </div>
      <Toggle 
        enabled={enabled} 
        onChange={onChange}
        label={`Toggle ${label}`}
      />
    </motion.button>
  );

  return (
    <div className="flex flex-col h-full bg-hw-bg text-hw-text font-mono selection:bg-orange-500/30">
      <div className="p-4 sm:p-5 border-b border-hw-border flex items-center justify-between bg-hw-surface-light shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.2)]">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">System.Config</h2>
            <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Parameters.Loaded
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hw-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(234, 88, 12, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 88, 12, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-orange-400 border-b border-hw-border pb-2">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Privacy_Protocol</span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <SettingCard
              icon={EyeOff}
              iconActive={EyeOff}
              label="Private Mode"
              description="Hide filenames & disable sharing"
              enabled={settings.privateMode}
              onChange={() => updateSetting('privateMode', !settings.privateMode)}
            />
            <SettingCard
              icon={Info}
              iconActive={Info}
              label="Hide Metadata"
              description="Hide size & date info"
              enabled={settings.hideMetadata}
              onChange={() => updateSetting('hideMetadata', !settings.hideMetadata)}
            />
            <SettingCard
              icon={Database}
              iconActive={Database}
              label="Cache Mode"
              description="Enable local data caching"
              enabled={settings.cacheEnabled}
              onChange={() => updateSetting('cacheEnabled', !settings.cacheEnabled)}
            />
            <SettingCard
              icon={Shuffle}
              iconActive={Shuffle}
              label="Random Mode"
              description="Random file ordering"
              enabled={settings.randomModeEnabled}
              onChange={() => updateSetting('randomModeEnabled', !settings.randomModeEnabled)}
            />
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-orange-400 border-b border-hw-border pb-2">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Demo_Modules</span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <SettingCard
              icon={MessageSquare}
              iconActive={MessageSquare}
              label="Demo Chat Mode"
              description="Simulated messaging system"
              enabled={settings.demoChatEnabled}
              onChange={() => updateSetting('demoChatEnabled', !settings.demoChatEnabled)}
            />
            <SettingCard
              icon={Bell}
              iconActive={Bell}
              label="Notification Catch"
              description="Simulate incoming alerts"
              enabled={settings.notificationCatchEnabled}
              onChange={() => updateSetting('notificationCatchEnabled', !settings.notificationCatchEnabled)}
            />
            <SettingCard
              icon={Bot}
              iconActive={Bot}
              label="Auto Reply"
              description="Bot auto-responds to messages"
              enabled={settings.autoReplyEnabled}
              onChange={() => updateSetting('autoReplyEnabled', !settings.autoReplyEnabled)}
            />
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-400 border-b border-hw-border pb-2">
            <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Storage_Control</span>
          </div>

          <div className="p-4 sm:p-5 bg-hw-surface border border-hw-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Storage Limit</span>
                  <span className="text-[10px] sm:text-xs font-medium text-hw-text-dim">Set artificial limit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.storageLimitMB}
                  onChange={(e) => updateSetting('storageLimitMB', parseInt(e.target.value) || 100)}
                  className="w-20 sm:w-24 bg-black/50 border border-hw-border rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-center uppercase focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  min={1}
                  max={10000}
                />
                <span className="text-[10px] sm:text-xs font-bold text-hw-text-dim uppercase">MB</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearStorage}
              className="w-full flex items-center justify-center gap-2.5 p-3.5 sm:p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 text-red-400 rounded-xl hover:border-red-500/50 hover:from-red-500/20 hover:to-red-600/20 transition-all shadow-lg"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Clear All Storage</span>
            </motion.button>
          </div>
        </section>

        <div className="pb-24 sm:pb-28 text-center opacity-40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
          <span>V-Disk Explorer v1.02</span>
        </div>
      </div>
    </div>
  );
}
