import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  Zap, 
  Thermometer, 
  RotateCcw, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DroneBattery {
  id: string;
  name: string;
  nameAr: string;
  voltage: number; // Volts
  cycles: number;  // Current cycles count
  maxCycles: number;
  temp: number;     // Celsius
  charge: number;   // Current state of charge %
  health: number;   // Battery State of Health %
  status: 'optimal' | 'warning' | 'hot' | 'low' | 'charging';
  model: string;
}

const LOCAL_TEXTS = {
  en: {
    title: "Drone Battery Telemetry Hub",
    subtitle: "Real-time state of health, voltage profiles, cycle logging, and thermal safety of integrated UAV batteries.",
    liveFeed: "Live Simulation",
    activeCount: "Drones Tracked: 4 Units",
    tempOptimalMessage: "Thermal normal. Safe operating conditions.",
    tempHotMessage: "Thermal warning! Immediate cooldown protocol advised.",
    runTest: "Run Rapid Diagnostics",
    rechargeDrone: "Initiate Rapid Charge",
    optimal: "OPTIMAL",
    warning: "WARNING",
    hot: "OVERHEAT",
    low: "LOW VOLT",
    charging: "CHARGING",
    voltage: "Voltage",
    cycles: "Cycles Log",
    temp: "Core Temp",
    health: "State of Health (SOH)",
    diagnosticsResult: "Diagnostics completed. Cell matching is stable.",
    lifespan: "Cycle Lifespan Index",
    voltStatus: "Voltage Profile Status",
    cellMatching: "Internal Impedance Profile",
    cooldownBtn: "Trigger Cooldown Sequence",
    normalState: "Status normal",
    selectDronePrompt: "Select a drone unit above to control and run advanced battery diagnostics.",
    droneSettings: "Drone Unit Profiles",
    diagnosticLog: "Telemetry Log Feed",
  },
  ar: {
    title: "بوابة مراقبة بطاريات المسيرات",
    subtitle: "متابعة مباشرة لصحة الخلايا، مستويات الجهد والحرارة، سجلات الشحن، ومؤشرات السلامة الحرارية لمسيرات الفحص.",
    liveFeed: "المحاكاة الحية",
    activeCount: "المسيرات المراقبة: 4 وحدات",
    tempOptimalMessage: "حالة حرارية ممتازة. بيئة عمل آمنة.",
    tempHotMessage: "تنبيه حرارة مرتفعة! يوصى ببروتوكول تبريد فوري.",
    runTest: "تشغيل تشخيص سريع",
    rechargeDrone: "بدء الشحن السريع",
    optimal: "حالة ممتازة",
    warning: "تحذير",
    hot: "حرارة حرجة",
    low: "جهد منخفض",
    charging: "جاري الشحن",
    voltage: "جهد الخلايا",
    cycles: "سجل الدورات",
    temp: "حرارة النواة",
    health: "مؤشر صحة البطارية",
    diagnosticsResult: "اكتمل الفحص. مستويات معاوقة الخلايا مستقرة ومتطابقة.",
    lifespan: "مؤشر دورة الحياة",
    voltStatus: "ملف الجهد الكهربائي",
    cellMatching: "المعاوقة الداخلية للخلايا",
    cooldownBtn: "بدء بروتوكول التبريد",
    normalState: "الوضع مستقر وطبيعي",
    selectDronePrompt: "اختر مسيرة من الأعلى للتحكم السريع وتشغيل التشخيصات المتقدمة لخلايا الليثيوم.",
    droneSettings: "ملفات وحدات فحص المسيرات",
    diagnosticLog: "سجل قراءات التتبع الحي",
  }
};

