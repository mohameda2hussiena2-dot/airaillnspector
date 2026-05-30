import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Battery, Radio, ShieldAlert, Cpu, Orbit, Compass, Sliders } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DroneTelemetryHUDProps {
  latitude: number;
  longitude: number;
  altitude: number;
  isActive: boolean;
}

export function DroneTelemetryHUD({ latitude, longitude, altitude, isActive }: DroneTelemetryHUDProps) {
  const { isRTL } = useLanguage();
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [battery, setBattery] = useState(98);
  const [speed, setSpeed] = useState(14.8);
  const [heading, setHeading] = useState(128);

  useEffect(() => {
    if (!isActive) return;

    // Simulate real drone micro-drifts and hover vibration
    const interval = setInterval(() => {
      setPitch((p) => p + (Math.random() - 0.5) * 1.5);
      setRoll((r) => r + (Math.random() - 0.5) * 1.5);
      setBattery((b) => Math.max(b - 0.02, 12));
      setSpeed((s) => Math.max(12.0, Math.min(22.0, s + (Math.random() - 0.5) * 0.8)));
      setHeading((h) => (h + (Math.random() - 0.5) * 0.5 + 360) % 360);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  // Combined rotation & translation matrix values for HUD drawing
  const hudTransform = `rotate(${roll}deg) translateY(${pitch * 1.5}px)`;

  // Dynamic Battery Health characteristics: 6S LiPo calculations with micro-noise fluctuation
  const hudVoltage = (18.6 + (battery / 100) * 6.4 + (Math.sin(Date.now() / 1000) * 0.01)).toFixed(2);
  const remainingSeconds = Math.round((battery / 100) * 1620); // 27 minutes max
  const remainingMins = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;

  return (
    <div className="bg-slate-950/45 border border-white/10 rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden flex flex-col gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      {/* Laser sweep animation overlay of the telemetry card */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)] opacity-20 animate-[scanLaser_4s_infinite_linear]" />
      <style>{`
        @keyframes scanLaser {
          0% { transform: translateY(0px); }
          50% { transform: translateY(220px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <Orbit className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="text-xs font-black font-mono text-slate-100 uppercase tracking-wider">
            {isRTL ? "مستشعرات فحص الطائرة المسيرة" : "DRONE APEX-9 TELEMETRY HUD"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black">
            {isRTL ? "متصل" : "STABLE"}
          </span>
        </div>
      </div>

      {/* Interactive HUD Circle instrument */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Pitch / Roll Artificial Horizon Gauge */}
        <div 
          className="relative w-36 h-36 rounded-full border border-white/10 bg-slate-900/40 flex items-center justify-center overflow-hidden shrink-0 shadow-lg cursor-pointer group"
          title="Micro-telemetry sensor horizon"
          onMouseMove={(e) => {
            // Permit interactive mouse hover hover pitch tilt change!
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            setRoll((mouseX / rect.width) * 45);
            setPitch((-mouseY / rect.height) * 35);
          }}
          onMouseLeave={() => {
            setRoll(0);
            setPitch(0);
          }}
        >
          {/* Degree angle indicator labels static ticks */}
          <div className="absolute inset-2 border border-dashed border-white/5 rounded-full pointer-events-none" />
          
          {/* Pitch lines ladder that translates/rotates */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-150 ease-out pointer-events-none"
            style={{ transform: hudTransform }}
          >
            {/* Sky / Ground fill separator */}
            <div className="w-48 h-1 bg-cyan-400/90 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            
            {/* Pitch ladders */}
            <div className="absolute -translate-y-8 w-12 border-t border-white/20 flex justify-between px-1 text-[7px] text-white/40 font-mono">
              <span>+10</span><span>|</span><span>+10</span>
            </div>
            <div className="absolute translate-y-8 w-12 border-t border-white/20 flex justify-between px-1 text-[7px] text-white/40 font-mono">
              <span>-10</span><span>|</span><span>-10</span>
            </div>
            <div className="absolute -translate-y-16 w-8 border-t border-white/10 flex justify-between px-1 text-[7px] text-white/30 font-mono">
              <span>+20</span><span>|</span><span>+20</span>
            </div>
            <div className="absolute translate-y-16 w-8 border-t border-white/10 flex justify-between px-1 text-[7px] text-white/30 font-mono">
              <span>-20</span><span>|</span><span>-20</span>
            </div>
          </div>

          {/* Fixed plane indicator crosshair */}
          <div className="absolute inset-x-8 h-[1px] bg-red-500/65 pointer-events-none flex items-center justify-between">
            <span className="w-3.5 h-[3px] bg-red-500 rounded-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="w-3.5 h-[3px] bg-red-500 rounded-sm" />
          </div>

          {/* Core HUD stats inside circle */}
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
            <span className="text-[8px] font-mono text-cyan-400 font-extrabold tracking-widest uppercase">
              R: {roll.toFixed(0)}° P: {pitch.toFixed(0)}°
            </span>
          </div>
        </div>

        {/* Telemetry metrics bar list */}
        <div className="flex-1 w-full space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "الاتجاه" : "GPS HEADING"}</span>
            </div>
            <span className="text-white font-black">{heading.toFixed(0)}° (SE)</span>
          </div>

          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "سرعة الفحص" : "SCAN VELOCITY"}</span>
            </div>
            <span className="text-cyan-400 font-black">{speed.toFixed(1)} km/h</span>
          </div>

          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRTL ? "مستوى البطارية" : "CELL STORAGE"}</span>
            </div>
            <span className="text-emerald-400 font-black">{battery.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-emerald-400 font-bold">⚡</span>
              <span>{isRTL ? "جهد الخلايا الحقيقي" : "REAL-TIME VOLTAGE"}</span>
            </div>
            <span className="text-emerald-400 font-black">{hudVoltage} V</span>
          </div>

          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-cyan-400 font-bold">⏱</span>
              <span>{isRTL ? "التحليق المتبقي المقدر" : "EST. REMAINING FLIGHT"}</span>
            </div>
            <span className="text-cyan-400 font-black">{remainingMins}m {remainingSecs}s</span>
          </div>

          <div className="flex justify-between items-center p-1.5 py-1 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isRTL ? "طاقة الإشارة" : "DSSS LINK RATE"}</span>
            </div>
            <span className="text-indigo-400 font-black">94.8 dBm (5.8G)</span>
          </div>
        </div>
      </div>

      {/* Numerical Coords bar inside HUD */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[10px] font-mono">
        <div>
          <p className="text-slate-500 uppercase text-[8px] tracking-wider">{isRTL ? "خط العرض" : "LATITUDE"}</p>
          <p className="text-slate-200 font-extrabold pt-0.5">{latitude.toFixed(6)}°</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[8px] tracking-wider">{isRTL ? "خط الطول" : "LONGITUDE"}</p>
          <p className="text-slate-200 font-extrabold pt-0.5">{longitude.toFixed(6)}°</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[8px] tracking-wider">{isRTL ? "الارتفاع" : "ALTITUDE"}</p>
          <p className="text-cyan-400 font-extrabold pt-0.5">{altitude.toFixed(1)}m</p>
        </div>
      </div>
    </div>
  );
}
