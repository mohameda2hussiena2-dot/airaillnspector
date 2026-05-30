import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Battery, 
  Plus, 
  Radio, 
  Loader2, 
  CheckCircle2, 
  Compass, 
  Wifi, 
  Zap, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  Gauge, 
  Hourglass, 
  Clock 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { DroneBatteryMonitor } from './DroneBatteryMonitor';

export function DroneBatteryPage() {
  const { t, isRTL } = useLanguage();

  // Dynamic Battery Health tracker (Main Unit)
  const [hudBattery, setHudBattery] = useState(92);

  useEffect(() => {
    // Slowly drain battery over time for dynamic real-time look
    const timer = setInterval(() => {
      setHudBattery((prev) => {
        if (prev <= 12) return 100; // Auto-charged
        return Math.max(12, prev - 0.05);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hudVoltage = (18.6 + (hudBattery / 100) * 6.4 + (Math.sin(Date.now() / 1500) * 0.015)).toFixed(2);
  const remainingSeconds = Math.round((hudBattery / 100) * 1620); // 27 minutes max
  const remainingMins = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;

  // Drone Connection state
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectingId, setIsConnectingId] = useState<string | null>(null);
  const [connectionSuccessId, setConnectionSuccessId] = useState<string | null>(null);
  const [dronePingLogs, setDronePingLogs] = useState<string[]>([]);
  
  // Custom interactive list of simulated drones & their link statuses
  const [simulatedDrones, setSimulatedDrones] = useState([
    { id: 'dr-1', nameAr: 'طائرة فالكون الاستكشافية Falcon T5', nameEn: 'Falcon Inspection Drone T5', model: 'DJI Matrice 300 RTK', battery: 92, signal: 'excellent', connection: 'active', frequency: '5.8 GHz', ip: '192.168.1.100' },
    { id: 'dr-2', nameAr: 'طائرة المراقبة الحرارية Thermal X8', nameEn: 'Thermal Surveyor X8', model: 'Custom Octocopter Lipo 6S', battery: 74, signal: 'good', connection: 'active', frequency: '2.4 GHz', ip: '192.168.1.101' },
    { id: 'dr-3', nameAr: 'طائرة فحص المسار الذكية Z4', nameEn: 'Smart Track Finder Z4', model: 'Pixhawk APM 2.8 Custom', battery: 45, signal: 'warning', connection: 'inactive', frequency: '5.8 GHz', ip: '192.168.1.102' },
    { id: 'dr-4', nameAr: 'كاشف العيوب بالموجات فوق الصوتية Sentinel', nameEn: 'Ultrasonic Defect Finder Drone', model: 'Custom Quad Pixhawk 4', battery: 88, signal: 'excellent', connection: 'inactive', frequency: '5.8 GHz', ip: '192.168.1.103' }
  ]);

  const [newDroneName, setNewDroneName] = useState('');
  const [newDroneModel, setNewDroneModel] = useState('');
  const [newDroneIP, setNewDroneIP] = useState('');

  const handleScanDrones = () => {
    setIsScanning(true);
    setDronePingLogs(prev => [...prev, `${isRTL ? '[نظام] جاري البحث عن مستقبلات البث المجاورة...' : '[SYS] Inspecting neighboring broadcast transmitters...'}`]);
    
    setTimeout(() => {
      setDronePingLogs(prev => [...prev, `${isRTL ? '[تردد] جاري فحص الحزم الترددية 5.8 جيجاهرتز...' : '[RF] Inspecting 5.8 GHz frequency band...'}`]);
    }, 500);

    setTimeout(() => {
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? '[اتصال] عثر على 4 وحدات متوافقة مع نظام التوجيه الذاتي MAVLink.' : '[LINK] Found 4 devices compatible with autopilot telemetry standard.'}`
      ]);
      setIsScanning(false);
    }, 1200);
  };

  const handleToggleConnection = (id: string) => {
    const drone = simulatedDrones.find(d => d.id === id);
    if (!drone) return;

    if (drone.connection === 'active') {
      // Disconnect
      setSimulatedDrones(prev => prev.map(d => d.id === id ? { ...d, connection: 'inactive' } : d));
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? `[اتصال] تم فصل ${drone.nameAr} بنجاح.` : `[LINK] Disconnected ${drone.nameEn} successfully.`}`
      ]);
    } else {
      // Connect
      setIsConnectingId(id);
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? `[إشارة] محاولة إرسال حزم التزامن إلى ${drone.ip}...` : `[SIGNAL] Sending sync telemetry packets to ${drone.ip}...`}`
      ]);

      setTimeout(() => {
        setDronePingLogs(prev => [
          ...prev, 
          `${isRTL ? `[نظام] استقبال بث كاذب للموقع الجغرافي. جاري فحص صلاحية MAVLink v2.0...` : `[SYS] Fake GPS lock detected. Testing MAVLink compliance v2.0...`}`
        ]);
      }, 700);

      setTimeout(() => {
        setSimulatedDrones(prev => prev.map(d => d.id === id ? { ...d, connection: 'active' } : d));
        setIsConnectingId(null);
        setConnectionSuccessId(id);
        setDronePingLogs(prev => [
          ...prev, 
          `[SUCCESS] Linked ${drone.nameEn} successfully!`
        ]);
        setTimeout(() => setConnectionSuccessId(null), 3000);
      }, 1500);
    }
  };

  const handleAddNewDrone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDroneName) return;

    const newUnit = {
      id: `dr-${Date.now()}`,
      nameAr: newDroneName,
      nameEn: newDroneName,
      model: newDroneModel || 'DIY Pixhawk Custom',
      battery: 100,
      signal: 'excellent' as const,
      connection: 'inactive' as const,
      frequency: '5.8 GHz',
      ip: newDroneIP || '192.168.1.109'
    };

    setSimulatedDrones(prev => [...prev, newUnit]);
    setDronePingLogs(prev => [
      ...prev, 
      `${isRTL ? `[تسجيل] تم إدراج الطائرة الجديدة بقاعدة البيانات: ${newDroneName}` : `[REGISTRY] Newly registered drone saved to schema: ${newDroneName}`}`
    ]);
    setNewDroneName('');
    setNewDroneModel('');
    setNewDroneIP('');
  };

  return (
    <div className="space-y-10">
      {/* Upper Grid of Health Meter and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Battery Stats Widget with ID for Tutorial Target */}
        <div 
          id="tour-drone-connect" 
          className="lg:col-span-1 bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
        >
          <div>
            <div className={`flex items-center gap-2 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
              <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{t('systemOnline')}</span>
            </div>

            <h3 className={`text-base font-black text-white uppercase tracking-wider italic mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "تشخيص خلايا الليثيوم" : "UAV Cell Pack Status"}
            </h3>

            {/* Real-time battery status widget */}
            <div className="mb-6 bg-slate-950/80 rounded-2xl p-5 border border-white/5 font-mono text-xs text-slate-300 space-y-4">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-emerald-400 rotate-90" />
                  <span className="font-extrabold text-xs text-slate-100 font-sans">{isRTL ? "مخزن طاقة الطائرة" : "UAV Power Pack"}</span>
                </div>
                <span className="text-emerald-400 font-black font-mono text-sm">{hudBattery.toFixed(1)}%</span>
              </div>
              
              {/* Battery Level Progress Bar */}
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    hudBattery > 50 ? 'bg-emerald-500 font-bold' :
                    hudBattery > 20 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${hudBattery}%` }}
                />
              </div>

              <div className={`grid grid-cols-2 gap-3 pt-2 font-mono text-[10px] text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                  <span className="block text-slate-500 text-[8px] font-sans mb-0.5">{isRTL ? "الجهد الحالي" : "VOLTAGE"}</span>
                  <span className="text-slate-200 font-extrabold text-xs">{hudVoltage} V</span>
                </div>
                <div className="bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                  <span className="block text-slate-500 text-[8px] font-sans mb-0.5">{isRTL ? "خلال تحليق" : "REMAINING"}</span>
                  <span className="text-cyan-400 font-extrabold text-xs">{remainingMins}m {remainingSecs}s</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-slate-400 text-xs text-left leading-relaxed">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span><strong>Chemistry:</strong> Lithium Polymer (6S LiPo Pack)</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span><strong>Discharge Rate:</strong> ~1.8A Peak Load</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span><strong>Regulator:</strong> Dual PMU BEC Auto Filter</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleScanDrones}
            className="w-full text-xs mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 border border-blue-500/50 flex items-center justify-center gap-2 font-black uppercase tracking-widest active:scale-95 cursor-pointer"
          >
            <Activity className="w-4 h-4" /> {isRTL ? "بدء فحص كامل للخلايا" : "TRIGGER DIAGNOSTIC SCAN"}
          </button>
        </div>

        {/* Center Screen: Connected Aerial Units Stream Manager */}
        <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <div className={`flex items-start justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="text-base font-black tracking-tight text-white leading-tight">
                    {isRTL ? 'إدارة قنوات واتصالات الدرون النشطة' : 'MAVLink Drone Connection Manager'}
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    {isRTL ? 'مراقبة وإقران قنوات البث ومطابقة الترددات' : 'Monitor active frequencies, pair flight modules, and review streaming diagnostics.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleScanDrones}
                disabled={isScanning}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-black tracking-wider text-slate-350 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                )}
                <span>{isRTL ? 'إعادة فحص الطيف الشبكي' : 'SCAN SPECTRUM'}</span>
              </button>
            </div>

            {/* Simulated Drones Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar mb-6">
              {simulatedDrones.map((drone) => {
                const isConnected = drone.connection === 'active';
                const isThisConnecting = isConnectingId === drone.id;
                const isThisSuccess = connectionSuccessId === drone.id;

                return (
                  <div 
                    key={drone.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      isConnected 
                        ? 'bg-gradient-to-r from-blue-950/20 to-slate-900/60 border-blue-500/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]' 
                        : 'bg-slate-950/25 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                          <h4 className="text-xs font-extrabold text-white">{isRTL ? drone.nameAr : drone.nameEn}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 leading-normal">{drone.model}<br/>{drone.ip}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1 px-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider ${
                          drone.signal === 'excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                          drone.signal === 'good' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {drone.signal.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-300 mt-1">
                          <Battery className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-mono font-bold">{drone.battery}%</span>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-3.5 pt-3 border-t border-white/5 flex gap-2 items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <Compass className="w-4 h-4 text-emerald-500/70" />
                        <span className="font-mono text-[9px]">{drone.frequency}</span>
                      </div>

                      <button
                        onClick={() => handleToggleConnection(drone.id)}
                        disabled={isThisConnecting}
                        className={`px-4.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                          isThisSuccess 
                            ? 'bg-emerald-600 text-white' 
                            : isConnected 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isThisConnecting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{isRTL ? 'جاري الاتصال...' : 'Connecting...'}</span>
                          </>
                        ) : isThisSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'تم الإقران ✓' : 'Linked ✓'}</span>
                          </>
                        ) : isConnected ? (
                          <span>{isRTL ? 'قطع الاتصال' : 'Disconnect'}</span>
                        ) : (
                          <span>{isRTL ? 'ربط القناة' : 'Pair UAV'}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Console log Terminal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 font-mono">
                {isRTL ? 'شاشة التشخيص والاتصالات MAVLink الحية' : 'MAVLink Diagnostic Log Feed'}
              </span>
              <button
                onClick={() => setDronePingLogs([])}
                className="text-[9.5px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {isRTL ? 'مسح سجل البث' : 'Clear Terminal'}
              </button>
            </div>
            <div className="bg-slate-950 p-4.5 rounded-2xl border border-white/5 h-32 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed space-y-1.5 select-all scrollbar-thin">
              {dronePingLogs.length === 0 ? (
                <p className="text-slate-600 italic">
                  {isRTL ? '> بانتظار إرسال بث الحزم للرؤية المعاوقة...' : '> Idle. Real-time receiver sync telemetry feed waiting...'}
                </p>
              ) : (
                dronePingLogs.map((log, index) => (
                  <p key={index} className="text-emerald-400 font-mono">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Battery Diagnostics & Life Cycle Tracker Panel */}
      <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] italic">
              {isRTL ? "سجلات صحة عتاد بطاريات الليثيوم" : "Battery Health Diagnostics Center"}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              {isRTL ? "فحص دورات الشحن ونواتج الكفاءة وتحليلات الحرارة للسلامة الميدانية" : "Analyze UAV discharge profiles, cell matching indexes, and cycles of flight logs."}
            </p>
          </div>
        </div>

        {/* Render the full pre-existing DroneBatteryMonitor component cleanly */}
        <DroneBatteryMonitor />
      </div>

      {/* Manual Hardware Register Form */}
      <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <h4 className={`text-base font-black text-white uppercase tracking-wider italic mb-6 ${isRTL ? 'text-right md:flex-row-reverse' : 'text-left'}`}>
          {isRTL ? "تسجيل طائرة مسيرة جديدة" : "Register Drone Hardware Identification"}
        </h4>
        <form onSubmit={handleAddNewDrone} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className={`block text-xs font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'عنوان الفئة الفنية' : 'Device Call Sign'}
            </label>
            <input
              type="text"
              required
              placeholder={isRTL ? 'مسيرة دلتا طنطا 3' : 'Delta Tanta Drone 3'}
              value={newDroneName}
              onChange={(e) => setNewDroneName(e.target.value)}
              className={`w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:ring-1 focus:ring-indigo-500/20 ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-xs font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'طراز هيكل المسافة' : 'System Frame Model'}
            </label>
            <input
              type="text"
              placeholder="Pixhawk Octo DIY v3"
              value={newDroneModel}
              onChange={(e) => setNewDroneModel(e.target.value)}
              className={`w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:ring-1 focus:ring-indigo-500/20 ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-xs font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'عنوان المعرف IP' : 'MAVLink Receiver IP'}
            </label>
            <input
              type="text"
              placeholder="192.168.1.109"
              value={newDroneIP}
              onChange={(e) => setNewDroneIP(e.target.value)}
              className={`w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-655 outline-none focus:ring-1 focus:ring-indigo-500/20 ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer text-xs uppercase tracking-widest active:scale-95"
          >
            {isRTL ? "إضافة الوحدة فورا" : "Register Drone Hardware"}
          </button>
        </form>
      </div>

    </div>
  );
}