const INITIAL_DRONES: DroneBattery[] = [
  {
    id: "UAV-ALPHA",
    name: "Drone Alpha (Sector 1)",
    nameAr: "المسيرة ألفا (القطاع الأول)",
    voltage: 22.8,
    cycles: 45,
    maxCycles: 300,
    temp: 32,
    charge: 88,
    health: 98,
    status: 'optimal',
    model: "DJI Matrice 300 RTK (Modified)"
  },
  {
    id: "UAV-BETA",
    name: "Drone Beta (Sector 3)",
    nameAr: "المسيرة بيتا (القطاع الثالث)",
    voltage: 23.4,
    cycles: 112,
    maxCycles: 300,
    temp: 36,
    charge: 94,
    health: 94,
    status: 'optimal',
    model: "DJI Matrice 350 RTK - AI Vision"
  },
  {
    id: "UAV-GAMMA",
    name: "Drone Gamma (Sidi Bishr)",
    nameAr: "المسيرة غاما (سيدي بشر وميامي)",
    voltage: 21.3,
    cycles: 189,
    maxCycles: 300,
    temp: 45,
    charge: 38,
    health: 89,
    status: 'warning',
    model: "Custom Quadcopter Core-M"
  },
  {
    id: "UAV-DELTA",
    name: "Drone Delta (Borg El Arab Tech)",
    nameAr: "المسيرة ديلتا (جامعة برج العرب)",
    voltage: 19.4,
    cycles: 247,
    maxCycles: 300,
    temp: 49,
    charge: 14,
    health: 79,
    status: 'low',
    model: "Custom Pentacopter RailSentry v2"
  }
];

