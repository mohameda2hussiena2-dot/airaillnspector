import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Route, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert,
  BarChart2,
  Box,
  Layers,
  FileDown,
  Users,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { TrackInspection, Severity, DefectType } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { getTasksForUser, updateTask, Task } from '../lib/tasks';
import { logActivity } from '../lib/logger';
import { getApiUrl } from '../lib/api';
import { DroneBatteryMonitor } from './DroneBatteryMonitor';

interface DashboardProps {
  inspections: TrackInspection[];
}

const COLORS = {
  CRITICAL: '#f43f5e',
  HIGH: '#f59e0b',
  MEDIUM: '#eab308',
  LOW: '#3b82f6'
};

const STAT_CARD_STYLE = "bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-6 relative overflow-hidden group hover:border-blue-500/30 hover:shadow-blue-500/5 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  }
};

export function Dashboard({ inspections }: DashboardProps) {
  const { t, language, isRTL } = useLanguage();
  const { user, token } = useAuth();
  const [onlineCount, setOnlineCount] = useState(1);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [reportTexts, setReportTexts] = useState<Record<string, string>>({});

  const fetchTasks = async () => {
    try {
      if (!token || !user) {
        const localTasks = user ? getTasksForUser(user.id, user.role_id) : [];
        setMyTasks(localTasks);
        return;
      }
      const res = await fetch(getApiUrl('/api/engineering/tasks'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setMyTasks(data);
          // Sync server data cache to localStorage task list
          localStorage.setItem('app_tasks', JSON.stringify(data));
          return;
        }
      }
      const localTasks = user ? getTasksForUser(user.id, user.role_id) : [];
      setMyTasks(localTasks);
    } catch (err) {
      console.warn("Failed to fetch running tasks, falling back to local storage:", err);
      const localTasks = user ? getTasksForUser(user.id, user.role_id) : [];
      setMyTasks(localTasks);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000); // Polling as fallback
    
    const handleTaskUpdate = () => fetchTasks();
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, [user, token]);

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    // Offline / Fallback Local storage update
    updateTask(taskId, { status: newStatus });
    if (user) setMyTasks(getTasksForUser(user.id, user.role_id));

    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (err) {
      console.warn("Failed to update status on server, local state is kept", err);
    }
  };

  const handleSubmitReport = async (taskId: string) => {
    const reportText = reportTexts[taskId];
    if (!reportText?.trim()) return;

    // Offline / Fallback Local storage update
    updateTask(taskId, { report: reportText });
    if (user) setMyTasks(getTasksForUser(user.id, user.role_id));
    setReportTexts(prev => ({ ...prev, [taskId]: '' }));

    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ report: reportText })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (err) {
      console.warn("Failed to submit report on server, local state is kept", err);
    }
  };

  useEffect(() => {
    // Pure client-side simulation: pick a random number for online users
    setOnlineCount(Math.floor(Math.random() * 5) + 3);
  }, [user]);

  const stats = useMemo(() => {
    const totalDefects = inspections.reduce((acc, curr) => acc + curr.defects.length, 0);
    
    const severityCounts = {
      [Severity.CRITICAL]: inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.CRITICAL).length, 0),
      [Severity.HIGH]: inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.HIGH).length, 0),
      [Severity.MEDIUM]: inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.MEDIUM).length, 0),
      [Severity.LOW]: inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.LOW).length, 0),
    };

    const severityData = [
      { name: t('critical'), value: severityCounts[Severity.CRITICAL], color: COLORS.CRITICAL },
      { name: t('high'), value: severityCounts[Severity.HIGH], color: COLORS.HIGH },
      { name: t('medium'), value: severityCounts[Severity.MEDIUM], color: COLORS.MEDIUM },
      { name: t('low'), value: severityCounts[Severity.LOW], color: COLORS.LOW },
    ].filter(d => d.value > 0);

    const timelineData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
        defects: Math.floor(Math.random() * 15) + 2,
        scanned: Math.floor(Math.random() * 40) + 20
      };
    });

    const defectTypeData = inspections.reduce((acc: any[], current) => {
      current.defects.forEach(defect => {
        const existing = acc.find(item => item.name === defect.type);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: defect.type, value: 1 });
        }
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    const segmentData = inspections.reduce((acc: any[], current) => {
      const segment = `SEG-${current.id.slice(0, 4)}`;
      const existing = acc.find(item => item.name === segment);
      if (existing) {
        existing.value += current.defects.length;
      } else {
        acc.push({ name: segment, value: current.defects.length });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value).slice(0, 5);

    return { totalDefects, criticalCount: severityCounts[Severity.CRITICAL], severityData, timelineData, severityCounts, defectTypeData, segmentData };
  }, [inspections, t, language]);

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 overflow-y-auto h-full pr-2 custom-scrollbar"
    >
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-display italic">{t('dashboard')}</h2>
          <p className="text-sm text-slate-400 font-light mt-1 uppercase tracking-widest">{isRTL ? 'تجميع بيانات القياس من جميع القطاعات النشطة' : 'Aggregated telemetry data from all active rail sectors.'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">{isRTL ? 'السيرفر الحي' : 'Live Server'}</span>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-black font-mono text-slate-400">SYNC: 14:22:04</span>
          </motion.div>
          <button 
            onClick={() => {
              const allDefects = inspections.flatMap(i => i.defects.map(d => ({
                'Inspection ID': i.id,
                'Timestamp': new Date(i.timestamp).toLocaleString(),
                'Latitude': i.location.lat,
                'Longitude': i.location.lng,
                'Defect ID': d.id,
                'Type': d.type,
                'Severity': d.severity,
                'Confidence': d.confidence,
                'Description': d.description
              })));
              exportToExcel(allDefects, 'Full_Rail_Inspection_Data');
            }}
            disabled={inspections.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all text-[11px] font-black uppercase tracking-widest disabled:opacity-30 active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            {t('exportExcel')}
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { icon: ShieldCheck, color: "blue", label: t('totalInspections'), value: "1,284", unit: "km", trend: "+12%" },
          { icon: AlertCircle, color: "red", label: t('criticalFaults'), value: stats.criticalCount, unit: "", trend: "+2" },
          { icon: ShieldAlert, color: "orange", label: t('hazardDist'), value: stats.totalDefects, unit: "", trend: `+${stats.totalDefects > 10 ? '5' : '1'}` },
          { 
            icon: Users, 
            color: "emerald", 
            label: isRTL ? "الكوادر المتصلة" : "Personnel Active", 
            value: onlineCount, 
            unit: "Online", 
            trend: "LIVE" 
          },
          { 
            icon: Layers, 
            color: "slate", 
            label: t('severitySummary'), 
            customContent: (
              <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                {Object.entries(stats.severityCounts).map(([sev, count]) => (
                  <div key={sev} className="flex flex-col items-center min-w-[36px]">
                    <div className="text-[10px] font-black text-slate-500 uppercase mb-2">
                      {t(sev.toLowerCase() as any).charAt(0)}
                    </div>
                    <div className={cn("text-[11px] font-black font-mono px-2 py-1.5 rounded-xl min-w-[28px] text-center", 
                      sev === Severity.CRITICAL ? "text-rose-500 bg-rose-500/10 border border-rose-500/20" : 
                      sev === Severity.HIGH ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" :
                      sev === Severity.MEDIUM ? "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" :
                      "text-blue-500 bg-blue-500/10 border border-blue-500/20"
                    )}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className={STAT_CARD_STYLE}
          >
            <div className={`flex justify-between items-start mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <stat.icon className={`text-blue-500 w-5 h-5`} />
              </div>
              {stat.trend && (
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                  stat.color === 'red' ? "text-rose-500" : "text-blue-400"
                )}>
                  {stat.trend.includes('%') ? <TrendingUp className="w-3.5 h-3.5" /> : null} {stat.trend}
                </div>
              )}
            </div>
            <p className={`text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isRTL ? 'text-right' : ''}`}>{stat.label}</p>
            {stat.customContent ? stat.customContent : (
              <p className={`text-3xl font-black text-white mt-1 font-display tracking-tight ${isRTL ? 'text-right' : ''}`}>{stat.value} <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{stat.unit}</span></p>
            )}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <stat.icon className="w-24 h-24 text-white" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className={`flex items-center justify-between mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className={`text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              {t('inspectionVelocity')}
            </h3>
            <div className="flex gap-6">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_#2563eb]" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('inspectedKm')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('anomalies')}</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-3xl">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{label}</p>
                          <div className="space-y-2">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-[10px] text-slate-300 font-bold uppercase">{entry.name === 'scanned' ? t('inspectedKm') : t('anomalies')}</span>
                                </div>
                                <span className="text-[11px] font-black font-mono text-white">
                                  {entry.value}{entry.name === 'scanned' ? ' KM' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="scanned" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScanned)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="defects" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDefects)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <h3 className={`text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 mb-10 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
            </div>
            {t('hazardDistribution')}
          </h3>
          <div className="h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.severityData.length > 0 ? stats.severityData : [{ name: 'None', value: 1, color: '#1e293b' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  stroke="none"
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip 
                   content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       const data = payload[0].payload;
                       return (
                         <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[140px]">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: data.color || payload[0].color }} />
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.name}</span>
                           </div>
                           <div className="flex items-center justify-between gap-4">
                             <span className="text-2xl font-black text-white font-display italic tracking-tight">{data.value}</span>
                             <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-2">{t('anomalies')}</span>
                           </div>
                         </div>
                       );
                     }
                     return null;
                   }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white font-display italic">{stats.totalDefects}</span>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">{t('hazardDist')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {stats.severityData.map((s) => (
              <div key={s.name} className={`flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest group-hover:text-white transition-colors">{s.name}</span>
                <span className={cn("text-[11px] text-white font-black font-mono", isRTL ? "mr-auto" : "ml-auto")}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-[0.2em] italic">{t('defectTrends')}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] mt-1 font-bold">Detection Frequency Profile</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => exportToExcel(stats.defectTypeData, 'defect_type_trends')}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 border border-white/5 transition-all"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.defectTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#475569" 
                  fontSize={10} 
                  width={100}
                  tick={{ fill: '#475569', fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{payload[0].payload.name}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-2xl font-black text-white italic">{payload[0].value}</span>
                             <span className="text-[10px] text-slate-500 uppercase font-black">Occurrences</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-[0.2em] italic">{t('recurringIssues')}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] mt-1 font-bold">{t('segmentAnalysis')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => exportToExcel(stats.segmentData, 'recurring_segment_issues')}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 border border-white/5 transition-all"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.segmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={{ fontWeight: 900 }} />
                <YAxis stroke="#475569" fontSize={10} tick={{ fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{payload[0].payload.name}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-2xl font-black text-white italic">{payload[0].value}</span>
                             <span className="text-[10px] text-slate-500 uppercase font-black">{t('anomalies')}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Drone Battery Health Monitoring Dashboard Widget */}
      <motion.div variants={itemVariants}>
        <DroneBatteryMonitor />
      </motion.div>

      {/* My Assigned Tasks - New Section */}
      {myTasks.length > 0 && (
        <motion.div variants={itemVariants} className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                <Box className="w-5 h-5" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-base font-black text-white uppercase tracking-[0.2em] italic">{isRTL ? 'مهامي الشخصية' : 'Personal Tasks'}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{isRTL ? 'التكليفات المرسلة من الإدارة' : 'Official Directives from Headquarters'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTasks.map((task) => (
              <div key={task.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all group overflow-hidden relative">
                 <div className={cn("absolute top-0 right-0 w-1 h-full", task.status === 'completed' ? "bg-emerald-500" : (task.status === 'in-progress' ? "bg-blue-500" : "bg-slate-700"))} />
                 
                 <div className="flex flex-col h-full">
                    <div className={cn("flex justify-between items-start mb-4", isRTL && "flex-row-reverse")}>
                       <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 uppercase italic tracking-widest">
                         #{task.id.slice(-4)}
                       </span>
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleStatusUpdate(task.id, task.status === 'completed' ? 'in-progress' : 'completed')}
                           className={cn(
                             "p-2 rounded-lg transition-all border",
                             task.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-slate-500 hover:text-blue-500"
                           )}
                         >
                           {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                         </button>
                       </div>
                    </div>

                    <h4 className={cn("text-lg font-black text-white italic uppercase tracking-tight mb-2", isRTL && "text-right")}>{task.title}</h4>
                    <p className={cn("text-sm text-slate-500 font-medium mb-6 leading-relaxed", isRTL && "text-right")}>{task.description}</p>
                    
                    <div className="mt-auto space-y-4">
                      {/* Report Input & Submit Button */}
                      <div className="flex gap-2 items-center">
                        <input 
                          type="text"
                          value={reportTexts[task.id] || ''}
                          onChange={(e) => setReportTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder={isRTL ? "اكتب تقرير الإنجاز هنا..." : "Write progress report..."}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all font-sans"
                        />
                        <button 
                          onClick={() => handleSubmitReport(task.id)}
                          disabled={!reportTexts[task.id]?.trim()}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>{isRTL ? "إرسال" : "Submit"}</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {task.report && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex gap-3">
                           <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                           <div className="min-w-0">
                              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1 italic">{isRTL ? "آخر تقرير مرسل" : "Last Narrative Update"}</p>
                              <p className="text-[11px] text-slate-400 font-medium line-clamp-2">{task.report}</p>
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Alerts Table */}
      <motion.div variants={itemVariants} className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div className={`px-8 py-6 border-b border-white/5 flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className={`text-base font-black text-white tracking-widest uppercase italic flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              {t('recentAnomalies')}
            </h3>
            <button className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest border border-white/5 px-4 py-2 rounded-xl bg-white/5">{t('viewLogs')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${isRTL ? 'text-right' : 'text-left'}`}>
            <thead className="bg-white/5 text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black italic">
              <tr className={isRTL ? 'flex-row-reverse' : ''}>
                <th className="px-8 py-5">{t('anomalyType')}</th>
                <th className="px-8 py-5">{t('coordinates')}</th>
                <th className="px-8 py-5">{t('severity')}</th>
                <th className="px-8 py-5">{t('confidence')}</th>
                <th className="px-8 py-5">{t('detectionTime')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inspections.length > 0 ? (
                inspections.flatMap(i => i.defects.map(d => ({...d, location: i.location, timestamp: i.timestamp})))
                  .sort((a, b) => b.confidence - a.confidence)
                  .slice(0, 5)
                  .map((anomaly, index) => (
                    <motion.tr 
                      key={index} 
                      variants={itemVariants}
                      className="group hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                           <div className={cn("p-2.5 rounded-xl border", anomaly.severity === Severity.CRITICAL ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>
                              <RailIcon type={anomaly.type} />
                           </div>
                           <span className="text-sm font-black text-slate-300 uppercase italic tracking-tight">{t(anomaly.type.toLowerCase().replace('_', '') as any) || anomaly.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[11px] text-slate-500 font-bold group-hover:text-slate-300 transition-colors">
                        {anomaly.location.lat.toFixed(4)}, {anomaly.location.lng.toFixed(4)}
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn("text-[9px] px-3 py-1 rounded-lg inline-block font-black uppercase tracking-widest", 
                          anomaly.severity === Severity.CRITICAL ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                          anomaly.severity === Severity.HIGH ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-yellow-500/10 text-yellow-500 border border-yellow-200"
                        )}>
                          {t(anomaly.severity.toLowerCase() as any)}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[11px] font-black text-blue-400 group-hover:text-blue-300 transition-colors">
                        {Math.round(anomaly.confidence * 100)}%
                      </td>
                      <td className="px-8 py-5 text-[11px] text-slate-500 font-bold">
                        {new Date(anomaly.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                    </motion.tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 italic text-sm font-black uppercase tracking-widest opacity-30">
                    {t('noDetections')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RailIcon({ type }: { type: DefectType }) {
  switch (type) {
    case DefectType.CRACK: return <AlertCircle className="w-4 h-4" />;
    case DefectType.EROSION: return <Activity className="w-4 h-4" />;
    case DefectType.MISSING_BOLT: return <ShieldAlert className="w-4 h-4" />;
    case DefectType.TRACK_MISALIGNMENT: return <Route className="w-4 h-4" />;
    case DefectType.DEBRIS: return <Box className="w-4 h-4" />;
    default: return <TrendingUp className="w-4 h-4" />;
  }
}
