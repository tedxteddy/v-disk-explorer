import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Howl } from 'howler';
import { Disc, Zap, Cpu, HardDrive as HardDriveIcon, Database } from 'lucide-react';
import { cn } from '../utils';

interface DiskLandingProps {
  onEnter: () => void;
}

export function DiskLanding({ onEnter }: DiskLandingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const clickSound = new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Mechanical click
    volume: 0.5
  });

  const spinSound = new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], // Startup whir
    volume: 0.3
  });

  const handleClick = () => {
    clickSound.play();
    spinSound.play();
    setIsSpinning(true);
    
    // Animate zoom and enter
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-hw-bg text-white flex flex-col items-center justify-center p-8 overflow-hidden font-mono selection:bg-hw-primary/30">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--color-hw-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center gap-12"
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="flex justify-center gap-8 mb-4"
          >
            <Cpu className="w-4 h-4 text-hw-primary" />
            <Zap className="w-4 h-4 text-hw-accent" />
            <Database className="w-4 h-4 text-hw-primary" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_30px_rgba(234,88,12,0.3)]">
              V-Disk<br />
              <span className="text-hw-primary">Explorer.</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-hw-primary/30" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-hw-text-dim">Mechanical Storage Simulation v3.1</p>
            <div className="h-px w-8 bg-hw-primary/30" />
          </div>
        </div>

        {/* The Disk Component */}
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          className="group relative cursor-pointer"
          animate={isSpinning ? { scale: 12, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Main Case */}
          <div className="w-64 h-80 bg-hw-surface rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-6 flex flex-col border border-hw-border-bold relative overflow-hidden group-hover:border-hw-primary/50 transition-colors duration-500">
            {/* Top Plate Texture */}
            <div className="absolute inset-0 opacity-5" 
                 style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)' , backgroundSize: '4px 4px'}} />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="space-y-1.5">
                <div className="w-8 h-1 bg-hw-primary/40 rounded-full" />
                <div className="w-12 h-1 bg-hw-primary/20 rounded-full" />
              </div>
              <HardDriveIcon className="w-6 h-6 text-hw-primary animate-pulse" />
            </div>

            {/* Platter and Head Arm Container */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* HDD Platter Shadow */}
              <div className="absolute w-52 h-52 rounded-full bg-black/40 blur-xl translate-y-4" />
              
              {/* Spinning Platter */}
              <motion.div
                animate={{ rotate: isSpinning ? 3600 : (isHovered ? 360 : 0) }}
                transition={{ 
                  duration: isSpinning ? 1.5 : (isHovered ? 10 : 0), 
                  ease: isSpinning ? "easeIn" : "linear",
                  repeat: isSpinning ? 0 : Infinity 
                }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#1a1a1a] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/5 relative"
              >
                {/* Platter Center */}
                <div className="w-14 h-14 rounded-full bg-hw-surface border border-hw-border-bold flex items-center justify-center shadow-2xl relative z-10">
                  <div className="w-4 h-4 rounded-full bg-hw-primary/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-hw-primary" />
                  </div>
                </div>
                {/* Rainbow sheen */}
                <div className="absolute inset-0 rounded-full opacity-10 bg-gradient-to-tr from-hw-primary via-transparent to-hw-accent mix-blend-overlay" />
                
                {/* Etched rings */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute inset-0 border border-white/5 rounded-full" style={{ margin: i * 12 }} />
                ))}
              </motion.div>

              {/* Head Arm */}
              <motion.div 
                animate={isHovered ? { rotate: -15 } : { rotate: 0 }}
                className="absolute top-1/2 left-1/2 w-32 h-2 flex items-center origin-left -translate-y-1/2 z-20 pointer-events-none"
                style={{ left: '55%', top: '45%' }}
              >
                <div className="w-full h-full bg-gradient-to-r from-gray-500 to-hw-text-dim rounded-full shadow-2xl relative">
                  {/* Read/Write Head */}
                  <div className="absolute right-0 w-5 h-5 -top-1.5 bg-hw-surface-light rounded-sm transform rotate-45 border border-hw-border" />
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex justify-between items-end relative z-10">
              <div className="text-[8px] font-black text-hw-text-dim space-y-1 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-hw-primary" />
                   MODEL: GM-9000-X
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-hw-accent" />
                   S/N: 73044-AIS
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-hw-accent animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-hw-primary opacity-20" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p 
          animate={{ opacity: isHovered ? 1 : 0.4 }}
          className="text-[10px] font-black uppercase tracking-[0.5em] text-hw-primary"
        >
          {isSpinning ? "Initializing.Sectors..." : "Click Disk to Spin Up"}
        </motion.p>
      </motion.div>

      {/* Industrial Decorative Elements */}
      <div className="fixed bottom-12 left-12 flex items-center gap-4 opacity-20">
        <div className="h-px w-24 bg-hw-border-bold" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Sata-III 6gb/s // BUS_MODE: HIGH</span>
      </div>
      <div className="fixed top-12 right-12 flex flex-col items-end gap-2 opacity-20">
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Temp: 34°C (Optimal)</span>
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => <div key={i} className="w-1 h-4 bg-hw-border-bold rounded-full" />)}
        </div>
      </div>
    </div>
  );
}