export function DroneBatteryMonitor() {
  const { language, isRTL } = useLanguage();
  const texts = language === 'ar' ? LOCAL_TEXTS.ar : LOCAL_TEXTS.en;
  
  const [drones, setDrones] = useState<DroneBattery[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string>("UAV-ALPHA");
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const selectedDrone = drones.find(d => d.id === selectedDroneId) || drones[0];

  // Helper code to append interactive logs
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
  };

  // Real-time Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => {
        // Simulated slight fluctuations in voltage, temperature, and progressive drain on charge
        let chargeDiff = 0;
        let tempDiff = 0;
        let voltDiff = 0;

        // Active statuses
        if (drone.status === 'charging') {
          chargeDiff = 1.5;
          tempDiff = drone.temp < 33 ? 0.3 : -0.2;
          voltDiff = 0.08;
        } else {
          // Normal discharging during virtual survey flight
          chargeDiff = -0.3;
          tempDiff = Math.random() > 0.5 ? 0.4 : -0.2;
          voltDiff = -0.01;
        }

        let newCharge = Math.min(100, Math.max(0, drone.charge + chargeDiff));
        let newTemp = Math.min(65, Math.max(24, Math.round(drone.temp + tempDiff)));
        let newVolt = Math.min(25.2, Math.max(18.0, Number((drone.voltage + voltDiff).toFixed(2))));

        // Cycle complete trigger (very rare simulation trigger just for high quality)
        let newCycles = drone.cycles;
        if (newCharge === 0 && drone.status !== 'charging') {
          newCharge = 100;
          newCycles += 1;
        }

        // Re-calculate derived statuses
        let newStatus: DroneBattery['status'] = 'optimal';
        if (drone.status === 'charging' && newCharge < 100) {
          newStatus = 'charging';
        } else {
          if (newCharge < 20) {
            newStatus = 'low';
          } else if (newTemp >= 46) {
            newStatus = 'hot';
          } else if (newCharge < 45 || newTemp > 39) {
            newStatus = 'warning';
          }
        }

        return {
          ...drone,
          charge: Math.round(newCharge),
          temp: newTemp,
          voltage: newVolt,
          cycles: newCycles,
          status: newStatus
        };
      }));
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Actions
  const runRapidDiagnostics = () => {
    if (isTesting) return;
    setIsTesting(true);
    setDiagnosticResult(null);
    addLog(isRTL ? `جاري بدء تشخيص المعاوقة للمسيرة (${selectedDrone.nameAr})` : `Analyzing internal resistance for ${selectedDrone.name}`);

    setTimeout(() => {
      setIsTesting(false);
      setDiagnosticResult(texts.diagnosticsResult);
      addLog(isRTL ? `اكتمل تشخيص خلايا المسيرة بنجاح` : `Diagnostic validation completed for ${selectedDrone.id}`);
    }, 2000);
  };

  const triggerCooldown = () => {
    addLog(isRTL ? `تم إرسال إشارة خفض سرعة المروحة وتبريد مسيرة ${selectedDrone.nameAr}` : `Cool-down protocol executed for ${selectedDrone.id}`);
    setDrones(prev => prev.map(d => {
      if (d.id === selectedDroneId) {
        return {
          ...d,
          temp: Math.max(26, d.temp - 8),
          status: d.charge < 20 ? 'low' : d.temp - 8 > 39 ? 'warning' : 'optimal'
        };
      }
      return d;
    }));
  };

  const initiateRapidCharge = () => {
    addLog(isRTL ? `المطالبة بشحن بطارية المسيرة ${selectedDrone.nameAr} فوريا` : `Rapid cell charger locked on ${selectedDrone.id}`);
    setDrones(prev => prev.map(d => {
      if (d.id === selectedDroneId) {
        return {
          ...d,
          status: 'charging',
          charge: Math.min(99, d.charge + 20),
          voltage: Math.min(25.0, d.voltage + 1.2)
        };
      }
      return d;
    }));
  };

  return (
    <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] relative overflow-hidden">
      
      {/* Background abstract decoration for tech aesthetics */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Widget Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2 mb-1.5 justify-start">
            <span className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-xl font-black text-white uppercase italic tracking-wider font-display">
              {texts.title}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 max-w-2xl font-light leading-relaxed">
            {texts.subtitle}
          </p>
        </div>

        {/* Live Simulator control buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-black text-cyan-400 tracking-wider uppercase">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'} `} />
            <span>{texts.liveFeed}</span>
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer hover:bg-white/10"
            title={isSimulating ? "Pause Simulator" : "Play Simulator"}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Top 4 Drone Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {drones.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          const progressColor = 
            drone.status === 'optimal' ? 'bg-cyan-500' :
            drone.status === 'charging' ? 'bg-emerald-500' :
            drone.status === 'warning' ? 'bg-yellow-500' :
            drone.status === 'hot' ? 'bg-rose-500' : 'bg-red-500';

          const textStatus = 
            drone.status === 'optimal' ? texts.optimal :
            drone.status === 'charging' ? texts.charging :
            drone.status === 'warning' ? texts.warning :
            drone.status === 'hot' ? texts.hot : texts.low;

          return (
            <motion.div
              key={drone.id}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setSelectedDroneId(drone.id);
                setDiagnosticResult(null);
              }}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                isSelected 
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_10px_30px_rgba(6,182,212,0.1)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              {/* Card Status Line Indicator */}
              <div className={`absolute top-0 inset-x-0 h-[3px] ${progressColor}`} />

              <div className={`flex justify-between items-start mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-white text-xs font-black italic">{isRTL ? drone.nameAr : drone.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{drone.model}</p>
                </div>

                <div className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider text-center ${
                  drone.status === 'optimal' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' :
                  drone.status === 'charging' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                  drone.status === 'warning' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                  'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                }`}>
                  {textStatus}
                </div>
              </div>

              {/* Charge Bar & Percentage */}
              <div className="space-y-1.5 mt-5">
                <div className={`flex justify-between items-center text-[10px] font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400">{isRTL ? "مستوى الشحن" : "Charge"}</span>
                  <span className="text-white font-mono font-black">{drone.charge}%</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`} 
                    style={{ width: `${drone.charge}%` }}
                  />
                </div>
              </div>

              {/* Summary Badges below */}
              <div className={`flex gap-3 justify-between items-center mt-4 pt-4 border-t border-white/5 uppercase text-[9px] text-slate-500 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-mono">{drone.temp}°C</span>
                </span>
                <span className="font-mono">
                  {drone.voltage} V
                </span>
                <span>
                  {drone.cycles} {isRTL ? "دورة" : "Cyc"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Drone Multi-Metrics Detailed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Metric 1: State of Health (SOH) */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className={`flex justify-between items-start mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{texts.health}</span>
              <p className={`text-3xl font-black text-white italic font-display tracking-tight mt-1 ${isRTL ? 'text-right' : ''}`}>
                {selectedDrone.health}%
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl text-cyan-400 border border-white/10 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className={`flex justify-between text-[11px] font-medium text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{texts.lifespan}</span>
                <span className="font-mono font-bold">{selectedDrone.cycles} / {selectedDrone.maxCycles}</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full" 
                  style={{ width: `${(selectedDrone.cycles / selectedDrone.maxCycles) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className={`flex justify-between text-[11px] font-medium text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{texts.cellMatching}</span>
                <span className="text-emerald-400 font-bold font-mono">1.2 mΩ</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[95%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Voltages & Cooldown */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className={`flex justify-between items-start mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{texts.voltage}</span>
              <p className={`text-3xl font-black text-white italic font-display tracking-tight mt-1 ${isRTL ? 'text-right' : ''}`}>
                {selectedDrone.voltage}V
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl text-blue-400 border border-white/10 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className={`grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-500`}>
              <div className="bg-white/5 p-2 rounded-xl text-center">
                <span className="block text-[8px] text-slate-600 mb-0.5">Cell Min</span>
                <span className="text-slate-300 font-mono">3.23V</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl text-center">
                <span className="block text-[8px] text-slate-600 mb-0.5">Cell Max</span>
                <span className="text-slate-300 font-mono">3.28V</span>
              </div>
            </div>

            <div className={`flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-[9px] uppercase font-bold text-slate-400">{texts.voltStatus}</span>
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                BALANCED
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Thermals & Temperature controls */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className={`flex justify-between items-start mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{texts.temp}</span>
              <p className={`text-3xl font-black text-white italic font-display tracking-tight mt-1 ${isRTL ? 'text-right' : ''}`}>
                {selectedDrone.temp}°C
              </p>
            </div>
            <div className={`p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 ${selectedDrone.temp > 45 ? 'text-rose-500 animate-bounce' : 'text-yellow-500'}`}>
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-2 rounded-xl border flex items-start gap-2.5 ${
              selectedDrone.temp > 45 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[9px] leading-relaxed font-bold">
                {selectedDrone.temp > 45 ? texts.tempHotMessage : texts.tempOptimalMessage}
              </p>
            </div>

            {selectedDrone.temp > 45 && (
              <button
                onClick={triggerCooldown}
                className="w-full flex items-center justify-center gap-2 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{texts.cooldownBtn}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Advanced Diagnostics Interactive console */}
      <div className={`mt-8 bg-black/40 border border-white/[0.05] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-stretch gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={`flex-1 flex flex-col justify-between ${isRTL ? 'text-right' : 'text-left'}`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-start">
            <Sliders className="w-4 h-4 text-cyan-400" />
            {texts.droneSettings} (LIPO CELLS ADVANCED OPT)
          </span>

          <div className={`mt-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="text-white text-xs font-black italic block">
              {isRTL ? selectedDrone.nameAr : selectedDrone.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Active Pack ID: <span className="text-cyan-400 font-mono">{selectedDrone.id}-XF9</span> | Base Model: {selectedDrone.model}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={runRapidDiagnostics}
              disabled={isTesting}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isTesting ? (
                <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin inline-block mr-1.5 align-middle" />
              ) : null}
              {texts.runTest}
            </button>

            <button
              onClick={initiateRapidCharge}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black border border-white/10 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {texts.rechargeDrone}
            </button>
          </div>
        </div>

        {/* Console log outputs stream */}
        <div className="w-full md:w-[320px] bg-slate-950/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[140px] font-mono">
          <div className={`flex justify-between items-center mb-3 text-[9px] font-bold text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{texts.diagnosticLog}</span>
            <span>UAV STREAM LOGS</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[80px] no-scrollbar space-y-1.5 text-[8px] text-cyan-400/80 leading-relaxed">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx} className={`${idx === 0 ? 'text-cyan-300 font-bold border-l border-cyan-400/40 pl-1.5' : ''}`}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">
                {isRTL ? "مستعد لاستقبال الأوامر..." : "Ready. Launch telemetry scanner."}
              </div>
            )}
          </div>

          <AnimatePresence>
            {diagnosticResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-3 pt-3 border-t border-white/5 text-[9px] text-emerald-400 font-bold"
              >
                ✔ {diagnosticResult}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
