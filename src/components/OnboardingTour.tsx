import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, X, Sparkles, HelpCircle, Shield, Cpu, RefreshCw, Key } from 'lucide-react';

interface TourStep {
  id: string;
  selector: string;
  tab?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  placement: 'right' | 'left' | 'bottom' | 'top' | 'center';
  requireAdmin?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    selector: 'body',
    titleAr: 'مرحباً بك في نظام مسبار السكك الحديدية الذكي 🧭',
    titleEn: 'AI Rail Inspector Protocol Walkthrough 🧭',
    descAr: 'نرحب بك في جولتنا التعريفية الشاملة. تم تصميم هذا النظام المتطور ليعمل بمثابة نظام تشغيل فني متكامل يجمع بين الطائرة المسيرة (الدرون)، المحاكاة الهندسية ثلاثية الأبعاد، والذكاء الاصطناعي التوليدي عبر طرازات Gemini لضمان سلامة السكك الحديدية بدقة بالغة. دعنا نكشف لك أسراره خطوة بخطوة.',
    descEn: 'Welcome to your complete guided tour. This advanced layout functions as a high-density tactical operating system syncing physical inspection drones, 3D CAD twins, and generative Gemini models to guarantee supreme railway safety. Let us unpack every custom system module one by one.',
    placement: 'center'
  },
  {
    id: 'sidebar-header',
    selector: '#tour-logo',
    titleAr: 'الشعار والرمز السيادي للمشروع 🛡️',
    titleEn: 'Project Branding & Core Identity 🛡️',
    descAr: 'هنا الشعار والهوية البصرية الخاصة بنظام AI Rail Inspector. يمثل هذا المركز الانطلاقة الرسمية لجميع العمليات الميدانية والتحليلات الحاسوبية للمشروع المطور بالكامل تحت إشراف أكاديمي وهندسي متميز.',
    descEn: 'The central starting point featuring the official AI Rail Inspector visual identity. This represents the starting point of our fully customized computer vision network developed under pristine academic and software supervisor guidance.',
    placement: 'right'
  },
  {
    id: 'sidebar-nav',
    selector: '#tour-navigation',
    tab: 'dashboard',
    titleAr: 'بوابات المراقبة والإدارة الأساسية 📊',
    titleEn: 'Primary Telemetry & Monitoring Portals 📊',
    descAr: 'هذه هي قائمة التنقل الرئيسية. تتيح لك التنقل المرن بين الشاشات الرئيسية للنظام: لوحة البيانات الإحصائية الفورية، ومركز التحليل والرفع المباشر الذكي، وخريطة التموضع الجغرافي المعززة بنقاط الخلل، وسجل الفحوصات والتقارير التنفيذية القابلة للتحميل بنقرة واحدة.',
    descEn: 'The central navigational column. From here, you can switch seamlessly between the main components: the real-time Statistical Dashboard, the AI Upload and Analysis Hub, the GIS Geotag Grid, and the complete Inspection Logs with instant PDF reporting.',
    placement: 'right'
  },
  {
    id: 'ai-analysis-details',
    selector: '#tour-navigation',
    tab: 'analysis',
    titleAr: 'مركز الفحص والتحليل الذكي (Gemini AI) 🧠',
    titleEn: 'AI Analysis & Neural Image Processing Hub 🧠',
    descAr: 'أقوى الميزات التكنولوجية في نظامنا! يتيح لك هذا القسم رفع صور السكك الحديدية الملتقطة ميدانياً ليقوم نموذج الذكاء الاصطناعي (Gemini) بفحصها وتحديد كافة الشقوق والعيوب والمسامير المفقودة فوراً بدقة تزيد عن ٩٥٪ مع كتابة تقرير فني شامل تلقائياً ورسم مربعات التحديد الهندسية حول الأعطال.',
    descEn: 'Our benchmark technology! The Upload & Analysis section leverages state-of-the-art server-side Gemini vision models to ingest raw field photos, isolate critical anomalies (cracks, missing fasteners, structural deformities), draw geometric coordinates, and compile an exhaustive safety response.',
    placement: 'right'
  },
  {
    id: 'gis-geotag-map',
    selector: '#tour-navigation',
    tab: 'map',
    titleAr: 'خريطة التموضع والربط الجغرافي (GIS Grid) 🗺️',
    titleEn: 'GIS Real-Time Electromagnetic Geotag Map 🗺️',
    descAr: 'تعرض هذه الخريطة الحية مواقع الفحوصات الجيومكانية بدقة فائقة. يتم إسقاط كل عطل تم اكتشافه بواسطة الدرون أو المهندس على الخريطة بإحداثيات GPS فعلية، مع تظليل مستوى الخطورة بالألوان (أحمر للحالات الحرجة، برتقالي للمتوسطة، أخضر للسليمة) لسهولة المتابعة.',
    descEn: 'An interactive GIS visualization matching latitudinal and longitudinal coordinates of physical track faults. Color-coded markers denote severe cracks (red), minor issues (orange), and clean segments (green) helping logistics dispatch maintenance crews instantly.',
    placement: 'right'
  },
  {
    id: 'advanced-accordion',
    selector: '#tour-advanced-systems',
    titleAr: 'الأنظمة والبرامج التكنولوجية المتقدمة ⚙️',
    titleEn: 'Advanced Systems Sub-Modules ⚙️',
    descAr: 'هذه الحزمة الفريدة تمثل العقل التحليلي والنماذج التجريبية الإضافية التي تم ابتكارها لتطوير كفاءة فحص الخطوط. تشمل الصيانة التنبؤية، تحكم الملاحة الآلي للدرون، الاستشعار الحراري للأعطال، الاتصال الداخلي الميداني، وبحوث الأحمال الحركية.',
    descEn: 'An industry-grade expandable portfolio comprising complex physics simulations and predictive modeling. This accordion controls Predictive Maintenance algorithms, Drone Autopilot paths, Thermal stress detectors, Load calculators, and Secure server gateways.',
    placement: 'right'
  },
  {
    id: 'predictive-maintenance',
    selector: '#tour-advanced-systems',
    tab: 'predictive_maintenance',
    titleAr: 'الصيانة الاستشرافية والتنبؤ بالأعطال 📈',
    titleEn: 'Predictive Maintenance Engine 📈',
    descAr: 'يستخدم هذا القسم خوارزميات التعلم الآلي المتقدمة لتحليل عمر القضبان المتبقي (RUL) بناءً على معدلات التآكل ومستويات الرطوبة واهتزازات السكة، مما يمكننا من التنبؤ بموعد العطل وسرعة التدخل قبل حدوثه.',
    descEn: 'Harnesses custom machine learning regression to model Remaining Useful Life (RUL) limits of track segments based on vibration spikes, micro-wear, and humidity indices, giving a visual heads-up to technical planners before actual material failures occur.',
    placement: 'right'
  },
  {
    id: 'autopilot-command',
    selector: '#tour-advanced-systems',
    tab: 'autopilot_command',
    titleAr: 'غرفة توجيه وملاحة الروبوت الطائر 🛸',
    titleEn: 'Autonomous Drone Flight Autopilot 🛸',
    descAr: 'تتيح هذه الواجهة التحكم الذاتي الكامل بمسارات الدرون الفاحص وتحديد حواجز جغرافية افتراضية (Geofences) لضمان طيران آمن ورسم مسارات فحص مبرمجة مسبقاً لحساب زوايا دقيقة فوق الخطوط الحديدية.',
    descEn: 'A mission-control cockpit enabling visual flight path planning, obstacle avoidance limits, virtual Geofences, and coordinates setting. Perfect for orchestrating hands-free, automated high-definition inspection sweeps.',
    placement: 'right'
  },
  {
    id: 'thermal-vision',
    selector: '#tour-advanced-systems',
    tab: 'thermal_vision',
    titleAr: 'نظام الكشف الطيفي والحراري والأشعة 🔥',
    titleEn: 'Infrared & Electromagnetic Thermal Imaging 🔥',
    descAr: 'نظام تشغيل يحاكي كاميرات الأشعة تحت الحمراء. يكتشف التغيرات غير المرئية في درجات حرارة المعادن الناتجة عن الاحتكاك الشديد والإجهاد الميكانيكي المستمر للقطارات، مما يكشف الشروخ الباطنية والعيوب المخفية.',
    descEn: 'Simulates high-end infrared cameras to analyze heat signatures and friction levels across rail joints. Unstable thermal hotspots alert engineers of underlying internal structural exhaustion before it surfaces visually.',
    placement: 'right'
  },
  {
    id: 'load-simulator',
    selector: '#tour-advanced-systems',
    tab: 'load_simulator',
    titleAr: 'محاكي الأحمال الهندسية والتحليل الميكانيكي 🚛',
    titleEn: 'Dynamic Rail Stress & Load Simulator 🚛',
    descAr: 'أداة تفاعلية لاحتساب مقدار انحناء ومقاومة السكك الحديدية تحت ضغط الأوزان الثقيلة ومقطورات البضائع العملاقة، والتأكد من مطابقة الصلابة للمعايير القياسية العالمية لتجنب الانزلاق.',
    descEn: 'An interactive analytical workbench applying finite element mechanics. Simulates steel deflection, stress margins, and maximum load capacity under bulk freight trains to guarantee complete compliance with strict global standards.',
    placement: 'right'
  },
  {
    id: 'api-gateway',
    selector: '#tour-advanced-systems',
    tab: 'api_gateway',
    titleAr: 'بوابة برمجية مؤمنة لقنوات البيانات 🔐',
    titleEn: 'Secure System Microservice API Gateway 🔐',
    descAr: 'مرآة المراقبة الخاصة بمهندسي البرمجيات في فريقنا. تعرض حالة الخوادم، ومرات استدعاء النماذج وسرعة الاستجابة بالملي ثانية، وتدفق الـ JSON، مع تقنية تشفير الرموز الأمنية وقواعد جدار الحماية.',
    descEn: 'Built to demonstrate robust software orchestrations. Offers live microservices monitoring, response speeds (ms), network request rates, token access status, and live output streams suitable for enterprise integrations.',
    placement: 'right'
  },
  {
    id: 'crew-intercom',
    selector: '#tour-advanced-systems',
    tab: 'crew_intercom',
    titleAr: 'بوابة الاتصال والتنسيق اللاسلكي الفوري🎙️',
    titleEn: 'Field Intercom & Crew Communication 🎙️',
    descAr: 'قناة تواصل عسكرية فائقة الأمان للربط الصوتي واللاسلكي بين فريق القيادة في مركز التحكم والمهندسين والعمال في المواقع الميدانية لسرعة معالجة الحالات الطارئة وتوجيه فرق الصيانة.',
    descEn: 'A simulated high-fidelity secure intercom and chat environment. Ensures rapid voice-loop and warning dispatching between command personnel and technical field deployment teams during structural emergency events.',
    placement: 'right'
  },
  {
    id: 'db-training',
    selector: '#tour-navigation',
    tab: 'db_training',
    titleAr: 'إدارة وتدريب وتلقيم البيانات (Datasets Hub) 💾',
    titleEn: 'Neural Dataset Trainer & DB Customization 💾',
    descAr: 'هنا يتم تطوير عقل المحاكي والذكاء الاصطناعي. يمكننا رفع عينات صور وتدريب الخوارزميات وصياغة مصفوفات الفروق، لمضاعفة ضبط دقة التنبؤ وفهم أي خصائص بيئية صعبة.',
    descEn: 'A high-level interface to inspect the training datasets, feed fresh annotated imagery, evaluate model weight performance, and fine-tune detection metrics specifically to combat local regional rail rust shapes.',
    placement: 'right',
    requireAdmin: true
  },
  {
    id: 'admin-panel-step',
    selector: '#tour-navigation',
    tab: 'admin',
    titleAr: 'لوحة الإشراف المتكامل وبوابة المسؤول (Admin Area) 👑',
    titleEn: 'Administrative Governance & Security Command 👑',
    descAr: 'قسم سلطة النظام والإشراف الكامل. يحتوي على تقارير كفاءة استخدام الفريق، وحالة اتصال الأعضاء الفورية، ومعدلات الذكاء الاسترجاعي، وسجل العمليات الأمنية المتكامل لمراقبة أي تسلل أو تعديل غير مصرح به.',
    descEn: 'The supreme administrative panel reserved for project leaders and academic supervisors. Oversee crew performance analytics, live connection status, AI prompt tokens tracking, and the system tamper-proof audit trails.',
    placement: 'right',
    requireAdmin: true
  },
  {
    id: 'header-lang-theme',
    selector: '#tour-header-controls',
    titleAr: 'تخصيص اللغات وحماية البصر وتحكم البيئة 🌐',
    titleEn: 'Localization, Theme Safety & Global Controls 🌐',
    descAr: 'هذا الشريط العلوي يتيح لك بسلاسة التبديل الفوري للنظام كاملاً بين اللغتين (العربية والإنجليزية) مع إعادة محاذاة كل زر وإدخال ليلائم اتجاه القراءة والكتابة، مع زر التحكم في سطوع الوضع الليلي والنهاري لحفظ سلامة أعين المراقبين.',
    descEn: 'Located at the crown of the workspace. Toggle between Arabic & English with layout flipping, or enable light/dark modes structured specifically to prevent operational fatigue during overnight supervision shifts.',
    placement: 'bottom'
  },
  {
    id: 'drone-sync-block',
    selector: '#tour-drone-connect',
    titleAr: 'مؤشر اتصال عتاد الطائرة الذاتية 🔋',
    titleEn: 'Autonomous Inspection Drone HUD 🔋',
    descAr: 'يعرض حالة اتصال الطائرة بدون طيار (الدرون) الحية، سعة البطارية الحالية، ونظام المزامنة غير المتصل بالإنترنت لضمان استمرار التدفق وتخزين البيانات الهندسية في الذاكرة المؤقتة حتى عودة شبكة الاتصال.',
    descEn: 'Displays real-time hardware battery capacity, remote signal strength, and local offline-sync caching variables, keeping the flow of data moving even in zero-reception desert routes.',
    placement: 'top'
  },
  {
    id: 'user-portals-rbac',
    selector: '#tour-portal-switcher',
    titleAr: 'بوابة تبديل صلاحيات وسلطة المستخدمين (RBAC Emulator) 🔑',
    titleEn: 'Flexible Access Control & Role Switcher 🔑',
    descAr: 'المحور التفاعلي الأقوى لتجربة النظام! يتيح لك هذا المنزلق المفتوح التحول الفوري وتجسيد شخصيات مستخدمين متعددين؛ كقائد المشروع (CEO)، المشرف الأكاديمي، مهندس الميكانيكا، أو الفني الميداني. ستدهشك كيفية تبدل مظهر الشاشة والقوائم والصلاحيات لتطابق دور كل شخصية بدقة متكاملة.',
    descEn: 'An absolute champion feature for testing! This simulated Role-Based Access Control dropdown allows you to instantly body-swap identities (CEO, Academic Supervisor, Mechanical Lead, Field Tech). Observe how the entire layout, sidebar, commands, and options adapt dynamically to preserve compartmentalized project authority.',
    placement: 'top'
  }
];

