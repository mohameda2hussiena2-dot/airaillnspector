import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrackInspection, Severity, DefectType } from '../types';
import { Clock, MapPin, ChevronRight, FileText, Download, Filter, Search, History, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';
import { generateInspectionReport } from '../lib/pdfReport';
import { DefectAnomalyCard } from './DefectAnomalyCard';
import { ReportAnnotationModal } from './ReportAnnotationModal';

interface InspectionLogProps {
  inspections: TrackInspection[];
  onToggleReviewed?: (id: string) => void;
  onBulkReview?: (ids: string[]) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export function InspectionLog({ inspections, onToggleReviewed, onBulkReview, selectedId, onSelect }: InspectionLogProps) {
  const { t, language, isRTL } = useLanguage();
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<DefectType | 'ALL'>('ALL');
  const [filterReviewed, setFilterReviewed] = useState<'ALL' | 'REVIEWED' | 'UNREVIEWED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [activeReportInspection, setActiveReportInspection] = useState<TrackInspection | null>(null);

  useEffect(() => {
    if (selectedId) {
      const element = document.getElementById(`inspection-${selectedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedId]);

  const handleExportPDF = (inspection: TrackInspection) => {
    setActiveReportInspection(inspection);
    setIsAnnotationModalOpen(true);
  };

  const handleAnnotationSubmit = async (notes: string) => {
    setIsAnnotationModalOpen(false);
    if (activeReportInspection) {
      try {
        await generateInspectionReport(activeReportInspection, language, notes);
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setActiveReportInspection(null);
      }
    }
  };

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      const matchesSearch = insp.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           insp.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const highestSeverity = insp.defects.length > 0 
        ? insp.defects.reduce((prev, curr) => {
            const levels = { [Severity.CRITICAL]: 3, [Severity.HIGH]: 2, [Severity.MEDIUM]: 1, [Severity.LOW]: 0 };
            return levels[curr.severity] > levels[prev.severity] ? curr : prev;
          }).severity
        : null;

      const matchesSeverity = filterSeverity === 'ALL' || highestSeverity === filterSeverity;
      
      const matchesType = filterType === 'ALL' || insp.defects.some(d => d.type === filterType);
      
      const matchesReviewed = filterReviewed === 'ALL' || 
                            (filterReviewed === 'REVIEWED' && insp.reviewed) || 
                            (filterReviewed === 'UNREVIEWED' && !insp.reviewed);
      
      return matchesSearch && matchesSeverity && matchesType && matchesReviewed;
    });
  }, [inspections, searchQuery, filterSeverity, filterType, filterReviewed]);

  const severityFilters: (Severity | 'ALL')[] = ['ALL', Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW];
  const typeFilters: (DefectType | 'ALL')[] = ['ALL', ...Object.values(DefectType)];

  const counts = useMemo(() => {
    return {
      severity: severityFilters.reduce((acc, s) => {
        if (s === 'ALL') acc[s] = inspections.length;
        else {
          acc[s] = inspections.filter(insp => {
            if (insp.defects.length === 0) return false;
            const highest = insp.defects.reduce((prev, curr) => {
              const levels = { [Severity.CRITICAL]: 3, [Severity.HIGH]: 2, [Severity.MEDIUM]: 1, [Severity.LOW]: 0 };
              return levels[curr.severity] > levels[prev.severity] ? curr : prev;
            }).severity;
            return highest === s;
          }).length;
        }
        return acc;
      }, {} as Record<string, number>),
      type: typeFilters.reduce((acc, t) => {
        if (t === 'ALL') acc[t] = inspections.length;
        else acc[t] = inspections.filter(insp => insp.defects.some(d => d.type === t)).length;
        return acc;
      }, {} as Record<string, number>),
      reviewed: {
        ALL: inspections.length,
        REVIEWED: inspections.filter(i => i.reviewed).length,
        UNREVIEWED: inspections.filter(i => !i.reviewed).length
      }
    };
  }, [inspections]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const isFiltered = filterSeverity !== 'ALL' || filterType !== 'ALL' || filterReviewed !== 'ALL' || searchQuery !== '';

  const clearFilters = () => {
    setFilterSeverity('ALL');
    setFilterType('ALL');
    setFilterReviewed('ALL');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className={`flex flex-col gap-6 ${isRTL ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center justify-between w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-display italic">{t('inspectionLog')}</h2>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-xl border border-blue-500/20 uppercase tracking-widest leading-none">
                {filteredInspections.length}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-light mt-1 uppercase tracking-widest">{t('registryDesc')}</p>
          </div>
          <div className="flex items-center gap-6">
            {isFiltered && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest border-b border-transparent hover:border-slate-500"
              >
                {t('clearFilters') || (isRTL ? 'مسح الفلاتر' : 'Clear Filters')}
              </button>
            )}
            <div className="relative group">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filterLogs')}
                className={`bg-white/5 border border-white/10 rounded-2xl py-2.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-72 transition-all focus:ring-4 focus:ring-blue-500/10`}
              />
            </div>
          </div>
        </div>

        <div className={`flex flex-wrap gap-4 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
           {/* Severity Filter Pills */}
           <div className={`flex items-center gap-1 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('severity')}</div>
             {severityFilters.map((s) => (
               <button
                 key={s}
                 onClick={() => setFilterSeverity(s)}
                 className={cn(
                   "px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap flex items-center gap-2",
                   filterSeverity === s 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                 )}
               >
                 <span>{s === 'ALL' ? t('all') : t(s.toLowerCase() as any)}</span>
                 <span className={cn(
                   "text-[8px] px-1.5 py-0.5 rounded-md",
                   filterSeverity === s ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"
                 )}>
                   {counts.severity[s]}
                 </span>
               </button>
             ))}
           </div>

           {/* Type Filter Pills */}
           <div className={`flex items-center gap-1 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('anomalyType')}</div>
             <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-lg">
               {typeFilters.map((type) => (
                 <button
                   key={type}
                   onClick={() => setFilterType(type)}
                   className={cn(
                     "px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap flex items-center gap-2",
                     filterType === type 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                   )}
                 >
                   <span>{type === 'ALL' ? t('all') : t(type.toLowerCase().replace('_', '') as any) || type.replace('_', ' ')}</span>
                   <span className={cn(
                     "text-[8px] px-1.5 py-0.5 rounded-md",
                     filterType === type ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"
                   )}>
                     {counts.type[type]}
                   </span>
                 </button>
               ))}
             </div>
           </div>

           {/* Reviewed Filter Pills */}
           <div className={`flex items-center gap-1 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('status')}</div>
             {(['ALL', 'REVIEWED', 'UNREVIEWED'] as const).map((r) => (
               <button
                 key={r}
                 onClick={() => setFilterReviewed(r)}
                 className={cn(
                   "px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap flex items-center gap-2",
                   filterReviewed === r 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                 )}
               >
                 <span>{r === 'ALL' ? t('all') : r === 'REVIEWED' ? t('reviewed') : t('unreviewed')}</span>
                 <span className={cn(
                   "text-[8px] px-1.5 py-0.5 rounded-md",
                   filterReviewed === r ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"
                 )}>
                   {counts.reviewed[r]}
                 </span>
               </button>
             ))}
           </div>

           {filteredInspections.length > 0 && filteredInspections.some(i => !i.reviewed) && (
             <motion.button
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => onBulkReview?.(filteredInspections.filter(i => !i.reviewed).map(i => i.id))}
               className={cn(
                 "flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-500/5",
                 isRTL ? "flex-row-reverse" : ""
               )}
             >
               <CheckCircle2 className="w-4 h-4" />
               {t('bulkReview')}
             </motion.button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredInspections.length === 0 ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px] w-full"
              >
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                  <History className="w-10 h-10 text-slate-700" />
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-600 italic">{t('noDetections')}</p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredInspections.map((insp) => (
                <motion.div 
                  key={insp.id}
                  id={`inspection-${insp.id}`}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={selectedId === insp.id ? { 
                    opacity: 1,
                    scale: 1.02, 
                    borderColor: "rgba(59,130,246,0.5)",
                    backgroundColor: "rgba(15,23,42,0.8)" 
                  } : { 
                    opacity: insp.reviewed ? 0.6 : 1,
                    scale: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                    backgroundColor: "rgba(15,23,42,0.4)" 
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -15, transition: { duration: 0.2 } }}
                  transition={{ 
                    layout: { type: "spring", stiffness: 350, damping: 35 },
                    opacity: { duration: 0.25 },
                    scale: { type: "spring", stiffness: 300, damping: 25 },
                    borderColor: { duration: 0.2 },
                    backgroundColor: { duration: 0.2 }
                  }}
                  onClick={() => onSelect?.(insp.id)}
                  className={cn(
                    "group relative overflow-hidden border rounded-3xl p-5 shadow-2xl flex flex-col gap-5 cursor-pointer",
                    insp.reviewed && selectedId !== insp.id ? "grayscale-[0.3]" : ""
                  )}
                >
                {/* Upper Body Row containing Image & Metadata & Actions */}
                <div className={cn("flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 w-full", isRTL ? "xl:flex-row-reverse" : "")}>
                  {/* Left Column: Image, Segment & Timestamp & Coordinates */}
                  <div className={cn("flex flex-col sm:flex-row items-center gap-6 flex-1 min-w-0", isRTL ? "sm:flex-row-reverse" : "")}>
                    {/* Background ID Decoration */}
                    <span className="absolute -bottom-4 right-8 text-[80px] font-black text-white/[0.02] pointer-events-none select-none tracking-tighter italic">
                      {insp.id.slice(-6).toUpperCase()}
                    </span>

                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                      <img src={insp.imageUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className={cn("flex-1 min-w-0 pr-4", isRTL ? "text-right" : "text-left")}>
                      <div className={cn("flex flex-wrap items-center gap-4 mb-2.5", isRTL ? "flex-row-reverse" : "")}>
                        <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 uppercase tracking-[0.2em] italic">
                          {t('segment')} {insp.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-2 font-mono font-bold uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-blue-500/50" /> {new Date(insp.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                      <h4 className="text-white font-black text-lg mb-2 truncate font-display italic tracking-tight">{insp.summary}</h4>
                      <div className={cn("flex items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]", isRTL ? "flex-row-reverse" : "")}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500/40" />
                          {insp.location.lat.toFixed(6)}, {insp.location.lng.toFixed(6)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500/40" />
                          {insp.defects.length} {t('anomalies')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Tags/Actions Area */}
                  <div className={cn("flex flex-col sm:flex-row items-center justify-between xl:justify-end gap-6", isRTL ? "sm:flex-row-reverse" : "")}>
                    <div className={cn("flex flex-wrap gap-2 max-w-xs", isRTL ? "flex-row-reverse" : "")}>
                       {insp.defects.slice(0, 3).map((d, i) => (
                         <div key={i} className={cn(
                           "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors",
                           d.severity === Severity.CRITICAL 
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                            : "bg-white/5 text-slate-400 border-white/10 group-hover:text-slate-300"
                         )}>
                           {t(d.type.toLowerCase().replace('_', '') as any) || d.type.split('_')[0]}
                         </div>
                       ))}
                       {insp.defects.length > 3 && (
                         <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase italic">
                           +{insp.defects.length - 3}
                         </div>
                       )}
                    </div>

                    <div className="hidden sm:block h-12 w-px bg-white/5 mx-2" />

                    <div className="flex items-center gap-3">
                       <motion.button 
                         whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                         whileTap={{ scale: 0.9 }}
                         onClick={(e) => { e.stopPropagation(); onToggleReviewed?.(insp.id); }}
                         className={cn(
                           "w-12 h-12 rounded-2xl transition-all border flex items-center justify-center",
                           insp.reviewed 
                             ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                             : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                         )}
                       >
                         {insp.reviewed ? <CheckCircle2 className="w-5 h-5 shadow-[0_0_15px_rgba(16,185,129,0.3)]" /> : <Circle className="w-5 h-5" />}
                       </motion.button>

                       <motion.button 
                         whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                         whileTap={{ scale: 0.95 }}
                         onClick={(e) => { e.stopPropagation(); handleExportPDF(insp); }}
                         className={cn(
                           "flex items-center gap-2 px-4 h-12 bg-white/5 border border-white/10 rounded-2xl text-slate-500 transition-all group/pdf",
                           isRTL ? "flex-row-reverse" : ""
                         )}
                         title={isRTL ? "تحميل تقرير PDF" : "Download PDF Report"}
                       >
                         <Download className="w-5 h-5 transition-transform group-hover/pdf:-translate-y-0.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">PDF</span>
                       </motion.button>
                       
                       <motion.button 
                         whileHover={{ scale: 1.1, x: isRTL ? -5 : 5 }}
                         whileTap={{ scale: 0.9 }}
                         className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20"
                       >
                         <ChevronRight className={cn("w-6 h-6", isRTL ? "rotate-180" : "")} />
                       </motion.button>
                    </div>
                  </div>
                </div>

                {/* Technical Diagnostics / Expandable Defect List at bottom */}
                <AnimatePresence>
                  {selectedId === insp.id && insp.defects.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full pt-4 border-t border-white/5 flex flex-col gap-3 cursor-default"
                      onClick={(e) => e.stopPropagation() /* Prevent card selection toggles */}
                    >
                      <div className={cn("flex items-center justify-between mb-1", isRTL ? "flex-row-reverse" : "")}>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                          {isRTL ? "الأعطال الفنية والتفاصيل" : "Technical Diagnostics & Telemetry"}
                        </h5>
                        <span className="text-[9px] font-mono font-bold text-slate-500">
                          {insp.defects.length} {isRTL ? "مستشعرات نشطة" : "ACTIVE SENSORS"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {insp.defects.map((defect) => (
                          <DefectAnomalyCard
                            key={defect.id}
                            defect={defect}
                            isRTL={isRTL}
                            t={t}
                            theme="dark" // Matches the dark sidebar appearance
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ))}
          </AnimatePresence>
        )}
        </motion.div>
      </div>

      <ReportAnnotationModal
        isOpen={isAnnotationModalOpen}
        onClose={() => {
          setIsAnnotationModalOpen(false);
          setActiveReportInspection(null);
        }}
        onSubmit={handleAnnotationSubmit}
      />
    </div>
  );
}
