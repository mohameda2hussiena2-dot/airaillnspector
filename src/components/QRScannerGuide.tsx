import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Info, Sun, Ruler, Sparkles, 
  HelpCircle, CheckCircle2, QrCode, ArrowRight, ArrowLeft, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRScannerGuideProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
}

export function QRScannerGuide({ isOpen, onClose, isRTL }: QRScannerGuideProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'position' | 'template'>('tips');

  if (!isOpen) return null;

  const steps = [
    {
      icon: Ruler,
      title: isRTL ? "المسافة المثالية (١٥ - ٢٠ سم)" : "Ideal Distance (15-20 cm)",
      desc: isRTL 
        ? "أبقِ كاميرا الهاتف المحمول على مسافة ذراع تقريبية أو ١٥-٢٠ سم لتجنب غشاوة التركيز وتفعيل الحساسية البصرية." 
        : "Keep your mobile lens about 15-20 cm away from the rail equipment label to allow the autofocus sensor to lock on instantly.",
      badge: isRTL ? "أفضل دقة" : "Best Accuracy",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      icon: Sun,
      title: isRTL ? "مكان وتوزيع الإضاءة" : "Stable Ambient Lighting",
      desc: isRTL 
        ? "تجنب توجيه الضوء المباشر القوي لتفادي اللمعان والانعكاسات على الملصق المعدني. في الأنفاق، استخدم فلاش الهاتف." 
        : "Avoid harsh glare or direct sunlight reflecting off glossy metallic tags. If scanning inside dark tunnels, activate your flash.",
      badge: isRTL ? "ضروري" : "Mandatory",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    {
      icon: QrCode,
      title: isRTL ? "محاذاة الكود في المنتصف" : "Center the Alignment Target",
      desc: isRTL 
        ? "ضع رمز الاستجابة السريع بالكامل في منتصف إطار المسح الضوئي المضيء للحصول على سرعة فحص تصل إلى ملي ثانية." 
        : "Frame the QR symbol entirely within the scanning boundaries. Ensure all three positioning squares are clear.",
      badge: isRTL ? "تحديث تلقائي" : "Real-time Sync",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    }
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-55 flex flex-col p-6 animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className={`flex items-start justify-between pb-4 border-b border-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right font-sans' : 'text-left'}>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider font-mono">
              {isRTL ? "دليل فحص ومطابقة المعدات الميدانية" : "Field QR Scanning Master Guide"}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight">
            {isRTL ? "وضعيات محاذاة ملصقات المعدات" : "Optimal QR Label Positioning Guide"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {isRTL 
              ? "تفقد الإرشادات التفاعلية الميدانية لضمان قراءة سريعة وبدون أخطاء للمستشعرات." 
              : "Learn the proper physical placements to maximize AI sensor recognition rates in the field."}
          </p>
        </div>
        
        <button 
          onClick={onClose}
          className="p-1 px-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 focus:outline-none"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">{isRTL ? "إغلاق" : "Close"}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800/80 p-1 rounded-xl my-4 text-xs font-bold shrink-0">
        <button 
          onClick={() => setActiveTab('tips')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tips' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{isRTL ? "إرشادات سريعة" : "Quick Rules"}</span>
        </button>
        <button 
          onClick={() => setActiveTab('position')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'position' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isRTL ? "المقارنة البصرية" : "Visual Checklist"}</span>
        </button>
        <button 
          onClick={() => setActiveTab('template')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'template' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isRTL ? "تخطيط الملصق النموذجي" : "Label Blueprint"}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {activeTab === 'tips' && (
            <motion.div 
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className={`p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl h-fit shrink-0 text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className={`flex items-center gap-2.5 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h4 className="text-sm font-extrabold text-white">{step.title}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${step.badgeColor}`}>
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'position' && (
            <motion.div 
              key="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full pb-4"
            >
              {/* Correct Alignment Demo */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      {isRTL ? "محاذاة ممتازة وثنائية" : "Optimal Placement (OK)"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {isRTL 
                      ? "الكود في المنتصف تماماً، الكاميرا عمودية، وخالية من الوميض والانعكاسات لسرعة تحليل فورية." 
                      : "The QR code tag is positioned securely in the center, parallel to the camera, with uniform balanced ambient shade."}
                  </p>
                </div>

                {/* Vector Drawing for Perfect Alignment */}
                <div className="relative bg-slate-950 rounded-xl h-24 border border-emerald-500/40 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/5 border border-dashed border-emerald-500/30 m-3 rounded-lg" />
                  <div className="text-center z-10 flex flex-col items-center gap-1.5">
                    <QrCode className="w-8 h-8 text-emerald-400" />
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                      <Check className="w-3 h-3" /> {isRTL ? "مستعد للمسح" : "Aligned System ready"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Incorrect Alignment Demo */}
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">
                      {isRTL ? "أخطاء محاذاة شائعة" : "Avoid Angle Tilt (Skew)"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {isRTL 
                      ? "تجنب الرقع المظللة جزئياً أو المسح بزاوية حادة تزيد عن ٤٥ درجة تجنباً لتثبيط استجابة الحساس." 
                      : "Do not rotate, tilt or tilt your camera past a 45° angle relative to the flat track equipment face."}
                  </p>
                </div>

                {/* Vector Drawing for Mismatch */}
                <div className="relative bg-slate-950 rounded-xl h-24 border border-red-500/30 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-red-500/5 border border-dashed border-red-500/20 m-3 rounded-lg rotate-12" />
                  <div className="text-center z-10 flex flex-col items-center gap-1.5 transform -rotate-12">
                    <QrCode className="w-8 h-8 text-red-500/60" />
                    <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-950/80 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-red-400" /> {isRTL ? "انحراف زاوية شديد" : "Error skewed layout"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'template' && (
            <motion.div 
              key="template"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl space-y-3">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                    {isRTL ? "قالب الملصق المعتمد للمقاطع والمفاتيح" : "Standardized Rail Tag Spec"}
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {isRTL 
                    ? "يقترن الـ QR بكود تسلسلي مميز للمعدة مع ختم جامعة برج العرب التكنولوجية والرمز المرجعي."
                    : "Standard certified label layouts used across Egypt's high-speed and regional rolling stock switchpoints, containing critical telemetry metadata."}
                </p>

                {/* Virtual Sticker Spec Box */}
                <div className="bg-slate-900 leading-relaxed rounded-xl p-4 border border-slate-800 font-mono text-[9px] text-zinc-300 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-blue-400">EGYPT TECH RAILWAYS</span>
                    <span className="text-zinc-500">2026 PATTERN</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="space-y-1">
                      <div className="text-zinc-500 text-[8px]">MODEL IDENTITY SERIAL</div>
                      <div className="text-white font-bold font-sans text-xs">EQ-SWITCH-104A</div>
                      <div className="text-slate-400 text-[8px]">FREQ: 868.2 MHz LoRa Node</div>
                    </div>
                    <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                  </div>

                  <div className="flex justify-between text-[8px] text-zinc-500 pt-1">
                    <span>SEC: ALEXANDER HUB KM 42.5</span>
                    <span>TAG ID: #04A-X</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Instructions / Quick Tip banner */}
      <div className={`mt-6 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-center gap-3 shrink-0 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400 shrink-0">
          <CheckCircle2 className="w-4 h-4 animate-bounce" />
        </div>
        <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
          {isRTL 
            ? "نصيحة ميدانية: حافظ على نظافة عدسة الكاميرا من الشحوم والأتربة عند العمل بجوار خطوط قطارات الشحن الكثيفة." 
            : "Field Pro-tip: Wipe dirty oil residue off scanner surfaces first when working around heavy diesel corridors."}
        </p>
      </div>
    </div>
  );
}