interface OnboardingTourProps {
  currentTab?: string;
  setTab?: (tab: string) => void;
}

export function OnboardingTour({ currentTab, setTab }: OnboardingTourProps) {
  const { isRTL, language } = useLanguage();
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [, setWindowSize] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if user is visiting for the first time
  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_onboarding_tour_v4');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Filter tour steps based on current user permissions
  const filteredSteps = TOUR_STEPS.filter(step => {
    if (step.requireAdmin) {
      // If we have hasPermission function, use it, else default to true
      return hasPermission ? (hasPermission('admin') || user?.permissions?.isAdmin) : true;
    }
    return true;
  });

  // Ensure currentStep stays inside range if steps shrink
  useEffect(() => {
    if (currentStep >= filteredSteps.length) {
      setCurrentStep(Math.max(0, filteredSteps.length - 1));
    }
  }, [filteredSteps.length, currentStep]);

  // Handle auto-switching tabs when shifting steps
  useEffect(() => {
    if (!isOpen) return;
    const step = filteredSteps[currentStep];
    if (step && step.tab && setTab && currentTab !== step.tab) {
      // Check if user has permission to visit this tab to avoid redirect loops
      const canVisit = hasPermission ? hasPermission('page', step.tab === 'analysis' || step.tab === 'map' ? 'map' : step.tab) : true;
      if (canVisit) {
        setTab(step.tab);
      }
    }
  }, [currentStep, isOpen]);

  // Update position of spotlight based on the selected element
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = filteredSteps[currentStep];
      if (!step || step.selector === 'body' || step.placement === 'center') {
        setHighlightRect(null);
        return;
      }

      const element = document.querySelector(step.selector);
      if (element) {
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        
        // Short delay to let scrolling complete for accurate rect mapping
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setHighlightRect(rect);
        }, 150);
      } else {
        setHighlightRect(null);
      }
    };

    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    const timeout = setTimeout(updatePosition, 300);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timeout);
    };
  }, [currentStep, isOpen, currentTab, filteredSteps.length]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('has_seen_onboarding_tour_v4', 'true');
    setCurrentStep(0);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRestart}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(37,99,235,0.4)] border border-blue-500/30 flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all group backdrop-blur-md cursor-pointer select-none"
        id="tour-badge-trigger"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>{isRTL ? 'دليل ومحاكي النظام 🧭' : 'Operating Manual 🧭'}</span>
      </motion.button>
    );
  }

  const step = filteredSteps[currentStep];
  if (!step) return null;

  const title = isRTL ? step.titleAr : step.titleEn;
  const description = isRTL ? step.descAr : step.descEn;

  // Calculate dynamic coordinates for the floating tooltip
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  if (highlightRect) {
    const margin = 20;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    if (step.placement === 'right') {
      tooltipStyle.top = Math.max(20, Math.min(highlightRect.top, screenHeight - 340));
      tooltipStyle[isRTL ? 'right' : 'left'] = isRTL 
        ? screenWidth - highlightRect.left + margin 
        : highlightRect.right + margin;
    } else if (step.placement === 'left') {
      tooltipStyle.top = Math.max(20, Math.min(highlightRect.top, screenHeight - 340));
      tooltipStyle[isRTL ? 'left' : 'right'] = isRTL
        ? highlightRect.right + margin
        : screenWidth - highlightRect.left + margin;
    } else if (step.placement === 'bottom') {
      tooltipStyle.top = highlightRect.bottom + margin;
      tooltipStyle.left = Math.max(20, Math.min(highlightRect.left + (highlightRect.width / 2) - 210, screenWidth - 440));
    } else if (step.placement === 'top') {
      tooltipStyle.bottom = (screenHeight - highlightRect.top) + margin;
      tooltipStyle.left = Math.max(20, Math.min(highlightRect.left + (highlightRect.width / 2) - 210, screenWidth - 440));
    }
  } else {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden select-none">
      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
        <defs>
          <mask id="spotlight-mask-detailed">
            <rect width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 12}
                y={highlightRect.top - 12}
                width={highlightRect.width + 24}
                height={highlightRect.height + 24}
                rx={18}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="#020617"
          opacity={0.80}
          mask="url(#spotlight-mask-detailed)"
        />
      </svg>

      {/* Pulsing highlights */}
      {highlightRect && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'absolute',
            top: highlightRect.top - 14,
            left: highlightRect.left - 14,
            width: highlightRect.width + 28,
            height: highlightRect.height + 28,
            pointerEvents: 'none',
          }}
          className="rounded-[1.4rem] border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5),inset_0_0_20px_rgba(59,130,246,0.2)] animate-pulse z-[9999]"
        />
      )}

      {/* Dialog Card Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -15 }}
          style={tooltipStyle}
          className={`w-[92vw] max-w-[440px] bg-slate-950/98 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-9 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95)] z-[9999] text-white overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {/* Cyan/Blue Neon lightbar header */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-650 via-indigo-600 to-amber-500 animate-pulse" />
          
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <span className="text-[10px] font-mono font-black tracking-widest text-[#3b82f6] uppercase bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
              {currentStep + 1} / {filteredSteps.length}
            </span>
            <button
              onClick={handleClose}
              className="p-1 px-1.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
              title={isRTL ? "إغلاق" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-5">
            {/* Context Module Emblem */}
            <div className={`p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl w-fit flex items-center gap-2 ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
              <Shield className="w-5 h-5 animate-pulse text-cyan-400" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-450 font-bold">
                {step.tab ? `${step.tab.toUpperCase()}_NODE` : 'SYSTEM_NODE'}
              </span>
            </div>

            <div className="space-y-3.5">
              <h3 className="text-xl font-black tracking-tight leading-snug font-display text-white">
                {title}
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-h-[160px] overflow-y-auto pr-1 no-scrollbar select-text selection:bg-blue-500/30">
                {description}
              </p>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
              <div className="flex gap-1.5">
                {filteredSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStep ? 'w-5 bg-blue-500' : 'w-1.5 bg-white/15 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2.5">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl text-xs font-black transition-all text-slate-350 hover:text-white cursor-pointer"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span>{isRTL ? 'السابق' : 'Prev'}</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black transition-all text-white shadow-xl shadow-blue-600/30 border border-blue-500 cursor-pointer"
                >
                  <span>{currentStep === filteredSteps.length - 1 ? (isRTL ? 'إنهاء الجولة' : 'Finish Tour') : (isRTL ? 'المتابعة' : 'Next Step')}</span>
                  {currentStep < filteredSteps.length - 1 && (
                    isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
