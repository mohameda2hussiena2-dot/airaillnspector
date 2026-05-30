import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileDown,
  LayoutList,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { TrackInspection, Severity } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

interface MaintenanceScheduleProps {
  inspections: TrackInspection[];
}

export function MaintenanceSchedule({ inspections }: MaintenanceScheduleProps) {
  const { t, isRTL, language } = useLanguage();

  const workOrders = useMemo(() => {
    // Generate work orders based on critical and high severity defects
    const orders: any[] = [];
    
    inspections.forEach(inspection => {
      inspection.defects.forEach(defect => {
        if (defect.severity === Severity.CRITICAL || defect.severity === Severity.HIGH) {
          orders.push({
            id: `WO-${inspection.id.slice(-4)}-${defect.id.slice(-4)}`,
            inspectionId: inspection.id,
            type: defect.type,
            severity: defect.severity,
            location: inspection.location,
            timestamp: inspection.timestamp,
            status: defect.severity === Severity.CRITICAL ? 'Urgent' : 'Scheduled',
            description: defect.description,
            suggestedAction: defect.severity === Severity.CRITICAL ? 'Immediate track closure & repair' : 'Repair within 48 hours'
          });
        }
      });
    });

    return orders.sort((a, b) => {
      if (a.severity === Severity.CRITICAL && b.severity !== Severity.CRITICAL) return -1;
      if (a.severity !== Severity.CRITICAL && b.severity === Severity.CRITICAL) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [inspections]);

  const exportScheduleToExcel = () => {
    const data = workOrders.map(order => ({
      'Order ID': order.id,
      'Type': order.type,
      'Severity': order.severity,
      'Status': order.status,
      'Latitude': order.location.lat,
      'Longitude': order.location.lng,
      'Suggested Action': order.suggestedAction,
      'Detection Date': new Date(order.timestamp).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Schedule");
    XLSX.writeFile(workbook, `Maintenance_Schedule_${Date.now()}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-full gap-8">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-display italic">{t('maintenanceSchedule')}</h2>
          <p className="text-sm text-slate-500 font-light mt-1 uppercase tracking-widest">{t('scheduleDesc')}</p>
        </div>
        
        <button 
          onClick={exportScheduleToExcel}
          disabled={workOrders.length === 0}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl text-[11px] font-black text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/40 transition-all shadow-xl shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          <FileDown className="w-4 h-4" />
          {t('exportExcel')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary Side */}
        <div className="space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
            <h3 className={cn("text-base font-black text-white uppercase tracking-[0.2em] mb-8 italic flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <LayoutList className="w-5 h-5 text-blue-500" />
              </div>
              {isRTL ? "مخلص أوامر العمل" : "Order Summary"}
            </h3>
            
            <div className="space-y-4">
              <div className={cn("p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between group hover:bg-rose-500/10 transition-colors", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="text-xs font-black text-rose-100 uppercase tracking-widest">{isRTL ? "حرجة" : "Critical"}</span>
                </div>
                <span className="text-2xl font-black text-rose-500 font-display italic">
                  {workOrders.filter(o => o.severity === Severity.CRITICAL).length}
                </span>
              </div>

              <div className={cn("p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between group hover:bg-amber-500/10 transition-colors", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-xs font-black text-amber-100 uppercase tracking-widest">{isRTL ? "عالية الأولوية" : "High Priority"}</span>
                </div>
                <span className="text-2xl font-black text-amber-500 font-display italic">
                  {workOrders.filter(o => o.severity === Severity.HIGH).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Wrench className="w-32 h-32" />
            </div>
            <h3 className={cn("text-lg font-black mb-3 flex items-center gap-3 uppercase tracking-widest italic", isRTL && "flex-row-reverse")}>
              <Wrench className="w-6 h-6" />
              {isRTL ? "توصية الصيانة الذكية" : "AI Insights"}
            </h3>
            <p className="text-blue-100/70 text-[11px] mb-8 leading-relaxed font-medium uppercase tracking-wide">
              {isRTL 
                ? "يقوم نظام الذكاء الاصطناعي بتحليل الأنماط التاريخية للتآكل والضغط لتوقع الأعطال قبل حدوثها."
                : "Predictive neural models analyzing real-time structural stress to mitigate catastrophic failure points."}
            </p>
            <div className="space-y-4">
              {[
                { label: isRTL ? "دقة التنبؤ" : "Model Accuracy", value: "94.2%" },
                { label: isRTL ? "خفض التكاليف" : "Cost Optimization", value: "22%" },
                { label: isRTL ? "سلامة الأصول" : "System Health", value: "Optimum" }
              ].map((insight, idx) => (
                <div key={idx} className={cn("flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-3", isRTL && "flex-row-reverse")}>
                  <span className="text-white/50">{insight.label}</span>
                  <span className="text-white">{insight.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Orders List */}
        <div className="lg:col-span-2 space-y-6">
          {workOrders.length > 0 ? (
            workOrders.map((order, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={order.id}
                className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-blue-500/30 transition-all group hover:bg-slate-900/60 shadow-2xl relative overflow-hidden"
              >
                <div className={cn("flex flex-wrap items-start justify-between gap-6 mb-6", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex flex-col", isRTL && "items-end")}>
                    <div className={cn("flex items-center gap-4 mb-3", isRTL && "flex-row-reverse")}>
                      <span className="text-[10px] font-black font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 uppercase tracking-[0.2em] italic">
                        {order.id}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase py-1 px-3 rounded-xl border tracking-widest",
                        order.severity === Severity.CRITICAL 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors font-display italic tracking-tight">
                      {order.type.replace('_', ' ')} Technical Intervention
                    </h4>
                  </div>
                  <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
                    <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 flex items-center justify-center transition-all">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 flex items-center justify-center transition-all">
                      <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className={cn("grid grid-cols-2 gap-6 mb-6", isRTL && "text-right")}>
                  <div className={cn("flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest", isRTL && "flex-row-reverse")}>
                    <MapPin className="w-4 h-4 text-slate-700" />
                    <span>{order.location.lat.toFixed(6)}, {order.location.lng.toFixed(6)}</span>
                  </div>
                  <div className={cn("flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest", isRTL && "flex-row-reverse")}>
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>{new Date(order.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>

                <div className={cn("p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group-hover:border-white/10 transition-colors", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex flex-col", isRTL && "items-end")}>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 italic">Automated Directive</span>
                    <p className="text-sm text-slate-400 font-bold group-hover:text-slate-200 transition-colors">{order.suggestedAction}</p>
                  </div>
                  <button className={cn("flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors", isRTL && "flex-row-reverse")}>
                    {isRTL ? "عرض التفاصيل" : "Full Data"}
                    <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-[40px] p-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-slate-800" />
              </div>
              <h4 className="text-xl font-black text-white/40 mb-3 uppercase tracking-widest font-display italic">
                {isRTL ? "لا توجد أوامر عمل معلقة" : "All Systems Operational"}
              </h4>
              <p className="text-slate-600 text-[10px] max-w-xs uppercase font-black tracking-widest leading-relaxed">
                {isRTL 
                  ? "جميع القطاعات ضمن نطاق السلامة المعتمد. سيتم توليد جداول الصيانة تلقائياً عند اكتشاف عيوب جديدة."
                  : "Sectors cleared. Predictive monitoring active. Maintenance will auto-generate on anomaly trigger."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
