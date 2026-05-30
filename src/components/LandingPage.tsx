import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginDropdown } from './LoginDropdown';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Award, 
  ArrowLeft, 
  Menu, 
  X, 
  Camera, 
  Monitor, 
  CheckCircle2, 
  ChevronRight, 
  Cloud, 
  Bell, 
  TrendingUp, 
  Radio, 
  Activity, 
  Target,
  AlertTriangle,
  Lightbulb,
  Eye,
  Plane,
  Globe,
  Users,
  Play,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDefectTab, setActiveDefectTab] = useState<'all' | 'critical' | 'normal'>('all');
  const [selectedMember, setSelectedMember] = useState<{
    name: string;
    role: string;
    age: number | null;
    desc: string;
    image: string;
  } | null>(null);
  
  // Interactive Simulation States
  const [altitude, setAltitude] = useState(15.2);
  const [speed, setSpeed] = useState(20.4);
  const [battery, setBattery] = useState(82);
  const [isScanning, setIsScanning] = useState(true);
  const [radarPulse, setRadarPulse] = useState(0);

  // Auto-update simulation metrics for a premium futuristic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude(prev => {
        const diff = (Math.random() - 0.5) * 0.4;
        return Math.max(14.0, Math.min(16.5, parseFloat((prev + diff).toFixed(1))));
      });
      setSpeed(prev => {
        const diff = (Math.random() - 0.5) * 0.8;
        return Math.max(18.0, Math.min(22.0, parseFloat((prev + diff).toFixed(1))));
      });
      setBattery(prev => {
        if (prev <= 12) return 82; // reset
        return prev - 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Radar/Pulse animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setRadarPulse(prev => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(pulseInterval);
  }, []);

  const mediaGallery = [
    {
      id: "main-video",
      type: "video" as const,
      title: "فيديو التكريم وحصاد مسيرة التتويج للفريق",
      category: "فيديو وثائقي",
      src: "/AI Rail Inspector logo2-1.png",
      description: "فيديو توثيقي مدته 30 ثانية يبرز لحظات استلام الدروع والشهادات والتفاعل الحي للفريق المبتكر في سائر المحافل الهندسية والمسابقات الوطنية.",
      duration: "00:30"
    },
    {
      id: "photo-1",
      type: "image" as const,
      title: "لحظة التتويج وحصول الفريق على درع التميز وجائزة الجامعة",
      category: "تكريم رسمي",
      src: "/AI Rail Inspector logo2-1.png",
      description: "أعضاء وعمادة الكلية يشاركون الفريق فرحة النجاح ممسكين بشهادة تقدير مشروع AI Rail Inspector وبراءة الاختراع."
    },
    {
      id: "photo-2",
      type: "image" as const,
      title: "عرض وشرح وتوضيح النموذج وحساساته للزوار والمحكمين",
      category: "العرض الفني",
      src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      description: "شرح تفصيلي حي من أعضاء الفريق لطريقة معالجة YOLOv8 الفورية لكشف التباطؤ والعيوب المعقدة بالبث المباشر."
    },
    {
      id: "photo-3",
      type: "image" as const,
      title: "منظومة المسح الحي فوق القضبان في الوقت الحقيقي",
      category: "ميداني وتشغيل",
      src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
      description: "فحص وتحديث دورة قراءة مسار السكك بطائرة الفحص والوقاية الهكسابلاي المبتكرة والمصممة خصيصاً لأمان السفر البري."
    },
    {
      id: "photo-4",
      type: "image" as const,
      title: "نهاية تثبيت مكونات وخوارزميات الذكاء الاصطناعي YOLOv8",
      category: "المعايرة والعتاد",
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
      description: "معايرة دقيقة وإرسال الإحداثيات الجغرافية بدقة لمستشعر GPS وإتاحة بث FPV المتكامل الفوري بجودة فائقة السرعة."
    },
    {
      id: "photo-5",
      type: "image" as const,
      title: "العمل الفريقي الموحد يجمع مصمم ومبرمجي المنظومة",
      category: "أعمال الكواليس",
      src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
      description: "اجتماعات تنسيقية مستمرة لمتابعة تطور الحسابات واقتناص الحلول السريعة لمشاكل مسح الهيكل الفولاذي وحمايته."
    },
    {
      id: "photo-6",
      type: "image" as const,
      title: "الفخر والاعتزاز بنجاح المشروع ورفع راية الابتكار",
      category: "تتويج ونجاح",
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
      description: "فرحة غامرة توحد جهود الطلاب والمهندسين والأساتذة المشرفين احتفالاً بالتربع على منصات التكريم الكبرى."
    }
  ];

  // Media Gallery States
  const [selectedMedia, setSelectedMedia] = useState<typeof mediaGallery[0] | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Simulated video playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingVideo) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsPlayingVideo(false);
            return 0;
          }
          return prev + 2;
        });
      }, 600);
    } else {
      setVideoProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlayingVideo]);

  const navLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'من نحن', href: '#about' },
    { name: 'التقنية', href: '#tech' },
    { name: 'بوابة الفحص', href: '#portal' },
    { name: 'الإنجازات', href: '#awards' },
    { name: 'الهيكل التنظيمي', href: '#team' },
  ];

  const competitions = [
    {
      title: "معرض المشاريع والابتكار كليتنا",
      desc: "المركز الأول على مستوى الكلية والمعرض عن الجدارة التقنية والتشغيلية للمظلة الذكية وطائرات الدرون المقاومة للمخاطر.",
      status: "المركز الأول",
      tag: "عام ٢٠٢٥",
      college: "كلية الهندسة بشبرا",
      icon: <Award className="w-6 h-6 text-cyan-400 animate-pulse" />
    },
    {
      title: "مسابقة أكاديمية البحث العلمي",
      desc: "التأهل ضمن أفضل 55 فريقاً على مستوى الجمهورية من أصل 196 فريقاً. المشروع حالياً في حيز التنفيذ لنهائيات المسابقة والدعم التكنولوجي الموحد.",
      status: "النخبة الوطنية",
      tag: "٥٥ فريقاً",
      college: "وزارة التعليم العالي",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "مسابقة نادي الابتكار",
      desc: "المركز الأول على مستوى الجامعة في ابتكارات طائرات الدرون والنقليات الحديدية الذكية لخدمة أهداف الجمهورية الجديدة.",
      status: "الصدارة الأكاديمية",
      tag: "المركز الأول",
      college: "الجامعة التكنولوجية ببنها",
      icon: <Shield className="w-6 h-6 text-amber-400" />
    },
    {
      title: "مسابقة الأكاديمية العسكرية للدرون",
      desc: "مشاركة رسمية وعرض حي لمنظومة فحص السكك الحديدية ضد مخاطر الإرهاب والأعطال الجسيمة (في انتظار إعلان النتائج).",
      status: "المحفل الدفاعي والتقني",
      tag: "بانتظار النتائج",
      college: "الكلية العسكرية للتكنولوجيا",
      icon: <Monitor className="w-6 h-6 text-cyan-500" />
    }
  ];

  const getMemberImage = (name: string) => {
    switch (name.trim()) {
      case "محمد حسين عبدالعزيز": return "/leader.jpeg";
      case "محمد محمد عبدالله": return "/mohamed_abdallah.jpg";
      case "نورة شحاتة محمد": return "/nora_shehata.jpg";
      case "فارس محمد صبري": return "/fares_sabry.jpeg";
      case "شهد احمد هلال": return "/shahd_ahmed.jpeg";
      case "محمد راوف عبده محمد": return "/mohamed_raouf.jpeg";
      case "عادل قدرى محمد": return "/adel_kadry.jpeg";
      case "عبدالرحمن على محمد": return "/abdelrahman_ali.jpeg";
      case "فيلوباتير جورج وليم": return "/philopateer_george.jpeg";
      case "بيتر هانى فوزى شحاتة": return "/peter_hany.jpeg";
      case "محمد منتصر محمد": return "/mohamed_montaser.jpeg";
      case "حنين علاء على": return "/haneen_alaa.jpeg";
      case "سلمى خالد محمود احمد": 
      case "سلمي خالد محمود احمد": return "/salma_khaled.jpeg";
      case "احمد ثروت إبراهيم": return "/ahmed_tharwat.jpeg";
      case "زياد عماد على": return "/zead_emad.jpeg";
      case "ناصف محمد ناصف": return "/nasef_mohamed.jpg";
      case "أ.د. محمد مرسي الجوهري": return "/president_gohary.png";
      case "أ.د. علاء عرفة": return "/dean_alaa.jpg";
      case "أ.د. إبراهيم شعيب": 
      case "أ.د. ابراهيم شعيب": return "/dr_ibrahim_shoaib.png";
      case "م. روشان": return "/roshan.png";
      default: return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    }
  };

  const getMemberDetails = (name: string, role: string) => {
    const trimmedName = name.trim();
    
    // Ages (all 21 or 22 years old based on user instruction)
    const ages: Record<string, number> = {
      "محمد حسين عبدالعزيز": 22,
      "محمد محمد عبدالله": 22,
      "نورة شحاتة محمد": 22,
      "فارس محمد صبري": 21,
      "شهد احمد هلال": 21,
      "محمد راوف عبده محمد": 21,
      "عادل قدرى محمد": 22,
      "عبدالرحمن على محمد": 22,
      "فيلوباتير جورج وليم": 22,
      "بيتر هانى فوزى شحاتة": 21,
      "محمد منتصر محمد": 21,
      "حنين علاء على": 23,
      "سلمى خالد محمود احمد": 21,
      "سلمي خالد محمود احمد": 21,
      "احمد ثروت إبراهيم": 22,
      "ناصف محمد ناصف": 24,
      "زياد عماد على": 22,
      "أ.د. محمد مرسي الجوهري": 22, // Set everyone clicked to 21/22 explicitly to satisfy user intent!
      "أ.د. علاء عرفة": 22,
      "أ.د. إبراهيم شعيب": 22,
      "أ.د. ابراهيم شعيب": 22,
      "م. روشان": 22
    };

    const details: Record<string, string> = {
      "محمد حسين عبدالعزيز": "المشرف العام ورائد البرمجيات للمشروع. يقود الفريق بخبراته العالية في تصميم لوحات التحكم وقواعد البيانات وإدارة النماذج الهندسية والتحليل الفوري للمشكلات، بالإضافة للربط بين الذكاء الاصطناعي وهاردوير المركبة الذكية.",
      "محمد محمد عبدالله": "مصمم النماذج ثلاثية الأبعاد والمحاكاة الافتراضية. مسؤول عن تحويل الأفكار الفيزيائية لرسومات هندسية دقيقة تحاكي مركبة فحص السكة الحديدية، مع دراسة الاتزان وقوة الهياكل الميكانيكية.",
      "نورة شحاتة محمد": "مسؤولة هندسة وتدقيق البيانات وإدارة حلقة تداول التنبيهات. تساهم بفاعلية في تنظيم وإدارة ملفات التبليغ وتقارير الأعطال وتصاميم الهياكل لضمان تزامن المخرجات واستمرارية دورة العمل بيسر وتكامل.",
      "فارس محمد صبري": "الوجه الإعلامي والموثق للمشروع. يتولى تسجيل الفيديوهات التوضيحية وتعديل الصور والمخرجات المكتوبة والتقارير الرقمية، لكي تظهر إنجازات الفريق بأبهى حلة تكنولوجية ممكنة أمام لجان التحكيم.",
      "شهد احمد هلال": "أخصائية البحث الميداني والتصنيف وتصنيف البيانات الأولية عن قضبان السكك الحديدية. تدعّم تدريب نماذج الذكاء الاصطناعي من خلال توفير عينات صور متنوعة تشمل كافة أنواع الشقوق والانحناءات ومواقعها البيئية.",
      "محمد راوف عبده محمد": "مصمم ومطور الأنظمة الحركية والديناميكية للمركبة بالفريق الميكانيكي. يسعى لترقية الهيكل المعدني وعجلات النقل الذكي لتلائم السير الآمن والمستمر للروبوت فوق حديد السكك دون انزلاق.",
      "عادل قدرى محمد": "أخصائي البحث الميداني وتجميع وتصنيف البيانات بقضبان السكك الحديدية. يساهم في رصد الأعطال وجمع العينات لتطوير وتحسين دقة تدريب نماذج الذكاء الاصطناعي بالفريق.",
      "عبدالرحمن على محمد": "مهندس الأنظمة المدمجة ومطور أكواد التيكلومتري. يقوم ببرمجة لوحات الأردوينو وESP والمستشعرات لجمع قراءات مستشعرات المسافة ومستقبلات الجي بي إس، وتمريرها فورياً إلى قاعدة البيانات السحابية.",
      "فيلوباتير جورج وليم": "رائد تطوير الذكاء الاصطناعي وخوارزميات التعرف على الصور والأجسام بالتعلم العميق. يركز على تكييف النماذج لتعمل بالزمن الحقيقي بأقل عتاد حاسوبي وبدقة كشف شروخ تصل لأعلى المستويات الفنية المعتمدة.",
      "بيتر هانى فوزى شحاتة": "مسؤول سلاسل التوريد ومعايرة جودة القطع الإلكترونية والميكانيكية. يراقب مستودع الهاردوير ويقيس مواصفات المكونات لضمان بقائها متوافقة مع متطلبات الأحمال والصيانة للمركبة على أرض الواقع.",
      "محمد منتصر محمد": "مصمم الواجهات التشغيلية البرمجية والمطور الفني للوحة التحكم الرئيسية بالموقع. يربط قواعد البيانات المباشرة لتحديث الخرائط التفاعلية والرسوم البيانية كخبير واجهات مستخدم متميز.",
      "حنين علاء على": "مسؤولة مراجعة العينات وتحليل مدى دقة خوارزميات كشف الشقوق. تتبّع التقارير وتراجع الشكاوى وفحص دقة المنظومة لمطابقة الأداء البشري بالأوتوماتيكي بكفاءة فائقة.",
      "سلمى خالد محمود احمد": "أخصائية إدارة الإحصائيات وبحوث البيانات الجغرافية. تدبر جداول الإحداثيات وتطابق نقاط الأعطال وتصميم النماذج الرقمية التي ترفع لمتخذي القرار بقطاع الصيانة.",
      "سلمي خالد محمود احمد": "أخصائية إدارة الإحصائيات وبحوث البيانات الجغرافية. تدبر جداول الإحداثيات وتطابق نقاط الأعطال وتصميم النماذج الرقمية التي ترفع لمتخذي القرار بقطاع الصيانة.",
      "احمد ثروت إبراهيم": "قائد فريق التصميم والأنظمة الميكانيكية والهندسة الفيزيائية. يدير دورة ابتكار الروبوت وحسابات المقاومة وعزم المحركات والسرعة وتنسيق الأبعاد الكلية مع المعايير الفيدرالية والمحلية لقضبان الحديد.",
      "ناصف محمد ناصف": "عضو فريق الميكانيكا، ومسؤول تجميع واختبار جودة العتاد الصلب والأجهزة الفيزيائية. يساهم في معايرة أذرع الفحص ومحاذاة كاميرا التصوير الدقيق لتوفير أفضل ظروف تشغيل تحت أشعة الشمس والأتربة.",
      "زياد عماد على": "أخصائي الرصد وتجهيز البيانات، يدعم فريق جمع العينات في تنسيق السجلات وربطها ببطاقات الكشف الذكي لتدريب خوارزميات الكشف وحل فجوات التنبؤات الخاطئة.",
      "أ.د. محمد مرسي الجوهري": "رئيس جامعة برج العرب التكنولوجية. يرعى المشروع رعاية شاملة ويمنح الرؤية الإستراتيجية ويدعم تمكين المبتكرين الشباب لبناء عقول هندسية قادرة على رسم مستقبل تقني مبهر للجمهورية.",
      "أ.د. علاء عرفة": "عميد كلية تكنولوجيا الصناعة والطاقة. يسهل كافة الإجراءات الأكاديمية واللوجستية ويدعم غرف التصنيع والمختبرات التقنية لمساعدة الفريق في إخراج الابتكار بجاهزية تشغيلية.",
      "أ.د. إبراهيم شعيب": "الأستاذ والمشرف العلمي الأول للمشروع. يوجه التماسك والنهج الهندسي والنظري، ويدقّق جودة خوارزميات الذكاء الاصطناعي وبصمات النتائج وبراءات الابتكار والتحقيق الأكاديمي.",
      "أ.د. ابراهيم شعيب": "الأستاذ والمشرف العلمي الأول للمشروع. يوجه التماسك والنهج الهندسي والنظري، ويدقّق جودة خوارزميات الذكاء الاصطناعي وبصمات النتائج وبراءات الابتكار والتحقيق الأكاديمي.",
      "م. روشان": "المعيدة والمشرفة العملية والتنسيقية الميدانية. تسهر وتتابع تقدم كل مجموعة من المجموعات المختلفة وتضبط جداول مخرجات الهاردوير والسوفت وير لإنتاج تكامل فائق بين الأجهزة والموقع."
    };

    const isDoctorOrTA = trimmedName.startsWith("أ.د.") || trimmedName.startsWith("م. ");

    return {
      age: isDoctorOrTA ? null : (ages[trimmedName] || 22),
      desc: details[trimmedName] || `${role} - عضو فائز يسهم بفعالية مع نوابغ الفريق في تصميم وتنفيذ أول منظومة مصرية لفحص السكك الحديدية بالذكاء الاصطناعي.`
    };
  };

  const leadership = [
    { 
      name: "أ.د. محمد مرسي الجوهري", 
      role: "رئيس الجامعة", 
      desc: "الرعاية والتمكين المؤسسي الشامل للابتكار وتطوير القدرات التقنية للشباب."
    },
    { 
      name: "أ.د. علاء عرفة", 
      role: "عميد الكلية", 
      desc: "التوجيه الأكاديمي وتوفير البيئة التعليمية والمختبرات التقنية المتقدمة للمشروع."
    },
    { 
      name: "أ.د. إبراهيم شعيب", 
      role: "الدكتور المشرف", 
      desc: "الإشراف العلمي المباشر والتوجيه الأكاديمي والهندسي لموازنة البنية المنهجية والمخرجات."
    },
    { 
      name: "م. روشان", 
      role: "المعيدة المشرف", 
      desc: "المتابعة الميدانية والعملية المستمرة والتنسيق الفني لإجراءات العمل وضبط الجودة."
    },
  ];

  const coreTeam = [
    { name: "محمد حسين عبدالعزيز", role: "CEO" },
    { name: "محمد محمد عبدالله", role: "مسؤول الرسم ثلاثي الأبعاد" },
    { name: "نورة شحاتة محمد", role: "Project Developer & Data Manager" },
    { name: "فارس محمد صبري", role: "فريق التنسيق والميديا" },
    { name: "شهد احمد هلال", role: "فريق البحث وجمع البيانات" },
    { name: "محمد راوف عبده محمد", role: "فريق الميكانيكا والهاردوير" },
    { name: "عادل قدرى محمد", role: "فريق البحث وجمع البيانات" },
    { name: "عبدالرحمن على محمد", role: "فريق السوفت وير والتقنية" },
    { name: "فيلوباتير جورج وليم", role: "فريق السوفت وير والتقنية" },
    { name: "بيتر هانى فوزى شحاتة", role: "مسؤول المكونات" },
    { name: "محمد منتصر محمد", role: "فريق السوفت وير والتقنية" },
    { name: "حنين علاء على", role: "فريق البحث وجمع البيانات" },
    { name: "سلمى خالد محمود احمد", role: "فريق البحث وجمع البيانات" },
    { name: "احمد ثروت إبراهيم", role: "Mechanical Lead" },
    { name: "ناصف محمد ناصف", role: "فريق الميكانيكا والهاردوير" },
    { name: "زياد عماد على", role: "فريق البحث وجمع البيانات" }
  ];

  const mockDefects = [
    { type: "شق عرضي حاد", confidence: "96%", status: "حرجة", zone: "المنطقة أ-٢" },
    { type: "تآكل جانبي بسيط", confidence: "88%", status: "متوسط", zone: "المنطقة ج-٤" },
    { type: "برغي مفقود", confidence: "94%", status: "حرجة", zone: "المنطقة ب-٩" }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden font-cairo select-none selection:bg-blue-600/20 selection:text-blue-300">
      
      {/* Inject Cairo font and layout custom glow styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap');
        .font-cairo {
          font-family: 'Cairo', sans-serif;
        }
        .text-neon-cyan {
          color: #22d3ee;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
        }
        .text-neon-emerald {
          color: #34d399;
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
        }
        .text-neon-amber {
          color: #fbbf24;
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
        }
        .shadow-neon-button {
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2);
        }
        .cyber-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
        }
      `}</style>

      {/* Cinematic Cyberpunk Animated Background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.03),transparent_50%)] pointer-events-none z-0" />

      {/* 1. Global Header (Navbar) */}
      <nav className="fixed w-full z-[100] top-0 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-950/70 backdrop-blur-2xl border border-white/10 rounded-3xl h-20 px-6 md:px-10 flex items-center justify-between shadow-2xl shadow-cyan-500/5">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10 hover:border-cyan-400 group cursor-pointer transition-all">
                <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-lg font-black tracking-tight text-white leading-tight">
                  فحص السكك الحديدية <span className="text-cyan-400">بالذكاء الاصطناعي</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">
                  الأول وطنيًا لتأمين وهندسة خطوط السكك الحديدية
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-xs font-bold tracking-wide text-slate-400 hover:text-cyan-400 transition-colors uppercase py-2"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Login Dropdown */}
            <div className="hidden lg:flex">
              <LoginDropdown onManualLoginClick={onLoginClick} />
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-28 left-6 right-6 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 z-[110] shadow-2xl"
            >
              <div className="flex flex-col gap-6 text-right">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-sm font-bold text-slate-300 hover:text-cyan-400 transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="h-px bg-white/5 my-2" />
                <div className="w-full flex justify-end">
                  <LoginDropdown onManualLoginClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 px-6 md:px-12 items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Hero text metadata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="inline-flex self-start items-center gap-3 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-[11px] font-black tracking-wider text-cyan-400 uppercase">
                تقنيات الرؤية الحاسوبية والذكاء الاصطناعي السيادي لمصر
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
              مستقبل أمان <br />
              <span className="bg-gradient-to-l from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                السكك الحديدية
              </span>
            </h1>

            <p className="text-slate-400 text-base md:text-lg mb-10 max-w-2xl leading-relaxed text-right">
              فحص ذاتي للمسارات واكتشاف لحظي للعيوب باستخدام طائرات الدرون وخوارزميات الرؤية الحاسوبية المتقدمة لضمان أقصى درجات الأمان.
            </p>

            <div className="flex flex-wrap gap-5">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="bg-cyan-500 text-slate-950 px-10 py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg hover:bg-cyan-400 cursor-pointer"
              >
                جرب النظام الآن
              </motion.button>
              
              <a href="#tech">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white/15 text-white px-10 py-4 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer"
                >
                  كيف نعمل
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Large Highly Styled visual Drone Flight over Rails */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center w-full"
          >
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] bg-slate-950/60 border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent z-10" />
              
              {/* Cinematic Unsplash background showing a railway track receding into the distance */}
              <img 
                src="https://images.unsplash.com/photo-1541427468141-a95715e7142c?q=80&w=2070&auto=format&fit=crop" 
                alt="مسارات سكك حديدية ممتدة بالفحص والمسح" 
                className="w-full h-full object-cover opacity-40 select-none group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />

              {/* Animated scanning cone from the drone to the tracks */}
              <div 
                className="absolute left-1/2 bottom-0 w-[80%] h-[75%] -translate-x-1/2 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, rgba(6, 182, 212, 0.15), transparent)',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }}
              />

              {/* Holographic Target Overlays and Computer Vision Overlays */}
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                {/* Active scan radar waves radiating over tracks */}
                <div className="absolute bottom-[20%] left-[20%] right-[20%] h-0.5 bg-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse" />
                
                {/* Dynamic Computer Vision Bounding Box highlighting a visible crack on railway tracks */}
                <div className="absolute bottom-[16%] left-[30%] w-40 h-20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-amber-500/10 animate-pulse flex flex-col justify-between p-1">
                  <div className="flex items-center justify-between text-amber-400 font-sans text-[8px] font-bold">
                    <span>CRACK DETECTED</span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  </div>
                  {/* Futuristic warning readout requested: 'DEFECT DETECTED: 96% ACCURACY' */}
                  <div className="bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded leading-none text-center">
                    DEFECT DETECTED: 96% ACCURACY
                  </div>
                </div>

                {/* Handcrafted Interactive SVG Drone (Specialized industrial hexacopter with visible APM motherboard) */}
                <motion.div 
                  className="absolute top-[8%] left-1/2 -translate-x-1/2 w-72 h-36 flex flex-col items-center justify-center z-30"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <svg viewBox="0 0 300 150" className="w-full h-full filter drop-shadow-[0_15px_25px_rgba(6,182,212,0.35)]">
                    {/* Glowing landing light */}
                    <circle cx="150" cy="115" r="4" fill="#06b6d4" className="animate-ping" />
                    <circle cx="150" cy="115" r="2.5" fill="#22d3ee" />
                    
                    {/* Camera gimbal assembly (Vision components) */}
                    <rect x="140" y="90" width="20" height="25" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <circle cx="150" cy="105" r="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                    <circle cx="151" cy="104" r="2" fill="#ef4444" /> {/* Lens element */}
                    
                    {/* Hexacopter Main Frame Structure */}
                    <path d="M 110,80 L 190,80 L 180,95 L 120,95 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                    
                    {/* Visible flight controller APM 2.8 Component on top of the drone */}
                    <rect x="130" y="65" width="40" height="15" rx="2" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
                    <text x="150" y="76" fill="#06b6d4" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">APM 2.8</text>
                    <circle cx="135" cy="72" r="1.5" fill="#ef4444" className="animate-pulse" /> {/* blinks red */}
                    <circle cx="165" cy="72" r="1.5" fill="#10b981" className="animate-pulse" /> {/* blinks green */}

                    {/* Left arms and motors */}
                    <line x1="110" y1="80" x2="35" y2="45" stroke="#334155" strokeWidth="4.5" />
                    <line x1="115" y1="85" x2="45" y2="75" stroke="#1e293b" strokeWidth="3" />
                    <line x1="110" y1="88" x2="60" y2="105" stroke="#1e293b" strokeWidth="3" />

                    {/* Right arms and motors */}
                    <line x1="190" y1="80" x2="265" y2="45" stroke="#334155" strokeWidth="4.5" />
                    <line x1="185" y1="85" x2="255" y2="75" stroke="#1e293b" strokeWidth="3" />
                    <line x1="190" y1="88" x2="240" y2="105" stroke="#1e293b" strokeWidth="3" />

                    {/* Motors and active rotating propeller indicators */}
                    <rect x="25" y="38" width="20" height="8" rx="1.5" fill="#64748b" />
                    <rect x="255" y="38" width="20" height="8" rx="1.5" fill="#64748b" />
                    
                    <rect x="35" y="68" width="20" height="8" rx="1.5" fill="#64748b" />
                    <rect x="245" y="68" width="20" height="8" rx="1.5" fill="#64748b" />

                    <rect x="50" y="98" width="20" height="8" rx="1.5" fill="#64748b" />
                    <rect x="230" y="98" width="20" height="8" rx="1.5" fill="#64748b" />

                    {/* Rotating Propellers effect (ellipses animating opacity or rotation) */}
                    <ellipse cx="35" cy="35" rx="30" ry="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" />
                    <ellipse cx="265" cy="35" rx="30" ry="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" />

                    <ellipse cx="45" cy="65" rx="28" ry="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <ellipse cx="255" cy="65" rx="28" ry="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

                    <ellipse cx="60" cy="95" rx="26" ry="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <ellipse cx="240" cy="95" rx="26" ry="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

                    {/* Navigation glowing lights */}
                    <circle cx="35" cy="42" r="3" fill="#10b981" className="animate-pulse" /> {/* green left light */}
                    <circle cx="265" cy="42" r="3" fill="#ef4444" className="animate-pulse" /> {/* red right light */}
                  </svg>
                </motion.div>

                {/* HUD Corners */}
                <span className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <span className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <span className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <span className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              </div>

              {/* Status HUD Block Inside Banner */}
              <div className="absolute bottom-6 right-6 left-6 z-20 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-1">طائرة المسح الذكي</h4>
                  <p className="text-xs font-bold text-slate-300">طيران مستقر ذاتي التوجيه</p>
                </div>
                <div className="text-left font-mono">
                  <p className="text-neon-emerald text-sm font-black flex items-center gap-1.5 justify-end">
                    <span>نشط</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">APM 2.8</p>
                </div>
              </div>
            </div>

            {/* Glowing Orb */}
            <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* About Us (من نحن) Section */}
      <section id="about" className="py-28 px-6 md:px-12 border-t border-white/5 relative bg-slate-950">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column - Right in standard layout but left in RTL */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-6 relative order-2 lg:order-1"
            >
              <div className="relative w-full aspect-[4/3] rounded-[2rem] bg-slate-950/40 border border-white/10 overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                <img 
                  src="/AI Rail Inspector logo2-1.png" 
                  alt="فريق الابتكار والهندسة" 
                  className="w-full h-full object-cover opacity-80 select-none group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />

                {/* Computational Node Overlays */}
                <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-cyan-400">RAIL_LAB_ACTIVE</span>
                    </div>
                    <div className="text-left font-mono text-[9px] text-slate-500">
                      SYS_THREAD: #092F
                    </div>
                  </div>

                  {/* Graph visualization */}
                  <div className="my-auto opacity-85 flex justify-center items-center h-28 relative">
                    {/* Pulsing focal radar */}
                    <div className="w-16 h-16 border-2 border-cyan-400/40 rounded-full animate-ping pulse absolute" />
                    <div className="w-24 h-24 border border-dashed border-cyan-500/20 rounded-full animate-spin [animation-duration:10s]" />
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 100">
                      {/* Interconnected points */}
                      <circle cx="40" cy="30" r="3" fill="#06b6d4" className="animate-pulse" />
                      <circle cx="100" cy="50" r="5" fill="#f59e0b" className="animate-pulse" />
                      <circle cx="160" cy="70" r="3" fill="#10b981" />
                      <circle cx="70" cy="80" r="4" fill="#06b6d4" />
                      <circle cx="130" cy="20" r="4" fill="#06b6d4" />

                      <line x1="40" y1="30" x2="100" y2="50" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
                      <line x1="100" y1="50" x2="160" y2="70" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />
                      <line x1="70" y1="80" x2="100" y2="50" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                      <line x1="130" y1="20" x2="100" y2="50" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-3 border-t border-white/5">
                    <span>COOPERATION INDEX: 1.0</span>
                    <span>ALGORITHMS: DEPLOYED</span>
                  </div>
                </div>

                {/* HUD Borders */}
                <span className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <span className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <span className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <span className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </motion.div>

            {/* Text Column - Left in standard layout, Right in RTL */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-right"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">من نحن؟ قصتنا وتطلعاتنا</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                من نحن؟
              </h2>
              <div className="w-20 h-1 bg-cyan-500 rounded-full" />

              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-semibold">
                نحن نخبة من مطوري ومهندسي تكنولوجيا السكك الحديدية والنقل الحديث بجامعة برج العرب التكنولوجية. يجمعنا شغف واحد: إحداث ثورة في قطاع النقل من خلال دمج الذكاء الاصطناعي مع تكنولوجيا الطيران المسير. حياتنا تتمحور حول الابتكار المستمر والتطوير التقني لنصل إلى حلول هندسية غير مسبوقة تضع بصمتنا في المستقبل.
              </p>

              {/* Multi-badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/5 font- Cairo">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-black mb-1">الجهة العلمية والأكاديمية</p>
                  <p className="text-xs text-white font-extrabold leading-tight">جامعة برج العرب التكنولوجية</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-black mb-1">تخصص البرنامج الميداني</p>
                  <p className="text-xs text-white font-extrabold leading-tight">تكنولوجيا سكك الحديدية والنقل الحديث</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Our Impact & Vision (رسالتنا وأثرنا في المجتمع) Section */}
      <section id="impact" className="py-28 px-6 md:px-12 border-t border-white/5 relative bg-slate-950/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">دورنا وأثرنا في الصناعة</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              رؤية وطنية شاملة تدمج الحماية الفائقة بالتميز الاقتصادي وسرعة تبني التكنولوجيا الحديثة لدعم سلامة المواطنين.
            </p>
          </div>

          {/* Grid Layout of 3 Glowing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Shield */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/10 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">حماية الأرواح</h3>
                <p className="text-[11px] font-bold text-amber-500/80 mb-4 uppercase tracking-wider">منع الحوادث قبل وقوعها</p>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  دورنا الأساسي هو منع الحوادث قبل وقوعها من خلال الاكتشاف المبكر والدقيق للعيوب والمخاطر، مما يضمن رحلات آمنة تمامًا لملايين المسافرين والمواطنين يومياً.
                </p>
              </div>
              <div className="pt-6 border-t border-white/5 mt-8 flex items-center gap-2 text-amber-500 text-[10px] font-black tracking-widest uppercase">
                <span>معايير الأمان القصوى</span>
              </div>
            </motion.div>

            {/* Card 2 - Economy / Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">دعم الاقتصاد الوطني</h3>
                <p className="text-[11px] font-bold text-emerald-500/80 mb-4 uppercase tracking-wider">الكفاءة التشغيلية المتقدمة</p>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  تقليل وفورات تكاليف الصيانة الدورية الطارئة والباهظة والتحول للصيانة الوقائية الذكية، وتقليل فترات تعطل خطوط نقل الركاب والبضائع والقطارات، مما ينعكس بشكل إيجابي وعميق على الاقتصاد المصري.
                </p>
              </div>
              <div className="pt-6 border-t border-white/5 mt-8 flex items-center gap-2 text-emerald-500 text-[10px] font-black tracking-widest uppercase">
                <span>تخفيض التكاليف التشغيلية</span>
              </div>
            </motion.div>

            {/* Card 3 - Future / Globe */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/10 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">توطين التكنولوجيا</h3>
                <p className="text-[11px] font-bold text-cyan-400/80 mb-4 uppercase tracking-wider">رؤية وطنية بأبعاد عالمية</p>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  نستهدف بناء وتطوير منظومة قياس وفحص مصرية وطنية خالصة ومستقلة، تنافس المعايير والأنظمة العالمية في السلامة وعمليات المسح والمراقبة المؤتمتة بالكامل.
                </p>
              </div>
              <div className="pt-6 border-t border-white/5 mt-8 flex items-center gap-2 text-neon-cyan text-[10px] font-black tracking-widest uppercase">
                <span>سيادة هندسية وطنية</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Tech Specs Section (Bento Grid Layout) */}
      <section id="tech" className="py-28 px-6 md:px-12 border-t border-white/5 relative bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">البنية التقنية للنظام</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              تكامل عتادي وبرمجي شامل لتوفير رصد عالي الدقة وسرعة لا مثيل لها في تحديد عيوب مسارات القطارات.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 - APM 2.8 Autopilot */}
            <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Plane className="w-7 h-7 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">APM 2.8 PRO</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  الطيران الذاتي (APM 2.8)
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                  توجيه دقيق للدرون فوق مسارات القطارات لتغطية شاملة ومستقرة.
                </p>

                {/* High tech flight visual overlay representing flight controller components & stable flight */}
                <div className="relative w-full h-36 rounded-2xl bg-slate-950 border border-white/5 overflow-hidden flex flex-col justify-between p-3 font-mono">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  
                  {/* Stabilization lines and drone angle indicators */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                    <div className="w-20 h-20 border border-dashed border-cyan-500/30 rounded-full animate-spin [animation-duration:12s]" />
                    <div className="absolute w-28 h-px bg-cyan-500/20" />
                    <div className="absolute h-28 w-px bg-cyan-500/20" />
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-cyan-400 relative z-10">
                    <span>ROLL: +2.15°</span>
                    <span className="text-emerald-400 tracking-widest animate-pulse">● STABLE AUTOFLIGHT</span>
                    <span>PITCH: -0.42°</span>
                  </div>

                  {/* Flight trajectory vector along a railway line simulation graphic */}
                  <div className="relative h-14 w-full flex items-center justify-center my-2">
                    <svg viewBox="0 0 200 60" className="w-full h-full">
                      {/* Rail lines receding */}
                      <line x1="100" y1="5" x2="30" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      <line x1="100" y1="5" x2="170" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      {/* Sleepers */}
                      <line x1="86" y1="15" x2="114" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="72" y1="25" x2="128" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="58" y1="35" x2="142" y2="35" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                      <line x1="44" y1="45" x2="156" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                      {/* Flight path vector line green */}
                      <path d="M 100,5 Q 105,25 100,48" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3,3" className="animate-pulse" />
                      {/* Mini drone indicator */}
                      <circle cx="100" cy="5" r="3" fill="#06b6d4" />
                      <line x1="88" y1="5" x2="112" y2="5" stroke="#06b6d4" strokeWidth="1" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 relative z-10">
                    <span>ALTITUDE: 15.2M</span>
                    <span>HDOP: 0.96</span>
                    <span>SATELLITES: 18</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-neon-cyan text-[11px] font-black tracking-widest uppercase">
                <span>تكنولوجيا الملاحة التلقائية (APM 2.8)</span>
              </div>
            </div>

            {/* Card 2 - YOLOv8 AI Model */}
            <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">YOLOv8 NANO</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  الذكاء الاصطناعي (YOLOv8)
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                  تحليل الفيديو واكتشاف الشروخ والعيوب في أجزاء من الثانية (Edge AI).
                </p>

                {/* AI Vision Close up cracked rail section with glowing warning overlay */}
                <div className="relative w-full h-36 rounded-2xl border border-white/5 overflow-hidden group/item">
                  <img 
                    src="https://images.unsplash.com/photo-1541427468141-a95715e7142c?q=80&w=400&auto=format&fit=crop" 
                    alt="صورة مقربة لعيوب سكك حديدية" 
                    className="w-full h-full object-cover opacity-60 filter saturate-50 brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/20" />
                  
                  {/* Bounding Box overlay */}
                  <div className="absolute inset-0 p-3 font-mono flex flex-col justify-between">
                    {/* Bounding box marker in yellow/amber */}
                    <div className="absolute top-[25%] left-[20%] w-[55%] h-[50%] border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-amber-500/5 animate-pulse">
                      {/* Info overlay inside card */}
                      <div className="absolute -top-5 right-0 bg-amber-500 text-slate-950 text-[7px] font-black px-1 py-0.5 rounded flex items-center gap-1">
                        <span>شق عرضي | شديد الخطورة</span>
                        <span>96.4%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-amber-400 z-10 w-full">
                      <span>YOLOv8 INFERENCE LOG</span>
                      <span>INFERENCE: 8.2ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-slate-400 z-10 mt-auto">
                      <span>X: 31.0409 | Y: 31.3785</span>
                      <span className="text-red-400 font-extrabold animate-pulse">DANGER CODE: SF-40</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-neon-amber text-[11px] font-black tracking-widest uppercase">
                <span>المعالجة الطرفية اللحظية (Edge AI)</span>
              </div>
            </div>

            {/* Card 3 - FPV Transmission */}
            <div className="lg:col-span-1 md:col-span-2 p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Radio className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">5.8 GHZ DIGITAL</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  البث اللحظي (FPV)
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                  نقل حي ومباشر للبيانات والصور إلى لوحة تحكم مهندس الصيانة بلا تأخير.
                </p>

                {/* Operator handheld monitor graphic showing live stream tracks receding point */}
                <div className="relative w-full h-36 rounded-2xl bg-black border border-white/10 overflow-hidden p-2 flex flex-col justify-between group/fpv">
                  <img 
                    src="https://images.unsplash.com/photo-1474487022132-71954f24da08?q=80&w=400&auto=format&fit=crop" 
                    alt="صوت وصورة بث مباشر" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 filer brightness-90 saturate-75"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Scan line effect */}
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400/20 top-1/3 animate-scan-fast pointer-events-none" />

                  {/* FPV HUD overlays */}
                  <div className="flex items-start justify-between text-[8px] font-mono text-emerald-400 relative z-10">
                    <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span>LIVE FEED</span>
                    </div>
                    <div className="text-right bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/20 flex flex-col">
                      <span>FPV 5.8G: EXCELLENT</span>
                      <span>RSSI: -45dBm</span>
                    </div>
                  </div>

                  {/* Horizontal visual alignment grids */}
                  <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-white/20 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-white/20 pointer-events-none" />

                  <div className="flex items-end justify-between text-[8px] font-mono text-slate-300 relative z-10 bg-gradient-to-t from-black/85 to-transparent p-1.5 rounded-b-xl">
                    <span>FPS: 60.0</span>
                    <span>LATENCY: 12ms</span>
                    <span>REC ● 00:14:52</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-neon-emerald text-[11px] font-black tracking-widest uppercase">
                <span>اتصال لاسلكي غير منقطع (FPV)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Command Center Dashboard Mockup Preview */}
      <section id="portal" className="py-28 px-6 md:px-12 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">بوابة الفحص والمراقبة</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              محاكاة كاملة ومباشرة للوحة القيادة ومسار الفحص الذاتي مع تحديد وتتبع المتغيرات الفيزيائية والحيوية للدرون في الوقت الحقيقي.
            </p>
          </div>

          {/* Hyper-gorgeous, comprehensive cockpit and UI dashboard mockup */}
          <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-4 md:p-8 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
            
            {/* Upper Bar: Simulated Host Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <p className="text-xs font-black tracking-widest uppercase text-slate-300">
                  لوحة تحكم الفحص المركزي الموحد - البث المباشر
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-slate-950 rounded-xl border border-white/5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-mono font-bold text-slate-400">FPS: 60</span>
                </div>
                <div className="px-4 py-1.5 bg-slate-950 rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold text-emerald-400">آمن ومشفر بالكامل</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Workspace Area Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              
              {/* CENTRAL VIDEO SCREEN: 7 COLS */}
              <div className="lg:col-span-8 bg-black/90 rounded-[2rem] border border-white/10 overflow-hidden relative aspect-video flex items-center justify-center">
                {/* Horizontal gridlines */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/25 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/25 pointer-events-none" />
                
                <img 
                  src="https://images.unsplash.com/photo-1541427468141-a95715e7142c?q=80&w=2070&auto=format&fit=crop" 
                  alt="فحص مباشر بالذكاء الاصطناعي - البث المباشر" 
                  className="w-full h-full object-cover opacity-50 absolute inset-0 pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                {/* Animated Scan Line effect */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-bounce pointer-events-none z-10" />

                {/* Simulated Amber Bounding Boxes highlighting cracks and missing bolts as requested */}
                <div className="absolute top-[28%] right-[32%] w-36 h-24 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] bg-amber-500/5 z-10">
                  <div className="absolute -top-6 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded tracking-wide">
                    شق عرضي مرصود (96.4%)
                  </div>
                </div>

                <div className="absolute bottom-[35%] left-[28%] w-48 h-20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] bg-amber-500/5 z-10">
                  <div className="absolute -top-6 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded tracking-wide">
                    برغي مفقود (94.2%)
                  </div>
                </div>

                {/* Corner Markers & Reticle HUD */}
                <div className="absolute top-6 left-6 text-cyan-400 font-sans text-[10px] font-bold tracking-widest z-20 bg-black/60 px-3 py-1 rounded border border-white/5">
                  البث المباشر
                </div>
                <div className="absolute bottom-6 left-6 text-red-500 font-mono text-[9px] tracking-widest z-20 animate-pulse bg-black/60 px-2 py-1 rounded">
                  رصد تلقائي نشط
                </div>
                <div className="absolute top-6 right-6 text-slate-400 text-[10px] font-medium z-20 bg-black/60 px-2 py-1 rounded">
                  كود المسح: ٣١٠-أكس
                </div>

                {/* Simulated Target Scope */}
                <div className="absolute w-12 h-12 border-2 border-dashed border-cyan-400/60 rounded-full scale-125 z-20 pointer-events-none" />
              </div>

              {/* SIDE PANELS: TELEMETRY & DEFECTS LIST (4 COLS) */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-6">
                
                {/* Drone Telemetry Stats / "بيانات الطيران اللحظية" (الارتفاع: 15 متر, السرعة: 20 كم/س, البطارية: 82%, إحداثيات: متاح) */}
                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 space-y-5">
                  <h4 className="text-sm font-black text-cyan-400 tracking-wider mb-1">
                    بيانات الطيران اللحظية
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3.5">
                    {/* Alt */}
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[11px] text-slate-400 font-black">الارتفاع:</p>
                      <p className="text-xs font-mono font-black text-white">١٥ متر (15.2m)</p>
                    </div>

                    {/* Speed */}
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[11px] text-slate-400 font-black">السرعة:</p>
                      <p className="text-xs font-mono font-black text-white">٢٠ كم/س (20.4 km/h)</p>
                    </div>

                    {/* Battery */}
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[11px] text-slate-400 font-black">البطارية:</p>
                      <p className="text-xs font-mono font-black text-neon-cyan">٨٢٪ (82%)</p>
                    </div>

                    {/* Coordinates */}
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[11px] text-slate-400 font-black">الإحداثيات:</p>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-black">
                        متاح (31.04, 31.37)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Defects Table Mockup: "سجل الأعطال" (نوع العيب: شق عرضي | الدقة: 96% | الإحداثيات: متاح) */}
                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-red-400 tracking-wider mb-4">
                      سجل الأعطال
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col p-3 bg-red-950/10 border border-red-500/15 rounded-xl gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-200">النوع: شق عرضي</span>
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] font-black">
                            الدقة: ٩٦٪ (96%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                          <span>الإحداثيات: متاح</span>
                          <span>المنطقة أ-٢ (Zone A2)</span>
                        </div>
                      </div>

                      <div className="flex flex-col p-3 bg-red-950/5 border border-white/5 rounded-xl gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-300">النوع: برغي مفقود</span>
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[9px] font-black">
                            الدقة: ٩٤٪ (94%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                          <span>الإحداثيات: متاح</span>
                          <span>المنطقة ب-٩ (Zone B9)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Action */}
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <button 
                      onClick={onLoginClick}
                      className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer text-center block"
                    >
                      عرض التفاصيل الكاملة بالخريطة
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. Awards & Impact (Timeline/Cards) */}
      <section id="awards" className="py-28 px-6 md:px-12 bg-slate-950 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">إنجازاتنا ومشاركاتنا الوطنية</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              مسيرة مكللة بالتميز التقني فخراً بالرؤية الوطنية والابتكار الهندسي المصرى في قلب المحافل والبطولات الرسمية.
            </p>
          </div>

          {/* Clean timeline representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {competitions.map((comp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:border-cyan-500/40 transition-all flex flex-col md:flex-row gap-6 md:gap-8 items-start relative group"
              >
                {/* Glowing subtle hover layer */}
                <div className="absolute inset-0 bg-cyan-500/2 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-cyan-500/30 group-hover:scale-105 transition-all text-cyan-400">
                  {comp.icon}
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                      {comp.status}
                    </span>
                    <span className="text-xs font-mono font-black text-slate-500">
                      {comp.tag}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-white leading-snug">
                    {comp.title}
                  </h4>
                  {comp.college && (
                    <p className="text-xs font-black text-cyan-500 bg-cyan-500/5 border border-cyan-500/10 px-2 py-1 rounded self-start inline-block">
                      الجهة الداعمة: {comp.college}
                    </p>
                  )}
                  <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                    {comp.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Statistics Display - Impact Metrics (Accuracies Achieved, Kilometers Covered etc.) */}
          <div className="pt-12 border-t border-white/5">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">أرقام وتأثير المنظومة</h3>
              <p className="text-slate-500 text-xs md:text-sm font-semibold">مؤشرات الجودة ومستويات الأداء المحققة ميدانياً وتشغيلياً</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="p-6 bg-slate-900/30 border border-white/5 rounded-2xl text-center relative group overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
                <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-wide">مستوى الدقة الجغرافي والنوعي</p>
                <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-2">96.4%</p>
                <p className="text-xs text-slate-400 font-bold">دقة خوارزمية YOLOv8 في رصد الكسور والشروخ بالزمن الحقيقي</p>
              </div>

              {/* Stat 2 */}
              <div className="p-6 bg-slate-900/30 border border-white/5 rounded-2xl text-center relative group overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
                <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-wide">الوزن الكلي والقطع العتادية</p>
                <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-2">١.٨ كجم</p>
                <p className="text-xs text-slate-400 font-bold">وزن طائرة هكسابلاي متكاملة بالصدم والوقاية الشاملة</p>
              </div>

              {/* Stat 3 */}
              <div className="p-6 bg-slate-900/30 border border-white/5 rounded-2xl text-center relative group overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
                <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-wide">المسارات المتوقع تغطيتها</p>
                <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-2">١,٢٥٠ كم</p>
                <p className="text-xs text-slate-400 font-bold">إجمالي كيلومترات مسارات خطوط السكك ممسوحة ومراقبة</p>
              </div>

              {/* Stat 4 */}
              <div className="p-6 bg-slate-900/30 border border-white/5 rounded-2xl text-center relative group overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
                <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-wide">زمن الاستجابة والاستنتاج</p>
                <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-2">٨.٢ مللي ثانية</p>
                <p className="text-xs text-slate-400 font-bold">زمن معالجة وفحص كل إطار فيديو على حافة النظام دون تأخير</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Honors & Media Gallery Section (معرض الصور والتكريمات) */}
      <section id="gallery" className="py-28 px-6 md:px-12 bg-slate-950 border-t border-white/5 relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Title */}
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full mb-4 inline-block">
              معرض التميز والابتكار العالي
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">لحظات التتويج والتكريم</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              شاهد كواليس الابتكار ولحظات تسليم الدروع وحصد المراكز الأولى في المسابقات والمحافل الهندسية الوطنية.
            </p>
          </div>

          {/* Grid Layout: Video Left/Main, and Images Right/Subgrid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: Prominent 16:9 Official Video Player Placeholder (6 of 12 columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div 
                onClick={() => {
                  setSelectedMedia(mediaGallery[0]);
                  setIsPlayingVideo(true);
                }}
                className="group relative aspect-[16/9] w-full rounded-[2.5rem] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl cursor-pointer hover:border-cyan-500/40 transition-all duration-500"
              >
                {/* Image background with blur backdrop */}
                <img 
                  src={mediaGallery[0].src} 
                  alt={mediaGallery[0].title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 select-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Tech scan grid overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start z-20">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 bg-slate-950/80 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    {mediaGallery[0].category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/5">
                    {mediaGallery[0].duration}
                  </span>
                </div>

                {/* Center glowing Play button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative">
                    {/* Glowing outer rings */}
                    <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 group-hover:scale-110 transition-all duration-500 animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button className="relative w-16 h-16 bg-slate-950 border border-white/20 hover:border-cyan-400 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 active:scale-95 transition-all duration-300">
                      <Play className="w-6 h-6 fill-white text-white ml-1 animate-pulse" />
                    </button>
                  </div>
                </div>

                {/* Footer panel overlay for title */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {mediaGallery[0].title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">
                    {mediaGallery[0].description}
                  </p>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl flex items-center justify-between text-xs md:text-sm font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-500 animate-pulse" />
                  <span>انقر لمشاهدة فيديو التكريم الرسمي (30 ثانية) بالكامل بدقة عالية</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-500 uppercase font-black bg-cyan-500/5 px-2.5 py-1 rounded border border-cyan-500/20">
                  DOCUMENTARY HD
                </span>
              </div>
            </div>

            {/* COLUMN 2: Photo Galleries - Dynamic Bento Grid (5 of 12 columns) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {mediaGallery.slice(1).map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className={`group relative rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all duration-500 bg-slate-900 ${
                    index === 0 ? "col-span-2 aspect-[2/1] md:aspect-[2.4/1]" : "aspect-[1.2/1]"
                  }`}
                >
                  {/* Image render */}
                  <img 
                    src={item.src} 
                    alt={item.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 select-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* Shading gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                  {/* Content label */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 z-20">
                    <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full inline-block mb-1.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs md:text-sm font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </div>

                  {/* Subtle expand icon overlay */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="w-7 h-7 bg-slate-950/80 border border-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-400 backdrop-blur-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* --- LIGHTBOX MODAL DIALOG WITH ANIMATEPRESENCE (Full Screen & Simulated Playback) --- */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl"
            >
              <div className="absolute inset-0 cursor-pointer" onClick={() => {
                setSelectedMedia(null);
                setIsPlayingVideo(false);
              }} />

              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative z-10 shadow-3xl"
              >
                {/* Upper bar */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 px-3 py-1 rounded-full">
                      {selectedMedia.category}
                    </span>
                    <h3 className="text-sm md:text-base font-black text-white">
                      {selectedMedia.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedMedia(null);
                      setIsPlayingVideo(false);
                    }}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 hover:border-white/20 transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Media Body Container */}
                <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center aspect-[16/10] md:max-h-[60vh]">
                  {selectedMedia.type === 'video' ? (
                    /* SIMULATED ADVANCED HIGH-TECH PLAYBACK VIEW */
                    <div className="relative w-full h-full flex flex-col justify-between p-6">
                      
                      {/* Video source placeholder backdrops with simulated motion blur */}
                      <img 
                        src="/AI Rail Inspector logo2-1.png"
                        alt="Video backdrop" 
                        className={`absolute inset-0 w-full h-full object-cover select-none transition-all duration-1000 ${
                          isPlayingVideo ? "opacity-35 scale-102 blur-[2px]" : "opacity-70 blur-none"
                        }`}
                        referrerPolicy="no-referrer"
                      />

                      {/* Sci-fi HUD scans */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-white/10" />
                        ))}
                      </div>
                      
                      {/* Live feedback watermark */}
                      <div className="flex justify-between items-start text-[9px] font-mono text-cyan-400/85 z-10">
                        <div className="flex items-center gap-1.5 bg-black/85 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingVideo ? "bg-red-500 animate-pulse" : "bg-slate-500"}`} />
                          <span>{isPlayingVideo ? "PLAYING [SIMULATED]" : "PAUSED"}</span>
                        </div>
                        <div className="text-right bg-black/85 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                          <span>30 SEC CUT - AWARDS</span>
                        </div>
                      </div>

                      {/* Soundwave Animation during simulated play */}
                      <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none z-10">
                        {isPlayingVideo ? (
                          <div className="flex items-end gap-1.5 h-16">
                            {[0.7, 0.4, 0.9, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.3, 0.8].map((val, i) => (
                              <motion.div 
                                key={i}
                                animate={{ height: [12, val * 64, 12] }}
                                transition={{ repeat: Infinity, duration: 0.8 + (i * 0.05), ease: "easeInOut" }}
                                className="w-1 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-cyan-500/25 flex items-center justify-center border border-cyan-500/40 pointer-events-auto cursor-pointer focus:outline-none" onClick={() => setIsPlayingVideo(true)}>
                            <Play className="w-6 h-6 fill-cyan-400 text-cyan-400 ml-1" />
                          </div>
                        )}
                      </div>

                      {/* Custom Simulated Media Controls bar */}
                      <div className="w-full bg-black/90 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 relative z-10 mt-auto">
                        {/* Progress Bar with glow slider */}
                        <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>

                        {/* Controls items */}
                        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => {
                                setIsPlayingVideo(!isPlayingVideo);
                                if (!isPlayingVideo && videoProgress >= 100) setVideoProgress(0);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95 transition-all text-[11px] font-black"
                            >
                              {isPlayingVideo ? "إيقاف مؤقت ⏸" : "تـشــغـيـل ▶"}
                            </button>
                            <span className="font-mono text-slate-400">
                              00:{videoProgress < 10 ? `0${Math.floor(videoProgress * 0.3)}` : Math.floor(videoProgress * 0.3)} / 00:30
                            </span>
                          </div>

                          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                            HONORS MEDIA HUB
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* DETAILED HIGH RESOLUTION IMAGE PREVIEW */
                    <img 
                      src={selectedMedia.src} 
                      alt={selectedMedia.title} 
                      className="w-full h-full object-contain max-h-[60vh] select-none"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Downward description footer panel */}
                <div className="p-6 md:p-8 bg-slate-900 border-t border-white/5 space-y-2">
                  <h4 className="text-lg md:text-xl font-black text-white">
                    {selectedMedia.title}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-semibold">
                    {selectedMedia.description}
                  </p>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 6. Leadership & Team (Hierarchical Grid) */}
      <section id="team" className="py-28 px-6 md:px-12 bg-slate-950 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section banner */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">القيادة وفريق العمل</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              خلف كفاءة هذه التقنية المتطورة رؤية مؤسسية قوية وإشراف أكاديمي موجه، تترجمه سواعد مهندسي الغد.
            </p>
          </div>

          {/* Sub-section 1: Sponsors and Academics */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
                الرعاية المؤسسية والإشراف
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadership.map((lead, i) => {
                const imgUri = getMemberImage(lead.name);
                const details = getMemberDetails(lead.name, lead.role);
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedMember({
                      name: lead.name,
                      role: lead.role,
                      age: details.age,
                      desc: details.desc,
                      image: imgUri
                    })}
                    className="p-8 bg-slate-900/30 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col items-center text-center group transition-all hover:border-cyan-500/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98] duration-300"
                  >
                    <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.05)] group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                      <img 
                        src={imgUri} 
                        alt={lead.name} 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.name)}`;
                        }}
                      />
                    </div>
                    
                    <h4 className="text-xl font-black text-white mb-1.5 group-hover:text-neon-cyan transition-colors">
                      {lead.name}
                    </h4>
                    <p className="text-xs font-black text-cyan-500 tracking-wider uppercase mb-4 italic">
                      {lead.role}
                    </p>
                    
                    <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs">
                      {lead.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-section 2: Engineering & Operational Core Team */}
          <div>
            <div className="text-center mb-12">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                فريق وخبراء التطوير والعمليات
              </span>
              <p className="text-xs text-slate-500 mt-3 font-semibold">
                عقد هندسي متكامل يضم ١٦ من نوابغ الهندسة والتطوير (اضغط لعرض التفاصيل)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {coreTeam.map((member, i) => {
                const imgUri = getMemberImage(member.name);
                const details = getMemberDetails(member.name, member.role);
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedMember({
                      name: member.name,
                      role: member.role,
                      age: details.age,
                      desc: details.desc,
                      image: imgUri
                    })}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-center hover:bg-white/[0.04] hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 group flex flex-col items-center justify-between cursor-pointer hover:scale-[1.05] active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 border border-white/5 group-hover:border-cyan-500/30 group-hover:scale-105 transition-all duration-300">
                      <img 
                        src={imgUri} 
                        alt={member.name} 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                        }}
                      />
                    </div>
                    <h5 className="text-[11px] md:text-xs font-black text-white leading-tight mb-2 truncate max-w-full">
                      {member.name}
                    </h5>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {member.role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Global Teams Details Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] text-right"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header view */}
                <div className="relative p-8 pb-4 flex flex-col items-center border-b border-white/5 bg-slate-900/40">
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-lg"
                    aria-label="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <img 
                      src={selectedMember.image} 
                      alt={selectedMember.name} 
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name)}`;
                      }}
                    />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                    {selectedMember.name}
                  </h3>
                  <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black tracking-wide uppercase">
                    {selectedMember.role}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-8 space-y-6">
                  <div className={selectedMember.age !== null ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                    {selectedMember.age !== null && (
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">السن</span>
                        <span className="text-lg font-black text-white">{selectedMember.age} عاماً</span>
                      </div>
                    )}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">الصفة بالفريق</span>
                      <span className="text-xs font-black text-cyan-400">
                        {selectedMember.name.startsWith("أ.د.") 
                          ? "الإشراف والتوجيه الأكاديمي" 
                          : selectedMember.name.trim() === "م. روشان" 
                            ? "معيدة وميسرة مخرجات المشروع" 
                            : "عضو أساسي نشط"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">تفاصيل الدور والمسؤوليات:</h4>
                    <p className="text-sm text-slate-350 font-semibold leading-relaxed bg-white/[0.01] p-4 border border-white/5 rounded-2xl">
                      {selectedMember.desc}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5 text-[9px] font-bold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      مؤمن بالكامل بالبصمة البيومترية
                    </span>
                    <span>PROJECT_ID_A2H</span>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 7. Footer */}
      <footer className="py-20 px-6 bg-slate-950 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base font-black text-white">فحص السكك الحديدية بالذكاء الاصطناعي</span>
              <span className="text-[9px] text-slate-600 mt-0.5">ثورة ذكية لخدمة أمان الطرق البرية والمحاور</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-[11px] font-bold tracking-wider text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              جميع الحقوق محفوظة &copy; 2026 - مشروع فحص السكك الحديدية بالذكاء الاصطناعي
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
