import React from 'react';
import { 
  Terminal, 
  Settings, 
  Cpu, 
  Shield,
  Layers,
  Workflow
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export function ProjectGuide() {
  const { isRTL } = useLanguage();

  const sections = [
    {
      id: 'overview',
      title: isRTL ? 'نظرة عامة وهيكل النظام' : 'Overview & System Architecture',
      icon: Layers,
      content: isRTL 
        ? 'AI Rail Inspector هو نظام متكامل يربط بين تقنيات الرؤية الحاسوبية (Computer Vision) ونظم المعلومات الجغرافية (GIS). يبدأ التدفق من جمع الصور عبر الطائرات الدرون، ثم معالجتها بواسطة نموذج Gemini Pro Vision لاستخراج العيوب بدقة بكسلية، وانتهاءً بتخزينها في قاعدة بيانات سحابية وتصورها على الخريطة.'
        : 'AI Rail Inspector is an integrated system linking Computer Vision with GIS. The flow starts with drone image collection, followed by Gemini Pro Vision processing for pixel-perfect defect extraction, and ending with cloud database storage and map visualization.'
    },
    {
      id: 'colors',
      title: isRTL ? 'دليل الألوان الشامل' : 'Full Color Palette Guide',
      icon: Settings,
      details: [
        { label: 'Emerald-500', color: 'bg-emerald-500', hex: '#10b981', desc: isRTL ? 'الحالة الآمنة (SAFE): تعني أن القطاع تم فحصه ولا يوجد به أي عيوب تذكر.' : 'Status CLEAR: Means the sector is inspected and no defects were found.' },
        { label: 'Red-600', color: 'bg-red-600', hex: '#dc2626', desc: isRTL ? 'خطر حرج (CRITICAL): خلل فني يستوجب إيقاف حركة القطارات فوراً في هذا النطاق.' : 'CRITICAL Risk: Technical failure requiring immediate train traffic suspension.' },
        { label: 'Orange-500', color: 'bg-orange-500', hex: '#f97316', desc: isRTL ? 'خطر عالٍ (HIGH): عيب بنيوي يجب إصلاحه في الوردية التالية كحد أقصى.' : 'HIGH Risk: Structural defect that must be repaired by the next shift maximum.' },
        { label: 'Yellow-500', color: 'bg-yellow-500', hex: '#eab308', desc: isRTL ? 'متوسط (MEDIUM): عيوب سطحية أو بداية تآكل تتطلب المراقبة الأسبوعية.' : 'MEDIUM: Surface defects or early erosion requiring weekly monitoring.' },
        { label: 'Slate-900', color: 'bg-slate-900', hex: '#0f172a', desc: isRTL ? 'لون الواجهة الأساسي: تم اختياره لتقليل إجهاد العين للمراقبين الليليين.' : 'Primary UI Color: Chosen to reduce eye strain for night-shift operators.' }
      ]
    },
    {
      id: 'abbreviations',
      title: isRTL ? 'القاموس التقني والاختصارات' : 'Technical Glossary & Abbreviations',
      icon: Terminal,
      items: [
        { term: 'CV', full: 'Computer Vision', desc: isRTL ? 'علم تمكين الحواسب من رؤية وفهم الصور الرقمية.' : 'Field of AI enabling computers to see and understand digital images.' },
        { term: 'GIS', full: 'Geographic Info Sys', desc: isRTL ? 'النظام المسؤول عن ربط العيوب بإحداثياتها الجغرافية الحقيقية.' : 'System responsible for linking defects to real geographic coordinates.' },
        { term: 'Lat/Long', full: 'Latitude/Longitude', desc: isRTL ? 'خطوط الطول والعرض: الإحداثيات الدقيقة لموقع العيب.' : 'Latitude/Longitude: Precise coordinates of the defect location.' },
        { term: 'Confidence', full: 'Confidence Score', desc: isRTL ? 'نسبة ثقة الذكاء الاصطناعي في صحة العيب المكتشف (عادة > 95%).' : 'AI confidence percentage in the correctness of the detected defect.' },
        { term: 'JSON', full: 'JavaScript Object', desc: isRTL ? 'تنسيق البيانات المتبادل بين الخادم والواجهة.' : 'Data format exchanged between server and frontend.' }
      ]
    },
    {
      id: 'workflow',
      title: isRTL ? 'دورة حياة فحص المسار' : 'Track Inspection Lifecycle',
      icon: Workflow,
      steps: [
        { label: 'Plan', title: 'Planning', desc: isRTL ? 'تحديد مسار الدرون عبر إحداثيات GPS مسبقة.' : 'Drone path planning via pre-set GPS coordinates.' },
        { label: 'Capture', title: 'Capturing', desc: isRTL ? 'التقاط صور بدقة 4K مع بيانات فوقية (Metadata).' : '4K image capture with embedded metadata.' },
        { label: 'Scan', title: 'Analysis', desc: isRTL ? 'إرسال الصور لنموذج Gemini Pro لتحليل الأنماط والعيوب.' : 'Sending images to Gemini Pro for pattern and defect analysis.' },
        { label: 'Audit', title: 'Validation', desc: isRTL ? 'مراجعة بشرية للنتائج (Human-in-the-loop) قبل اعتمادها.' : 'Human-in-the-loop review before final validation.' },
        { label: 'Fix', title: 'Repair', desc: isRTL ? 'توليد أمر صيانة وإرسال الفرق الميدانية للموقع.' : 'Generating maintenance orders and dispatching field teams.' }
      ]
    },
    {
      id: 'roles',
      title: isRTL ? 'نظام الصلاحيات (RBAC)' : 'Role-Based Access (RBAC)',
      icon: Shield,
      details: [
        { label: 'SUPER ADMIN', color: 'bg-indigo-600', hex: 'LVL 5', desc: isRTL ? 'تحكم كامل في النظام، المستخدمين، وقواعد البيانات.' : 'Full system control, users, and database management.' },
        { label: 'MAINTENANCE', color: 'bg-green-600', hex: 'LVL 3', desc: isRTL ? 'قراءة التقارير، جدولات الصيانة، وتحديث حالة العيوب.' : 'Read reports, schedule maintenance, and update defect status.' },
        { label: 'OPERATOR', color: 'bg-blue-600', hex: 'LVL 2', desc: isRTL ? 'رفع الصور وبدء عملية الفحص المباشر.' : 'Upload images and initiate live scans.' }
      ]
    },
    {
      id: 'technical',
      title: isRTL ? 'التفاصيل البرمجية' : 'Developer Deep-Dive',
      icon: Cpu,
      items: [
        { term: 'Framework', full: 'React 18', desc: 'React 18 + TypeScript (Strict Mode)' },
        { term: 'Styling', full: 'Tailwind v4', desc: 'Tailwind CSS v4 (Utility-first architecture)' },
        { term: 'Backend', full: 'Express/Node', desc: 'Custom server with SQLite integration' },
        { term: 'Realtime', full: 'Websockets', desc: 'Live event streaming to dashboard' }
      ]
    }
  ];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-16 p-10 max-w-7xl mx-auto bg-slate-900/30 rounded-[4rem] border border-slate-800/40 my-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ${isRTL ? 'rtl' : 'ltr'}`}
    >
      <header className={`space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <motion.div variants={itemVariants} className="inline-flex items-center gap-4 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">Protocol Alpha-7 • Security Cleared</span>
        </motion.div>
        
        <div className="space-y-4">
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white tracking-tighter font-display uppercase italic leading-none">
            {isRTL ? 'ميثاق التشغيل' : 'The Blueprint'}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-2xl text-slate-400 max-w-4xl font-light leading-relaxed">
            {isRTL 
              ? 'الدليل المرجعي الصارم لعمليات الفحص الذكي وإدارة مخاطر السكك الحديدية.' 
              : 'The definitive architectural guide for intelligent rail inspection and infrastructure risk management.'}
          </motion.p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <motion.div 
            key={section.id}
            variants={itemVariants}
            className="group relative bg-[#0f172a]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 hover:border-blue-500/20 hover:bg-[#0f172a]/80 transition-all duration-700 shadow-xl"
          >
            <div className={`flex items-center gap-5 mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-4 bg-slate-800/80 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                <section.icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest font-display">{section.title}</h2>
            </div>

            {section.content && (
              <p className={`text-slate-400 text-lg leading-relaxed font-light ${isRTL ? 'text-right' : 'text-left'}`}>
                {section.content}
              </p>
            )}

            {section.items && (
              <div className="space-y-8">
                {section.items.map((item, idx) => (
                  <div key={idx} className={`group/item ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-baseline gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-black text-blue-500 font-mono tracking-tighter">{item.term}</span>
                    </div>
                    <p className="text-base text-slate-400 font-light leading-snug group-hover/item:text-slate-200 transition-colors">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {section.details && (
              <div className="space-y-5">
                {section.details.map((detail, idx) => (
                  <div key={idx} className={`flex items-start gap-5 p-5 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-1.5 shadow-[0_0_20px_-2px_rgba(255,255,255,0.2)] ${detail.color}`} />
                    <div className="flex-1">
                      <div className={`flex justify-between items-center mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-black text-white tracking-widest font-display">{detail.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{detail.hex}</span>
                      </div>
                      <p className="text-[13px] text-slate-400 font-light leading-relaxed">{detail.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.steps && (
              <div className="space-y-10 relative">
                <div className={`absolute top-0 bottom-0 w-px bg-slate-800/50 ${isRTL ? 'right-6' : 'left-6'}`} />
                {section.steps.map((step, idx) => (
                  <div key={idx} className={`relative flex items-start gap-8 ${isRTL ? 'flex-row-reverse text-right pr-2' : 'pl-2'}`}>
                    <div className="z-10 w-10 h-10 rounded-2xl bg-slate-900 border border-blue-600/50 flex items-center justify-center text-blue-400 font-black text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                      {idx + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase mb-1.5">{step.label}</p>
                      <h4 className="text-base font-black text-white mb-1.5">{step.title}</h4>
                      <p className="text-sm text-slate-500 font-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.footer 
        variants={itemVariants}
        className="mt-16 group"
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[3rem] p-16 overflow-hidden relative border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 bg-white/5 rounded-[1rem] backdrop-blur-md border border-white/10">
                  <Cpu className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-4xl font-black text-white tracking-widest uppercase font-display italic">
                  Neural Core 1.5
                </h3>
              </div>
              <p className="text-slate-400 text-xl font-light leading-relaxed max-w-lg">
                {isRTL 
                  ? 'محرك معالجة الصور المعتمد على Gemini Pro Vision، لضمان تشخيصه عالي الدقة يتجاوز المعايير التقليدية.' 
                  : 'Sovereign analysis core leveraging high-spectral computer vision for unmatched defect identification precision.'}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: isRTL ? 'دقة الرصد' : 'DETECTION', val: '99.2%' },
                { label: isRTL ? 'زمن الاستجابة' : 'RESPONSE', val: '240ms' },
                { label: isRTL ? 'ثقة النموذج' : 'AI CONF.', val: '0.98' }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 text-center hover:border-blue-500/30 transition-colors">
                  <div className="text-4xl font-black text-white mb-2 font-display italic tracking-tighter">{stat.val}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-8 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
          <p className="text-slate-400 text-xs font-black tracking-[0.4em] uppercase">
            EST. 2026 • AI RAIL INSPECTOR • V.2.0.4-STABLE
          </p>
          <div className="flex gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Core_Live</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enc_Active</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
