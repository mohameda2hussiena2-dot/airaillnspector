import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  AlertOctagon, 
  Activity, 
  ShieldCheck, 
  TrendingDown,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  LabelList 
} from 'recharts';

export function PredictiveMaintenance() {
  const { t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('Segment A-42');

  // Realistic telemetry loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, [selectedSegment]);

  const handleSimulateRecalculation = () => {
    setIsLoading(true);
  };

  const segmentsData = [
    {
      id: 'Segment A-42',
      location: 'KM 14.5 - Al-Amriya',
      rul: 45, // remaining days
      severity: 'HIGH',
      riskScore: 82,
      lastInspected: '2026-05-18',
      defectsCount: 3,
      timeline: [
        { month: 'Nov', wear: 15, risk: 20 },
        { month: 'Dec', wear: 30, risk: 35 },
        { month: 'Jan', wear: 48, risk: 45 },
        { month: 'Feb', wear: 62, risk: 58 },
        { month: 'Mar', wear: 78, risk: 70 },
        { month: 'Apr', wear: 90, risk: 82 },
      ]
    },
    {
      id: 'Segment B-12',
      location: 'KM 38.2 - Borg El Arab',
      rul: 180,
      severity: 'LOW',
      riskScore: 24,
      lastInspected: '2026-05-20',
      defectsCount: 1,
      timeline: [
        { month: 'Nov', wear: 5, risk: 10 },
        { month: 'Dec', wear: 8, risk: 12 },
        { month: 'Jan', wear: 12, risk: 15 },
        { month: 'Feb', wear: 15, risk: 18 },
        { month: 'Mar', wear: 19, risk: 22 },
        { month: 'Apr', wear: 22, risk: 24 },
      ]
    },
    {
      id: 'Segment C-09',
      location: 'KM 102.3 - King Mariout',
      rul: 8,
      severity: 'CRITICAL',
      riskScore: 94,
      lastInspected: '2026-05-22',
      defectsCount: 5,
      timeline: [
        { month: 'Nov', wear: 40, risk: 50 },
        { month: 'Dec', wear: 62, risk: 65 },
        { month: 'Jan', wear: 75, risk: 78 },
        { month: 'Feb', wear: 85, risk: 85 },
        { month: 'Mar', wear: 92, risk: 90 },
        { month: 'Apr', wear: 97, risk: 94 },
      ]
    }
  ];

  const currentData = segmentsData.find(s => s.id === selectedSegment) || segmentsData[0];

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <TrendingUp className="w-6 h-6 animate-bounce" />
            </span>
            {isRTL ? 'نظام التحليل والتنبؤ الاستباقي (AI)' : 'AI Predictive Maintenance Platform'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'نمذجة ميكانيكا التصدع المتقدمة والشبكات العصبية للتنبؤ الدقيق بموعد انكسار القضبان ونهاية عمرها الخدمي.' 
              : 'Structural fracture mechanics & custom LSTM neural networks estimating rail failure dates & residual lifespan.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <select 
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-2xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50"
          >
            {segmentsData.map(s => (
              <option key={s.id} value={s.id}>{s.id} ({s.severity})</option>
            ))}
          </select>

          <button 
            onClick={handleSimulateRecalculation}
            className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 px-4 py-2.5 rounded-2xl text-xs hover:text-white text-blue-400 font-extrabold transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {isRTL ? 'تحديث الحسابات' : 'Recalculate Models'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton Loader UI */
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left panels */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-950/30 border border-white/5 rounded-3xl p-6 h-36 animate-pulse flex flex-col justify-between">
                  <div className="w-1/2 h-5 bg-slate-800 rounded-lg" />
                  <div className="w-3/4 h-8 bg-slate-800 rounded-lg" />
                  <div className="w-1/3 h-4 bg-slate-800 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Right chart skeleton */}
            <div className="lg:col-span-2 bg-slate-950/30 border border-white/5 rounded-3xl p-8 h-[480px] animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="w-1/3 h-6 bg-slate-800 rounded-lg" />
                <div className="w-24 h-6 bg-slate-800 rounded-lg" />
              </div>
              <div className="flex-1 bg-slate-800/20 rounded-2xl my-6 flex items-center justify-center">
                <Clock className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
              <div className="w-2/3 h-4 bg-slate-800 rounded-lg" />
            </div>
          </motion.div>
        ) : (
          /* Real Integrated UI */
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Metrics cards */}
            <div className="flex flex-col gap-6 h-full">
              {/* Card 1: Remaining Life */}
              <div className="bg-gradient-to-br from-slate-950/60 to-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                <div className={`absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity`}>
                  <Calendar className="w-40 h-40" />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                    Residual Life Estimate
                  </span>
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 font-medium">{currentData.location}</p>
                <div className="flex items-baseline mt-4 gap-2">
                  <span className="text-4xl font-black text-white font-mono">{currentData.rul}</span>
                  <span className="text-xs text-slate-400">{isRTL ? 'يوم متبقي' : 'days left'}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{isRTL ? 'تاريخ الكسر المتوقع:' : 'Est. Breach Date:'}</span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {new Date(Date.now() + currentData.rul * 86400000).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Card 2: Risk Index */}
              <div className="bg-gradient-to-br from-slate-950/60 to-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                    Risk Assessment Level
                  </span>
                  <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400">
                    <AlertOctagon className="w-4 h-4 animate-pulse" />
                  </div>
                </div>

                <div className="flex items-baseline mt-4 gap-2">
                  <span className="text-4xl font-black text-red-500 font-mono">{currentData.riskScore}%</span>
                  <span className="text-xs text-slate-400">{isRTL ? 'معدل الخطورة الإجمالي' : 'failure probability'}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${currentData.severity === 'CRITICAL' || currentData.severity === 'HIGH' ? 'from-orange-500 to-red-600' : 'from-emerald-500 to-blue-500'}`}
                    style={{ width: `${currentData.riskScore}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 mt-3 font-light">
                  {isRTL 
                    ? 'الدرجات العليا تستدعي جدولة فورية لتبديل الفواصل الميكانيكية.' 
                    : 'Values above 70% activate immediate mandatory field inspection orders.'}
                </p>
              </div>

              {/* Card 3: Model Health Info */}
              <div className="bg-gradient-to-br from-slate-950/60 to-slate-900 border border-white/5 p-6 rounded-3xl flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <p className="text-xs font-extrabold text-slate-300">{isRTL ? 'حالة التوقع الحاسوبي' : 'Neural Prediction Health'}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-emerald-400">STABLE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
                    <div>
                      <p className="text-slate-500 text-[10px]">{isRTL ? 'الخط البياني' : 'L-Fracture Ratio'}</p>
                      <p className="text-white font-bold">1:4.82 µm/hr</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">{isRTL ? 'النماذج النشطة' : 'Active Networks'}</p>
                      <p className="text-white font-bold">3 (LSTM, FFT, FEM)</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">{isRTL ? 'دقة التوقع' : 'Model Accuracy'}</p>
                      <p className="text-blue-400 font-bold">98.42%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">{isRTL ? 'تاريخ التحديث' : 'Model Train'}</p>
                      <p className="text-white font-bold">Every 24 Hrs</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center gap-2.5 text-xs text-slate-300 mt-4 leading-relaxed">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isRTL 
                      ? 'تم مزامنة المنحنيات مع قراءات الاهتزازات الصوتية للطائرات.' 
                      : 'Failure projections verified using acoustic vibration feedback logs.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timelines and graphs */}
            <div className="lg:col-span-2 bg-[#050b1e]/60 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col h-full min-h-[480px]">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                    {isRTL ? `منحنى تآكل القضبان وتطور المخاطر - ${selectedSegment}` : `Rail Wear & Failure Risk Projection - ${selectedSegment}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isRTL 
                      ? 'يوضح العلاقة بين معدل الاحتكاك الهاردويري للأسطح وازدياد احتمالية الكسر البنيوي.' 
                      : 'Visualizes structural friction decay relative to sudden failure probability factors.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <span className="text-slate-400 font-light">{isRTL ? 'معدل التصدع' : 'Surface Wear'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
                    <span className="text-slate-400 font-light">{isRTL ? 'احتمالية الانكسار' : 'Failure Risk'}</span>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="flex-1 min-h-[300px] w-full items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={currentData.timeline}
                    margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#475569" 
                      fontSize={11} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={11} 
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#090d1f', 
                        borderColor: '#ffffff14', 
                        color: '#fff',
                        borderRadius: '16px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wear" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWear)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRisk)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 border-t border-white/5 bg-slate-950/20 rounded-2xl flex items-center justify-between text-xs text-slate-400">
                <span>⚡ {isRTL ? 'يُظهر النموذج تقدماً متسارعاً في الكراك بعد فبراير.' : 'Curve growth accelerates post-February due to cold winter expansion.'}</span>
                <span className="font-mono text-[10px]">{currentData.id} - RUL CALC V2.4</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
