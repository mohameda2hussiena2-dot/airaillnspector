import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Users, Mail, Phone, MapPin, Award, Building2, UserCircle, ShieldCheck, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS, ROLE_PERMISSIONS } from '../constants/users';

export function Team() {
  const { t, isRTL } = useLanguage();
  const { token } = useAuth();
  const [personnel, setPersonnel] = React.useState<any[]>([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const supervisors = [
    { 
      name: isRTL ? "أ.د. ابراهيم شعيب" : "Dr. Ibrahim Shoaib", 
      role: isRTL ? "المشرف الأكاديمي على المشروع" : "Project Academic Supervisor",
      image: "/dr_ibrahim_shoaib.png"
    },
    { 
      name: isRTL ? "أ.د. محمد مرسي الجوهري" : "Prof. Dr. Mohamed Morsi El-Gohary", 
      role: isRTL ? "رئيس جامعة برج العرب التكنولوجية" : "President of Borg El Arab Technological University",
      image: "/president_gohary.png"
    },
    { 
      name: isRTL ? "أ.د. علاء عرفة" : "Prof. Dr. Alaa Arafa", 
      role: isRTL ? "عميد كلية تكنولوجيا الصناعة والطاقة" : "Dean of the Faculty of Industry & Energy Technology",
      image: "/dean_alaa.jpg"
    }
  ];

  const teamLeader = { 
    username: "محمد حسين عبدالعزيز",
    name: isRTL ? "محمد حسين عبدالعزيز" : "Mohamed Hussein Abdelaziz", 
    role: isRTL ? "الرئيس التنفيذي / قائد المشروع" : "CEO / Project Leader",
    description: isRTL ? "يمكنك الوصول الكامل لجميع صلاحيات النظام." : "Full project strategic & operational control.",
    icon: "👑",
    image: "/leader.jpeg"
  };

  const remainingCore = [
    { 
      username: "نورة شحاتة محمد",
      name: isRTL ? "نورة شحاتة محمد" : "Nora Shehata Mohamed", 
      role: isRTL ? "مدير المشاريع والبيانات" : "Data & Lifecycle Manager",
      description: isRTL ? "إدارة حياة المشروع وكشف البيانات والتعليقات." : "Managing project telemetry & metadata lifecycle.",
      icon: "📊",
      image: "/nora_shehata.jpg"
    },
    { 
      username: "احمد ثروت إبراهيم",
      name: isRTL ? "احمد ثروت إبراهيم" : "Ahmed Tharwat Ibrahim", 
      role: isRTL ? "فريق الميكانيكا والهاردوير" : "Mechanical Systems Lead",
      description: isRTL ? "التصميم الإنشائي والتركيبات الميكانيكية والأنظمة الصلبة." : "Structural design & hardware assembly lead.",
      icon: "⚙️",
      image: "/ahmed_tharwat.jpeg"
    },
    { 
      username: "بيتر هانى فوزى شحاتة",
      name: isRTL ? "بيتر هانى فوزى شحاتة" : "Peter Hany Fawzy", 
      role: isRTL ? "مسؤول المكونات والقطع" : "Hardware & Components Lead",
      description: isRTL ? "إدارة المخزون وتوريد القطع اللازمة للفريق." : "Inventory & supply chain management.",
      icon: "🔌",
      image: "/peter_hany.jpeg"
    },
    { 
      username: "محمد محمد عبدالله",
      name: isRTL ? "محمد محمد عبدالله" : "Mohamed Mohamed Abdallah", 
      role: isRTL ? "مدير التصميم ثلاثي الأبعاد" : "3D & Design Manager",
      description: isRTL ? "مسؤول عن جميع التصاميم ثلاثية الأبعاد ونماذج الهندسة." : "Master architect of all 3D digital twins.",
      icon: "🎨",
      image: "/mohamed_abdallah.jpg"
    }
  ];

  const subTeams = [
    {
      title: isRTL ? "فريق السوفت وير والتقنية" : "Software & Tech Team",
      members: [
        { username: "فيلوباتير جورج وليم", name: isRTL ? "فيلوباتير جورج وليم" : "Philopateer George William", image: "/philopateer_george.jpeg" },
        { username: "محمد منتصر محمد", name: isRTL ? "محمد منتصر محمد" : "Mohamed Montaser Mohamed", image: "/mohamed_montaser.jpeg" },
        { username: "عبدالرحمن على محمد", name: isRTL ? "عبدالرحمن على محمد" : "Abdelrahman Ali Mohamed", image: "/abdelrahman_ali.jpeg" }
      ]
    },
    {
      title: isRTL ? "فريق البحث وجمع البيانات" : "Research & Data",
      members: [
        { username: "حنين علاء على", name: isRTL ? "حنين علاء على" : "Haneen Alaa Ali", image: "/haneen_alaa.jpeg" },
        { username: "سلمي خالد محمود احمد", name: isRTL ? "سلمي خالد محمود احمد" : "Salma Khaled Mahmoud", image: "/salma_khaled.jpeg" },
        { username: "شهد احمد هلال", name: isRTL ? "شهد احمد هلال" : "Shahd Ahmed Helal", image: "/shahd_ahmed.jpeg" },
        { username: "زياد عماد على", name: isRTL ? "زياد عماد على" : "Zead Emad Ali", image: "/zead_emad.jpeg" },
        { username: "عادل قدرى محمد", name: isRTL ? "عادل قدرى محمد" : "Adel Kadry Mohamed", image: "/adel_kadry.jpeg" }
      ]
    },
    {
      title: isRTL ? "فريق التنسيق والميديا" : "Media & Coordination",
      members: [
        { username: "فارس محمد صبري", name: isRTL ? "فارس محمد صبري" : "Fares Mohamed Sabry", image: "/fares_sabry.jpeg" }
      ]
    },
    {
      title: isRTL ? "فريق الميكانيكا والهاردوير" : "Mechanical & Hardware",
      members: [
        { username: "ناصف محمد ناصف", name: isRTL ? "ناصف محمد ناصف" : "Nasef Mohamed Nasef", image: "/nasef_mohamed.jpg" },
        { username: "محمد راوف عبده محمد", name: isRTL ? "محمد راوف عبده محمد" : "Mohamed Raouf Abdo", image: "/mohamed_raouf.jpeg" }
      ]
    }
  ];

  React.useEffect(() => {
    setIsLoadingPersonnel(true);

    const loadPersonnel = async () => {
      let dbUsers: any[] = [];
      try {
        if (token) {
          const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            dbUsers = await res.json();
          }
        }
      } catch (err) {
        console.warn("Failed to load db users inside Team component:", err);
      }

      // Read current logged-in user details to keep instant changes visible
      const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth_user') || 'null') : null;

      // Merge manual lists with MOCK_USERS to ensure we have images and descriptions
      const detailedPersonnel = MOCK_USERS.map(u => {
        const roleInfo = ROLE_PERMISSIONS[u.role] || {};
        
        // Try to find if this user has extra data in the manual lists in Team.tsx
        const coreMember = remainingCore.find(m => m.username === u.username) || 
                           (teamLeader.username === u.username ? teamLeader : null);
        
        let subTeamMember: any = null;
        subTeams.forEach(st => {
          const found = st.members.find(m => m.username === u.username);
          if (found) subTeamMember = { ...found, teamTitle: st.title };
        });

        const dbUser = dbUsers.find((du: any) => du.username === u.username || du.email?.toLowerCase() === u.email?.toLowerCase());
        const customPic = (currentUser?.username === u.username ? currentUser?.profile_picture : null) || dbUser?.profile_picture;

        let userImage = customPic || coreMember?.image || subTeamMember?.image;
        if (!userImage) {
          if (u.username === "م. روشان") {
            userImage = "/roshan.png";
          } else if (u.username === "أ.د. ابراهيم شعيب") {
            userImage = "/dr_ibrahim_shoaib.png";
          } else {
            userImage = `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`;
          }
        }

        return {
          ...u,
          role_name: roleInfo.name || u.role,
          role_description: roleInfo.description || (isRTL ? "عضو مساهم في الفريق" : "Team contributor"),
          image: userImage,
          icon: coreMember?.icon || (u.role === 'ceo' ? '👑' : null),
          team: subTeamMember?.teamTitle || (u.role === 'ceo' ? (isRTL ? 'القيادة' : 'Leadership') : (isRTL ? 'النواة' : 'Core'))
        };
      });

      setPersonnel(detailedPersonnel);
      setIsLoadingPersonnel(false);
    };

    loadPersonnel();
  }, [isRTL, token]);

  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.role_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || p.role === activeFilter || p.team === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getRoleColors = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'supervising_prof':
      case 'supervising_assistant': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'software_tech': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'mechanical_team': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'data_manager': 
      case 'research_data': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'media_team': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'three_d_manager': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-800/50 text-slate-400 border-white/5';
    }
  };

  const filters = [
    { id: 'all', label: isRTL ? 'الكل' : 'All' },
    { id: 'ceo', label: isRTL ? 'القيادة' : 'Leadership' },
    { id: 'software_tech', label: isRTL ? 'البرمجيات' : 'Software' },
    { id: 'mechanical_team', label: isRTL ? 'الميكانيكا' : 'Mechanical' },
    { id: 'research_data', label: isRTL ? 'البحث' : 'Research' },
    { id: 'media_team', label: isRTL ? 'الميديا' : 'Media' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 overflow-y-auto h-full pr-4 custom-scrollbar pb-20"
    >
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className={`flex flex-col gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{t('team')}</h2>
          <div className="h-1.5 w-32 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
          <p className="text-slate-500 text-sm mt-2 max-w-md font-medium">
            {isRTL 
              ? "تعرف على الكوادر الهندسية والتقنية التي تقف خلف تطوير مشروع AI Rail Inspector." 
              : "Meet the engineering and technical assets behind the AI Rail Inspector ecosystem."}
          </p>
        </div>

        <div className="w-full md:w-96 relative group">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors", isRTL ? "right-4" : "left-4")} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث عن عضو..." : "Find team member..."}
            className={cn(
              "w-full bg-slate-900/60 border border-white/10 rounded-2xl py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all",
              isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
            )}
          />
        </div>
      </div>

      {/* 1. Auspices & Supervision */}
      <section className="space-y-12">
        <h3 className={cn("text-xl font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3 italic", isRTL ? "flex-row-reverse" : "")}>
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          {t('supervisor')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {supervisors.map((s, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={cn(
                "bg-slate-900/40 backdrop-blur-xl border rounded-[40px] p-10 flex flex-col items-center justify-center transition-all relative overflow-hidden group shadow-2xl",
                i === 1 
                  ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_80px_rgba(37,99,235,0.15)] md:scale-110 z-20 min-h-[340px]" 
                  : "border-white/5 z-10 min-h-[280px]",
                isRTL ? "text-right" : "text-left"
              )}
            >
              {/* Background ID Decoration */}
              <span className="absolute -bottom-8 -right-8 text-9xl font-black text-white/[0.02] pointer-events-none select-none tracking-tighter italic">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity text-blue-600">
                <GraduationCap />
              </div>

              <div className={cn(
                "relative rounded-3xl overflow-hidden mb-6 transition-all duration-700",
                i === 1 ? "w-40 h-40 scale-125 border-4 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.3)]" : "w-32 h-32 border-2 border-white/10 group-hover:border-blue-500/50"
              )}>
                <img 
                  src={s.image} 
                  alt={s.name} 
                  className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`;
                  }}
                />
              </div>
              <h4 className={cn(
                "font-black mb-4 leading-tight uppercase tracking-tighter italic text-center drop-shadow-lg",
                i === 1 ? "text-white text-3xl mt-4" : "text-slate-200 text-xl"
              )}>{s.name}</h4>
              <p className={cn(
                "uppercase tracking-widest leading-relaxed font-black text-center",
                i === 1 ? "text-blue-400 text-sm" : "text-slate-500 text-[10px]"
              )}>{s.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Team Directory Section */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h3 className={cn("text-xl font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3 italic", isRTL ? "flex-row-reverse" : "")}>
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            {isRTL ? "دليل أعضاء الفريق" : "Team Directory"}
          </h3>

          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeFilter === f.id 
                    ? "bg-blue-600 text-white border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                    : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoadingPersonnel ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPersonnel.map((p) => (
                <motion.div 
                  layout
                  key={p.email} 
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover={{ y: -10 }}
                  className={cn(
                    "bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500 flex flex-col items-center text-center",
                    p.role === 'ceo' ? "border-blue-500/30 bg-blue-500/[0.02]" : ""
                  )}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-8 right-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <span className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest">ACTIVE</span>
                  </div>

                  {/* Photo Section */}
                  <div className="relative mb-8 pt-4">
                    <div className={cn(
                      "absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                      p.role === 'ceo' ? "opacity-30" : ""
                    )} />
                    <div className={cn(
                      "w-32 h-32 rounded-[32px] bg-slate-800 border-2 overflow-hidden relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      p.role === 'ceo' ? "border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]" : "border-white/10 group-hover:border-blue-500/50"
                    )}>
                      <img 
                        src={p.image} 
                        alt={p.username} 
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${p.username}`;
                        }}
                      />
                    </div>
                    {p.icon && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-2xl z-20">
                        {p.icon}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-5 w-full flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-black text-2xl leading-tight mb-3 tracking-tighter italic group-hover:text-blue-400 transition-colors uppercase">
                        {p.username}
                      </h4>
                      <div className="flex justify-center flex-wrap gap-2 mb-4">
                        <span className={cn(
                          "px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic border transition-all duration-300",
                          getRoleColors(p.role)
                        )}>
                          {p.role_name}
                        </span>
                      </div>
                      
                      <div className="relative group/desc">
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-3 min-h-[54px] group-hover:text-slate-300 transition-colors">
                          {p.role_description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 flex flex-col gap-4">
                      <div className="h-px bg-white/5 w-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-600/50 group-hover:w-full transition-all duration-700" />
                      </div>
                      
                      <div className="flex items-center justify-between text-slate-500 hover:text-blue-400 transition-colors px-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-[10px] font-mono tracking-tighter truncate max-w-[150px]">{p.email}</span>
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5 group-hover:border-blue-500/20 group-hover:text-blue-500 transition-all">
                           {p.team}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredPersonnel.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-600 font-black text-sm uppercase tracking-widest italic">{isRTL ? "لم يتم العثور على نتائج" : "No assets found matching criteria"}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Project Branding Footer */}
      <motion.div variants={itemVariants} className="bg-slate-900/60 backdrop-blur-2xl shadow-2xl border border-white/10 rounded-[48px] p-16 flex flex-col items-center justify-center text-center overflow-hidden relative group">
        <div className="absolute inset-0 bg-blue-600/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-48 h-48 bg-white rounded-[44px] flex items-center justify-center border-4 border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.1)] mb-12 overflow-hidden group/logo relative z-10">
          <img 
            src="/AI Rail Inspector logo2.png" 
            alt="Project Logo" 
            className="w-full h-full object-contain p-4 group-hover/logo:scale-110 transition-transform duration-1000" 
          />
        </div>
        <div className="space-y-6 relative z-10">
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[1em] mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            {isRTL ? "العلامة التجارية الرسمية للمشروع" : "OFFICIAL PROJECT BRANDING"}
          </p>
          <h3 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 drop-shadow-2xl">
            AI Rail <span className="text-blue-600 underline decoration-blue-600/40 underline-offset-8">Inspector</span>
          </h3>
          <p className="text-slate-400 text-2xl font-bold tracking-tight mb-8 uppercase">{t('universityName')}</p>
          
          <div className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto shadow-inner">
             <p className="text-slate-300 text-sm font-black uppercase tracking-[0.3em] font-display">{t('faculty')}</p>
             <div className="h-0.5 w-24 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
             <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{t('department')}</p>
          </div>

          <div className="flex items-center justify-center gap-12 mt-16">
            <div className="h-px w-24 bg-white/10" />
            <span className="text-xs font-black text-blue-500/50 tracking-[0.8em] uppercase font-mono">{t('academicYear')}</span>
            <div className="h-px w-24 bg-white/10" />
          </div>
          
          <p className="text-slate-600 text-[10px] mt-12 font-black uppercase tracking-widest leading-loose max-w-lg mx-auto">
            © 2026 {isRTL 
              ? "جميع حقوق الملكية الفكرية والتصميم محفوظة بالكامل لفريق مشروع AI Rail Inspector والمطور محمد حسين." 
              : "All intellectual property and design rights reserved to the AI Rail Inspector Development Team."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
