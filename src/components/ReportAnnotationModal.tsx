import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, PenTool, Check, Notebook, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ReportAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

export function ReportAnnotationModal({ isOpen, onClose, onSubmit }: ReportAnnotationModalProps) {
  const { t, isRTL } = useLanguage();
  const [notes, setNotes] = useState('');

  const englishPresets = [
    "Permanent way and sleepers verified. Fastener re-calibration successfully completed by mobile maintenance crew.",
    "Ballast and formation structural profile inspected. Minor vegetation cleared. Segment fits technical tolerances.",
    "Critical stress and rail displacement detected. Permanent speed restriction (PSR) recommended until track bed re-packing.",
    "Routine physical inspection audited. Track integrity conforms fully with Egyptian National Rail safety benchmarks."
  ];

  const arabicPresets = [
    "تم فحص قضبان المسار والوسادات الخرسانية بالكامل. تم إجراء معايرة الروابط ومسامير التثبيت بنجاح وهي مطابقة للمواصفات.",
    "فحص قطاع فرشة الحصى والتأكد من جودة تصريف المياه. تم إزالة العوائق النباتية البسيطة والقطاع سليم هندسياً.",
    "رصد إجهادات حرجة ومؤشر انحراف طفيف بالمسار. يوصى بفرض قيود سرعة مؤقتة حتى استكمال إعادة تكسية القضبان.",
    "تمت مطابقة الفحص التقني التلقائي مع الكود المصري لسلامة السكك الحديدية للتأكد من السلامة الهيكلية للقطاع."
  ];

  const handleApplyPreset = (preset: string) => {
    setNotes(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return preset;
      return `${trimmed}\n\n${preset}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(notes);
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: -20 }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)] text-white flex flex-col p-6 sm:p-8"
          >
            {/* Top aesthetic gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer z-10"
              title={isRTL ? "إغلاق" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content */}
            <div className={`flex items-start gap-4 mb-6 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-2xl flex-shrink-0">
                <PenTool className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black font-display tracking-tight uppercase italic text-white flex items-center gap-2">
                  {isRTL ? "إضافة ملاحظات وتدابير مخصصة للتقرير" : "PDF Report Custom Annotations"}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {isRTL 
                    ? "أضف ببيانك المهني أو التدابير الوقائية الهندسية ليتم تضمينها وطباعتها بداخل التقرير المعتمد." 
                    : "Overlay your professional mechanical assessment and field team dispatch commands directly into the signed PDF."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Text Area */}
              <div className="space-y-2">
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <label className="text-[10.5px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Notebook className="w-3.5 h-3.5 text-blue-500" />
                    {isRTL ? "بيان الصيانة والملاحظات الهندسية:" : "ENGINEER STATEMENT / SPECS:"}
                  </label>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                    {isRTL ? "متاح باللغتين العربية والإنجليزية" : "English & Arabic supported"}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isRTL 
                        ? "مثال: تم إجراء فحص دقيق للقطاع واتضح ملاءمة فرشة الحصى واستهداف العيوب الطفيفة المحددة في الصفحة التالية..." 
                        : "e.g., Fasteners successfully calibrated. Manual speed limit set to 60km/h on physical curves until complete ties replacement..."
                    }
                    className={`w-full min-h-[140px] px-4 py-3 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder:text-slate-600 text-white transition-all overflow-y-auto outline-none ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {/* Presets and template helpers */}
              <div className="space-y-2.5">
                <span className={`block text-[10px] font-black text-slate-450 uppercase tracking-widest ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? "قوالب سريعة هندسية معتمدة:" : "Quick Technical Presets & Blueprints:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* English Presets Column */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">English Templates</span>
                    <div className="space-y-1 max-h-[130px] overflow-y-auto pr-1 no-scrollbar">
                      {englishPresets.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="w-full p-2.5 text-left text-[11px] bg-slate-900/60 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/20 text-slate-300 rounded-xl transition-all block truncate cursor-pointer active:scale-95"
                          title={preset}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arabic Presets Column */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block text-right">قوالب باللغة العربية</span>
                    <div className="space-y-1 max-h-[130px] overflow-y-auto pl-1 no-scrollbar direction-rtl">
                      {arabicPresets.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="w-full p-2.5 text-right text-[11px] bg-slate-900/60 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/20 text-slate-300 rounded-xl transition-all block truncate cursor-pointer active:scale-95"
                          title={preset}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning tag about compliance */}
              <div className={`p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3 text-amber-500/80 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-medium leading-relaxed">
                  {isRTL 
                    ? "ملاحظة: سيتم دمج هذه المدخلات كخط مكتوب وموقع رسمياً في ذيل التقرير التقني الفني." 
                    : "Attention: This input will be embedded dynamically and visually formatted inside the technical PDF log's appendix."}
                </span>
              </div>

              {/* Action row */}
              <div className={`flex flex-col sm:flex-row items-center gap-3 justify-end pt-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95"
                >
                  {isRTL ? "إلغاء الأمر" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer active:scale-95 hover:shadow-blue-500/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRTL ? "إنشاء وتنزيل تقرير الـ PDF" : "Generate & Save PDF"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
