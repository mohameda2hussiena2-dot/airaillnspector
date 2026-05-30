import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileDown, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Settings, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TrackInspection } from '../types';
import { generateMaintenanceHistoryReport } from '../lib/pdfReport';
import { LoginDropdown } from './LoginDropdown';

interface SegmentReportsPageProps {
  inspections: TrackInspection[];
}

export function SegmentReportsPage({ inspections = [] }: SegmentReportsPageProps) {
  const { t, isRTL } = useLanguage();
  const { hasPermission, user } = useAuth();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('all');

  const selectedInspections = selectedSegmentId === 'all' 
    ? inspections 
    : inspections.filter(ins => ins.id === selectedSegmentId);

  // Extract all defects inside current filter
  const activeDefects = selectedInspections.flatMap(ins => {
    return ins.defects.map(def => ({
      defect: def,
      inspectionId: ins.id,
      location: ins.location,
      timestamp: ins.timestamp
    }));
  });

  const defectTrendData = React.useMemo(() => {
    const referenceDate = new Date("2026-05-30");
    let maxDate = new Date(referenceDate);

    // Dynamic max-date boundary matching existing timestamps
    inspections.forEach(ins => {
      const d = new Date(ins.timestamp);
      if (!isNaN(d.getTime()) && d > maxDate) {
        maxDate = new Date(d);
      }
    });

    const dataPoints = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(maxDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const label = d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
      
      dataPoints.push({
        dateStr,
        label,
        count: 0,
        criticalOrHigh: 0,
      });
    }

    selectedInspections.forEach(ins => {
      const insDate = new Date(ins.timestamp);
      if (isNaN(insDate.getTime())) return;
      const year = insDate.getFullYear();
      const month = String(insDate.getMonth() + 1).padStart(2, '0');
      const day = String(insDate.getDate()).padStart(2, '0');
      const insDateStr = `${year}-${month}-${day}`;

      const matchedPoint = dataPoints.find(dp => dp.dateStr === insDateStr);
      if (matchedPoint) {
        matchedPoint.count += ins.defects.length;
        ins.defects.forEach(def => {
          if (def.severity === 'CRITICAL' || def.severity === 'HIGH') {
            matchedPoint.criticalOrHigh += 1;
          }
        });
      }
    });

    return dataPoints;
  }, [inspections, selectedInspections, isRTL]);

  const criticalAndHighCount = activeDefects.filter(d => d.defect.severity === 'CRITICAL' || d.defect.severity === 'HIGH').length;
  const totalDefectsCount = activeDefects.length;

  return (
    <div className="space-y-10">
      
      {/* Top Welcome Title */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider italic font-display">
            {isRTL ? "بوابة صيانة السكك وتوليد تقارير القطاعات" : "Segment-Focused Maintenance Center"}
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            {isRTL ? "توليد وإصدار ملفات تقارير PDF مخصصة لقطاعات الشبكة بناءً على عيوب المسار والـ GPS" : "Generate, preview, and export secure PDF maintenance cards for specific track segments."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Report Generator & Selection UI */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <h3 className={`text-base font-black text-white uppercase tracking-wider italic mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "تصدير وثيقة صيانة مخصصة" : "Generate Customized PDF Audit"}
            </h3>

            <div className={`flex flex-col md:flex-row gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <label className={`block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? "اختر قطاع سكة حديد لمراجعته" : "Select Target Network Segment"}
                </label>
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="w-full text-xs bg-slate-955 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 font-mono focus:ring-1 focus:ring-cyan-500/30"
                >
                  <option value="all" className="bg-slate-950 text-slate-400">
                    {isRTL ? "📋 جميع قطاعات الشبكة" : "📋 All Network Segments"}
                  </option>
                  {inspections.map((ins) => {
                    const label = isRTL 
                      ? `قطاع مترو MB-${ins.id.slice(-6).toUpperCase()}` 
                      : `Metro Segment MB-${ins.id.slice(-6).toUpperCase()}`;
                    return (
                      <option key={ins.id} value={ins.id} className="bg-slate-900 text-white font-mono">
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    generateMaintenanceHistoryReport(inspections, isRTL ? 'ar' : 'en', selectedSegmentId);
                  }}
                  className="w-full md:w-auto text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-cyan-400/20 uppercase tracking-widest"
                >
                  <FileDown className="w-4 h-4" />
                  <span>
                    {isRTL ? "تصدير الملف المباشر PDF" : "EXPORT PDF REPORT"}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1">
                  {isRTL ? "إجمالي العيوب بالقطاع" : "LOGGED FAULTS"}
                </span>
                <span className="text-slate-100 font-extrabold text-xl font-mono">{totalDefectsCount}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1">
                  {isRTL ? "العيوب الحرجة / العالية" : "HIGH & CRITICAL FAULTS"}
                </span>
                <span className="text-red-400 font-extrabold text-xl font-mono">{criticalAndHighCount}</span>
              </div>
            </div>

            {/* Line Chart showing the frequency of defects found over the past 30 days */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wider italic">
                    {isRTL ? "معدل تكرار العيوب المتبعة (٣٠ يوماً الماضية)" : "Inspection Defect Trend (Past 30 Days)"}
                  </span>
                </div>
                <div className={`flex gap-4 text-[8px] font-black font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-1 bg-cyan-400 rounded-sm inline-block" />
                    <span className="text-slate-400">{isRTL ? "العدد الإجمالي" : "TOTAL FAULTS"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-1 bg-red-400 rounded-sm inline-block" style={{ backgroundImage: 'linear-gradient(to right, #f87171 50%, transparent 50%)', backgroundSize: '4px 100%' }} />
                    <span className="text-slate-400">{isRTL ? "الحرجة والخطرة" : "CRITICAL/HIGH"}</span>
                  </div>
                </div>
              </div>

              <div className="h-[180px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defectTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                      dy={5}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/95 border border-white/15 p-3 rounded-xl shadow-2xl backdrop-blur-2xl text-[10px]">
                              <p className="font-mono font-black text-slate-400 uppercase tracking-wider pb-1.5 mb-1.5 border-b border-white/5">{label}</p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                      <span className="text-slate-300 font-medium font-sans">
                                        {entry.name === 'count' 
                                          ? (isRTL ? "إجمالي العيوب" : "Total Defects") 
                                          : (isRTL ? "العيوب الشديدة" : "Critical/High")}
                                      </span>
                                    </div>
                                    <span className="font-mono font-black text-white">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#06b6d4" 
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 1, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="criticalOrHigh" 
                      stroke="#f87171" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={{ r: 3, stroke: '#f87171', strokeWidth: 1, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table list of defects included in report */}
          <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <h3 className={`text-base font-black text-white uppercase tracking-wider italic mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "مراجعة العيوب المشمولة في المستند" : "Defects Included in PDF Document"}
            </h3>

            {activeDefects.length === 0 ? (
              <p className="text-slate-550 text-xs italic text-center py-6">
                {isRTL ? "لا توجد عيوب مسجلة تحت شروط البحث هذه." : "No logged defects find under current selection criteria."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase font-black text-[9px] tracking-wider">
                      <th className="py-3 px-2">{isRTL ? "معرف العيب" : "Defect ID"}</th>
                      <th className="py-3 px-2">{isRTL ? "النوع" : "Type"}</th>
                      <th className="py-3 px-2">{isRTL ? "الخطورة" : "Severity"}</th>
                      <th className="py-3 px-2">{isRTL ? "الموقع الجغرافي" : "Coordinates"}</th>
                      <th className="py-3 px-2">{isRTL ? "تاريخ الرصد" : "Detected"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDefects.map(({ defect, location, timestamp }, idx) => {
                      const isCritical = defect.severity === 'CRITICAL';
                      const isHigh = defect.severity === 'HIGH';
                      const isMedium = defect.severity === 'MEDIUM';

                      return (
                        <tr key={defect.id || idx} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                          <td className="py-3 px-2 font-mono text-[10px] text-slate-350">
                            {`DEF-${defect.id.slice(-4).toUpperCase()}`}
                          </td>
                          <td className="py-3 px-2 font-semibold text-slate-100">
                            {defect.type}
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest ${
                              isCritical ? 'bg-red-500/15 text-red-400' :
                              isHigh ? 'bg-amber-500/15 text-amber-400' :
                              isMedium ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-500/15 text-slate-400'
                            }`}>
                              {defect.severity}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-400 font-mono text-[10px]">
                            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                          </td>
                          <td className="py-3 px-2 text-slate-400 font-sans text-[10px]">
                            {new Date(timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Onboarding Tour Target / Role-Based Access Control Emulator */}
        <div 
          id="tour-portal-switcher" 
          className="lg:col-span-1 bg-slate-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <UserCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-sm font-black tracking-tight text-white leading-tight">
                  {isRTL ? "مستنسخ تبديل الصلاحيات الفردية" : "Role-Based Access Control Area"}
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  {isRTL ? "تعديل صلاحيات دور الفرد فوراً لاختبار التفاعل" : "Body-swap user profiles instantly to simulate security clearances."}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4.5 space-y-4">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  {isRTL ? "صلاحيات حسابك الحالي" : "My Clearances"}
                </span>
                <span className="text-purple-400 font-black font-mono text-[9px] uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 border border-purple-500/10 rounded-md">
                  {user?.roleId || 'ENGINEER'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className={`flex justify-between items-center text-xs text-slate-350 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? "تصدير التقارير الهندسية" : "Export Engineering Logs"}</span>
                  <span className={`font-black ${hasPermission('action', 'canDownload') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hasPermission('action', 'canDownload') ? 'ALLOWED ✓' : 'DENIED ✕'}
                  </span>
                </div>
                <div className={`flex justify-between items-center text-xs text-slate-350 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? "إدارة عتاد الأجهرة والمستخدمين" : "Administrator Privileges"}</span>
                  <span className={`font-black ${hasPermission('admin') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hasPermission('admin') ? 'AUTHORIZED ✓' : 'DENIED ✕'}
                  </span>
                </div>
              </div>
            </div>

            <p className={`text-slate-400 text-xs leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "استخدم لوحة التبديل السريع أدناه للانتقال بين هويات الرتب المعتمدة بالفريق (المدراء، مهندسو الميكانيكا، أساتذة الجامعة، والتحقق الميداني). تذكر دائمًا إدخال الأرقام السرية السريعة الموضحة بداخل القائمة المنسدلة."
                     : "Simulate administrative and technical staff clearances. Trigger identity mutations dynamically to verify data compartmentalization protocols."}
            </p>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6">
            <LoginDropdown isSidebarMode={true} className="w-full" />
          </div>
        </div>

      </div>

    </div>
  );
}
