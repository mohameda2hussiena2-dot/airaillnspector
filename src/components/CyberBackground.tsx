import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export function CyberBackground() {
  // Generate random static particles to look like a stellar technical constellation
  const particles = useMemo(() => {
    return Array.from({ length: 22 }, (_, idx) => ({
      id: idx,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
      color: idx % 3 === 0 ? 'rgba(59, 130, 246, 0.45)' : idx % 3 === 1 ? 'rgba(6, 182, 212, 0.45)' : 'rgba(139, 92, 246, 0.35)',
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Absolute Dark Cyber Backdrop */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Futuristic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Cybernetic Tech Guide Markers (Radar Coordinates on Corners) */}
      <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-blue-500/25" />
      <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-blue-500/25" />
      <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-blue-500/25" />
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-blue-500/25" />

      {/* Ambient Large Cyber Glows (Deep Indigo and Cyber Cyan) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px]" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[120px]" />

      {/* Floating Constellation Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: 15, opacity: 0.2 }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            opacity: [0.15, 0.65, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: p.delay,
          }}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* Dynamic Scan Line Animation */}
      <div 
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-40 animate-scan pointer-events-none"
        style={{
          animation: 'scan-line 12s linear infinite',
        }}
      />

      {/* Horizontal Noise Ribbon Layer */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
    </div>
  );
}
