import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  Copy, 
  Check, 
  Send, 
  Zap, 
  Database,
  RefreshCw,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function ApiGateway() {
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiKeyList, setApiKeyList] = useState<Array<{ key: string; label: string; created: string }>>([
    { key: 'rail_national_live_83ba90d...', label: 'Cairo Ministry Gateway', created: '2026-05-10' },
    { key: 'rail_alex_telemetry_a84b0d1...', label: 'Alexandria Metro Sync', created: '2026-05-18' }
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [apiLogs, setApiLogs] = useState<Array<{ time: string; method: string; route: string; status: number }>>([
    { time: '16:42:15', method: 'GET', route: '/api/v1/inspection/latest', status: 200 },
    { time: '16:43:08', method: 'POST', route: '/api/v1/telemetry/push', status: 201 },
    { time: '16:44:22', method: 'GET', route: '/api/v1/emergency/status', status: 200 }
  ]);

  // Loading phase
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const randomHex = Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newKey = `rail_gen_sec_${randomHex.slice(0, 8)}...`;
    setApiKeyList(prev => [...prev, {
      key: newKey,
      label: newLabel,
      created: new Date().toISOString().split('T')[0]
    }]);
    setNewLabel('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const triggerEmergencyStop = () => {
    setEmergencyActive(prev => !prev);
  };

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Database className="w-6 h-6" />
            </span>
            {isRTL ? 'بوابة الربط القومي الرقمية الموحدة (API)' : 'National Unified Rail API Gateway'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'توفيرendpoints مركزية لتغذية وزارة النقل وهيئة السكك الحديدية بالبيانات التاريخية والعيوب المشخصة فورا.' 
              : 'Direct integration APIs distributing real-time telemetry, spatial data, and defect notifications to national regulators.'}
          </p>
        </div>

        {emergencyActive && (
          <div className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            NATIONAL EMERGENCY SHUTDOWN TRIGGERED
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px]" key="api-skeleton">
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
            <div className="lg:col-span-2 bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            key="api-content"
          >
            {/* Left: Endpoint credentials and keys */}
            <div className="flex flex-col gap-6">
              {/* Credentials / Key generator */}
              <div className="bg-gradient-to-br from-slate-950/60 to-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    {isRTL ? 'توليد مفاتيح الربط البرمجي' : 'API Key Management'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-4">{isRTL ? 'إدارة تصاريح السيرفر الخارجي للوزارة' : 'Set active tokens for government agency endpoints'}</p>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto no-scrollbar mb-4">
                    {apiKeyList.map((item, idx) => (
                      <div key={idx} className="bg-slate-900 border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-[11px] leading-3">{item.label}</p>
                          <p className="text-[9px] font-mono text-indigo-400 mt-1">{item.key}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(item.key)}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-opacity shrink-0"
                          title="Copy Key"
                        >
                          {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Create form */}
                  <form onSubmit={handleGenerateKey} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={isRTL ? 'تسمية المفتاح الجديد...' : 'Agency/Partner Name...'}
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl active:scale-95 transition-all outline-none cursor-pointer uppercase shrink-0"
                    >
                      {isRTL ? 'توليد' : 'Generate'}
                    </button>
                  </form>
                </div>
              </div>

              {/* RED GLASS-MORPHIC EMERGENCY STOP BACKDROP-BLUR BUTTON */}
              <div className="bg-slate-950/60 border border-white/5 p-6 rounded-3xl flex flex-col justify-between items-center relative overflow-hidden">
                <div className="text-center">
                  <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    {isRTL ? 'مفتاح الطوارئ السيادي' : 'National Sovereign Override'}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal mb-8">
                    {isRTL 
                      ? 'زر الطوارئ المباشر لوقف عمل الطائرات والقطارات القومية فوراً عند استشعار عيوب بنية تحتية قاتلة.' 
                      : 'Immediate tactical cut-off. Instructs state trains and inspection aerial drones to halt instantly on critical failure.'}
                  </p>
                </div>

                {/* Massive glass red stop button */}
                <button
                  onClick={triggerEmergencyStop}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 select-none relative transition-all active:scale-90 ${
                    emergencyActive 
                      ? 'bg-red-600/30 border-red-500 shadow-[0_0_30px_#ef444455] text-white animate-pulse' 
                      : 'bg-red-950/20 backdrop-blur-xl border-red-700/50 text-red-500 hover:bg-red-900/40 hover:border-red-500 shadow-xl'
                  }`}
                  style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                >
                  <Send className={`w-8 h-8 ${emergencyActive ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest mt-2">
                    {emergencyActive ? (isRTL ? 'إلغاء التوقيف' : 'DISARM STOP') : (isRTL ? 'إيقاف فوري' : 'HOT STOP')}
                  </span>
                </button>

                <p className="text-[9px] text-slate-500 font-mono mt-6 text-center">
                  SECURE BLOCK: ACTIVE // STATUS CODE: 902A
                </p>
              </div>
            </div>

            {/* Right: API Analytics charts & query playground */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Endpoint metrics */}
              <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      {isRTL ? 'مخدم مراقبة بوابة الاستقبال' : 'National API Integration Logs'}
                    </h3>
                    <p className="text-[10px] text-slate-500">{isRTL ? 'الحركة الميدانية لطلبات الربط القومي' : 'Incoming requests telemetry from administrative networks'}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Cairo [22ms]
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Alex [14ms]
                    </span>
                  </div>
                </div>

                {/* Logs table list */}
                <div className="space-y-3">
                  {apiLogs.map((log, index) => (
                    <div key={index} className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs font-mono transition-colors hover:bg-slate-900">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                        <span className={`font-black tracking-widest ${log.method === 'POST' ? 'text-indigo-400' : 'text-blue-400'}`}>
                          {log.method}
                        </span>
                        <span className="text-white font-medium">{log.route}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[10px]">Payload: 1.8KB</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-black">
                          {log.status} OK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer testing sandbox console */}
              <div className="bg-[#030612]/80 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 mb-1">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    {isRTL ? 'كونسول اختبار عوائد الـ JSON' : 'Interactive Sandbox Query Tool'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-4">
                    {isRTL ? 'إرسال طلبات اختبارية ومراجعة عوائد الخوادم الفيدرالية' : 'Test client endpoints against dry-run structural assets payload.'}
                  </p>

                  <div className="bg-black/80 border border-white/10 rounded-2xl p-4 font-mono text-[10.5px] text-emerald-400 overflow-x-auto min-h-[160px] leading-relaxed relative">
                    <span className="absolute top-3 right-3 text-[9px] text-slate-600 uppercase font-black tracking-widest">DRY RUN JSON</span>
                    <pre>{`{
  "api_status": "ONLINE",
  "national_sync": "Cairo Central Grid Hub",
  "drones_connected": 4,
  "defects_reported_to_ministry": [
    { "id": "d Cairo-042", "type": "CRACK", "gps": [31.0409, 31.3785], "override": false }
  ],
  "severe_overheats_logged": 1,
  "emergency_cutoff_triggered": ${emergencyActive}
}`}</pre>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-2.5 text-xs text-slate-300 mt-4 leading-relaxed">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {isRTL 
                      ? 'جميع العوائد ممسوحة وموقعة رقميا من وزارة النقل.' 
                      : 'All endpoints encrypted using SHA-256 standard and synchronized to Cairo central servers.'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
