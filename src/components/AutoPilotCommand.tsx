import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Compass, 
  MapPin, 
  Navigation, 
  Battery, 
  Wifi, 
  Cpu, 
  ShieldAlert,
  Sliders,
  Crosshair,
  Gauge,
  Radio
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface Waypoint {
  id: number;
  lat: number;
  lng: number;
  label: string;
  status: 'PENDING' | 'VISITED' | 'ACTIVE';
}

export function AutoPilotCommand() {
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [missionActive, setMissionActive] = useState(false);
  const [scannedPct, setScannedPct] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(15); // m/s
  const [altitude, setAltitude] = useState(24.5); // meters
  const [batteryPct, setBatteryPct] = useState(94);
  const [satelliteCount, setSatelliteCount] = useState(14);
  const [activeWaypoints, setActiveWaypoints] = useState<Waypoint[]>([
    { id: 1, lat: 31.0409, lng: 31.3785, label: 'Borg El Arab Tech Univ', status: 'PENDING' },
    { id: 2, lat: 31.0450, lng: 31.3810, label: 'Sector A-2 Fasteners', status: 'PENDING' },
    { id: 3, lat: 31.0510, lng: 31.3850, label: 'Sector B-1 Cross-junction', status: 'PENDING' },
    { id: 4, lat: 31.0590, lng: 31.3910, label: 'Al-Amriya Depot Terminal', status: 'PENDING' },
  ]);

  // Telemetry loading spinner
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulating the flight progression
  useEffect(() => {
    if (!missionActive) return;

    const interval = setInterval(() => {
      setScannedPct(prev => {
        if (prev >= 100) {
          setMissionActive(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });

      // Gradually reduce battery
      setBatteryPct(p => Math.max(15, Number((p - 0.15).toFixed(1))));

      // Introduce noise transitions in altitude
      setAltitude(a => Number((a + (Math.random() - 0.5) * 0.4).toFixed(1)));

      // Simulating passing points on the vector map
      setActiveWaypoints(prev => {
        const threshold = 100 / prev.length;
        return prev.map((wp, idx) => {
          const currentPctMatch = threshold * (idx + 1);
          if (scannedPct >= currentPctMatch) {
            return { ...wp, status: 'VISITED' };
          } else if (scannedPct >= currentPctMatch - threshold) {
            return { ...wp, status: 'ACTIVE' };
          }
          return wp;
        });
      });
    }, 400);

    return () => clearInterval(interval);
  }, [missionActive, scannedPct]);

  const handleStartMission = () => {
    setScannedPct(0);
    setMissionActive(true);
    // Reset waypoint statuses
    setActiveWaypoints(prev => prev.map(wp => ({ ...wp, status: 'PENDING' })));
  };

  const handleAbortMission = () => {
    setMissionActive(false);
  };

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Navigation className="w-6 h-6 animate-pulse" />
            </span>
            {isRTL ? 'مركز التحكم والقيادة الذاتية للمسيرات' : 'AI Drone AutoPilot Console'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'توجيه الطيران الذاتي وتقفي مسارات قضبان السكة الحديدية وفحص الإحداثيات المتفقة مع معايير الأمان الوطنية.' 
              : 'Direct self-guided drone missions. Auto-pilot path calculations, waypoints tracking, and remote mechanical telemetry.'}
          </p>
        </div>

        {missionActive && (
          <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            LIVE FLIGHT ACTIVE
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[550px]" key="pilot-skeleton">
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            key="pilot-content"
          >
            {/* Left Hand Panel: Dark Flight Map & Vector Overlay */}
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 min-h-[480px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center relative z-10 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-400" />
                    {isRTL ? 'رادار الملاحة المتجهي ثلاثي الأبعاد' : '3D Tactical Vector Map'}
                  </h3>
                  <p className="text-[10px] text-slate-500">{isRTL ? 'إحداثيات مسار برج العرب - العامرية' : 'Sector route: Borg El Arab Technological Segment'}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">31.0409° N, 31.3785° E</span>
              </div>

              {/* Vector SVG Map Container */}
              <div className="flex-1 bg-[#030712] border border-white/5 rounded-2xl relative overflow-hidden min-h-[300px] flex items-center justify-center">
                {/* Radar Sweep Arc */}
                <div className="absolute w-[350px] h-[350px] border border-blue-500/5 rounded-full flex items-center justify-center">
                  <div className="absolute w-[250px] h-[250px] border border-blue-500/10 rounded-full" />
                  <div className="absolute w-[150px] h-[150px] border border-blue-500/20 rounded-full" />
                  <div className="absolute w-full h-[1px] bg-blue-500/10" />
                  <div className="absolute h-full w-[1px] bg-blue-500/10" />
                </div>

                {missionActive && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-transparent to-blue-500/10 rounded-full z-10 origin-center pointer-events-none"
                  />
                )}

                {/* SVG Waypoint connector */}
                <svg className="absolute inset-0 w-full h-full p-10 z-20">
                  {/* Flight Track line */}
                  <polyline
                    points="60,240 160,140 260,180 340,60"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                    strokeDasharray="5,5"
                  />
                  {missionActive && (
                    <motion.polyline
                      points="60,240 160,140 260,180 340,60"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeDasharray="400"
                      strokeDashoffset={400 - (scannedPct / 100) * 400}
                    />
                  )}

                  {/* Nodes */}
                  <circle cx="60" cy="240" r="6" fill={activeWaypoints[0].status === 'VISITED' ? '#10b981' : activeWaypoints[0].status === 'ACTIVE' ? '#2563eb' : '#475569'} />
                  <circle cx="160" cy="140" r="6" fill={activeWaypoints[1].status === 'VISITED' ? '#10b981' : activeWaypoints[1].status === 'ACTIVE' ? '#2563eb' : '#475569'} />
                  <circle cx="260" cy="180" r="6" fill={activeWaypoints[2].status === 'VISITED' ? '#10b981' : activeWaypoints[2].status === 'ACTIVE' ? '#2563eb' : '#475569'} />
                  <circle cx="340" cy="60" r="6" fill={activeWaypoints[3].status === 'VISITED' ? '#10b981' : activeWaypoints[3].status === 'ACTIVE' ? '#2563eb' : '#475569'} />
                </svg>

                {/* Hover overlay waypoint tips */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between z-30">
                  {activeWaypoints.map((wp, i) => (
                    <div key={wp.id} className="flex flex-col items-center bg-slate-950/80 p-2 rounded-xl border border-white/5">
                      <span className="text-[8px] font-mono text-slate-500">WP-0{wp.id}</span>
                      <span className={`text-[9px] font-extrabold ${wp.status === 'VISITED' ? 'text-emerald-400' : wp.status === 'ACTIVE' ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}>
                        {wp.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Satellite Feed overlay */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SATELLITE SYNC: 100%</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{isRTL ? 'شبكة ملاحة برج العرب' : 'Borg Airport Local Grid'}</span>
                <span>WP LINK: ACTIVE</span>
              </div>
            </div>

            {/* Right Hand Panel: Dark Aviation Controls & Cockpit Instruments */}
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 mb-6">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  {isRTL ? 'شاشة توجيه الطيران والأجهزة والتروس' : 'Autopilot Mission & Avionics Dashboard'}
                </h3>

                {/* Core mission buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    disabled={missionActive}
                    onClick={handleStartMission}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                      missionActive 
                        ? 'bg-slate-900 border-white/5 text-slate-500' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-500/50 text-white shadow-lg shadow-blue-600/20 active:scale-95'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {isRTL ? 'بدء المهمة التلقائية' : 'Start Auto Mission'}
                  </button>

                  <button
                    disabled={!missionActive}
                    onClick={handleAbortMission}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                      !missionActive 
                        ? 'bg-slate-900 border-white/5 text-slate-500' 
                        : 'bg-red-950 hover:bg-red-900 border-red-500 text-red-400 shadow-lg shadow-red-900/30 active:scale-95 animate-pulse'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    {isRTL ? 'إلغاء المهمة فوراً' : 'Abort Flight Now'}
                  </button>
                </div>

                {/* Progress telemetry */}
                <div className="bg-[#040813] border border-white/5 p-4 rounded-2xl mb-6">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">{isRTL ? 'تقدم المسح للمسار' : 'Track Scanning Progress'}</span>
                    <span className="text-blue-400 font-bold">{scannedPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${scannedPct}%` }} />
                  </div>
                </div>

                {/* Flight Instruments grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {/* Satellites */}
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'الأقمار الصناعية' : 'SATS'}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-lg font-black font-mono text-white">{satelliteCount}</span>
                      <span className="text-[8px] text-emerald-400">SYNCED</span>
                    </div>
                  </div>

                  {/* Battery */}
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'البطارية' : 'BATTERY'}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Battery className={`w-4 h-4 ${batteryPct < 25 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                      <span className="text-lg font-black font-mono text-white">{batteryPct}%</span>
                    </div>
                  </div>

                  {/* Speed Gauge */}
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'السرعة الجوية' : 'AIRSPEED'}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-lg font-black font-mono text-white">{currentSpeed}</span>
                      <span className="text-[8px] text-slate-400">m/s</span>
                    </div>
                  </div>

                  {/* Altitude */}
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'الارتفاع الميداني' : 'ALTITUDE'}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-lg font-black font-mono text-white">{altitude}</span>
                      <span className="text-[8px] text-slate-400">m</span>
                    </div>
                  </div>
                </div>

                {/* Interactive controller sliders */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="text-slate-400">{isRTL ? 'سرعة المسيرة القصوى' : 'Maximum Autopilot Speed'}</span>
                      <span className="text-blue-400 font-bold">{currentSpeed} m/s</span>
                    </div>
                    <input 
                      type="range"
                      min={5}
                      max={35}
                      value={currentSpeed}
                      onChange={(e) => setCurrentSpeed(Number(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-3 mt-6">
                <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0 select-none mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <p className="font-extrabold text-white">{isRTL ? 'ضمان الحماية من التحليق العشوائي' : 'No-Fly Zone Auto Safe System'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {isRTL 
                      ? 'تم فرض حدود ملاحة ذكية تمنع اصطدام المسيرة وتطوق الإحاطة الجغرافية لمنطقة برج العرب.' 
                      : 'Geofencing borders bound to regulatory industrial flight boundaries. Automatic abort activates on battery < 15%.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
