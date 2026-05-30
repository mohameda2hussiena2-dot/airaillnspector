import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Crown, 
  Wrench, 
  ChevronDown, 
  ArrowRight, 
  User, 
  Lock, 
  Key, 
  UserCheck, 
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getMockUser } from '../constants/users';
import { logActivity } from '../lib/logger';

interface LoginDropdownProps {
  onManualLoginClick?: () => void;
  className?: string;
  isSidebarMode?: boolean;
}

export function LoginDropdown({ onManualLoginClick, className = '', isSidebarMode = false }: LoginDropdownProps) {
  const { login, user: currentUser, logout } = useAuth();
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<'none' | 'academic' | 'admin' | 'engineer'>('none');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New states for security password verification
  const [selectedStaff, setSelectedStaff] = useState<{ name: string; email: string; title: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActivePortal('none');
        setSelectedStaff(null);
        setPasswordInput('');
        setErrorMsg(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickLogin = async (email: string) => {
    try {
      const { MOCK_USERS } = await import('../constants/users');
      const matched = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        await login(matched.email, matched.password);
        setIsOpen(false);
        setActivePortal('none');
      }
    } catch (err) {
      console.error("Firebase quick portal login failed", err);
    }
  };

  const academicStaff = [
    { name: "أ.د. ابراهيم شعيب (الدكتور المشرف)", email: "ask.shoaib@ymail.com", title: isRTL ? "الأستاذ المشرف الأول على المشروع" : "Primary Supervisor" },
    { name: "أ.د. محمد مرسي الجوهري", email: "elgohary.president@ymail.com", title: isRTL ? "رئيس الجامعة - بوابة الإشراف" : "University President" },
    { name: "أ.د. علاء عرفة", email: "arafa.dean@ymail.com", title: isRTL ? "عميد الكلية - بوابة الإشراف" : "Faculty Dean" }
  ];

  const adminStaff = [
    { name: isRTL ? "محمد حسين عبدالعزيز" : "Mohamed Hussein Abdelaziz", email: "mohameda2hussiena2@gmail.com", title: isRTL ? "قائد المشروع / CEO" : "Project Lead / CEO" },
    { name: isRTL ? "نورة شحاتة محمد" : "Nora Shehata Mohamed", email: "nourashehata135@gmail.com", title: isRTL ? "مدير البيانات والمشاريع" : "Data & Project Manager" },
    { name: "م. روشان", email: "roshankamal75@gmail.com", title: isRTL ? "مساعد إشرافي" : "Supervising Assistant" }
  ];

  const engineerStaff = [
    // فريق الهاردوير والميكانيكا
    { name: "احمد ثروت إبراهيم", email: "tharwat14ahmed14@gmail.com", title: isRTL ? "فريق الهاردوير والميكانيكا" : "Mechanical & Hardware Lead" },
    { name: "بيتر هانى فوزى شحاتة", email: "hanypeter620@gmail.com", title: isRTL ? "مسؤول المكونات والقطع" : "Components Manager" },
    { name: "ناصف محمد ناصف", email: "nasefmohamad11@gmail.com", title: isRTL ? "فريق الهاردوير والميكانيكا" : "Hardware Engineer" },
    { name: "محمد راوف عبده محمد", email: "m7oha4medr5aouf5@gmail.com", title: isRTL ? "فريق الهاردوير والميكانيكا" : "Hardware Engineer" },
    { name: "محمد محمد عبدالله", email: "hdhd89060@gmail.com", title: isRTL ? "فريق الهاردوير والميكانيكا" : "Hardware Analyst" },
    
    // فريق السوفت وير
    { name: "فيلوباتير جورج وليم", email: "felopatereltop@gmail.com", title: isRTL ? "أخصائي الذكاء الاصطناعي" : "AI Specialist" },
    { name: "محمد منتصر محمد", email: "mohamedmontaser218@gmail.com", title: isRTL ? "فريق السوفت وير والبرمجيات" : "Software Tech" },
    { name: "عبدالرحمن على محمد", email: "abdogazy444@gmail.com", title: isRTL ? "مهندس الأنظمة المدمجة" : "Embedded & IoT Dev" },

    // فريق البحث والبيانات
    { name: "حنين علاء على", email: "hannenalaa30@gmail.com", title: isRTL ? "فريق البحث والبيانات" : "Research & Data Specialist" },
    { name: "سلمي خالد محمود احمد", email: "salmakahaled42@gmail.com", title: isRTL ? "فريق البحث والبيانات" : "Research & Data Analyst" },
    { name: "شهد احمد هلال", email: "shahdahmedabbas9@gmail.com", title: isRTL ? "فريق البحث والبيانات" : "Research & Data Specialist" },
    { name: "زياد عماد على", email: "zeademad800@gmail.com", title: isRTL ? "فريق البحث والبيانات" : "Research & Data Analyst" },
    { name: "عادل قدرى محمد", email: "adelkadryabodonia@gmail.com", title: isRTL ? "فريق البحث والبيانات" : "Research & Research Data" },

    // فريق التنسيق والميديا
    { name: "فارس محمد صبري", email: "fa01029489007@gmail.com", title: isRTL ? "فريق التنسيق والميديا" : "Media & Coordination Lead" }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setActivePortal('none');
    setSelectedStaff(null);
    setPasswordInput('');
    setErrorMsg(null);
  };

  const triggerButtonText = currentUser 
    ? (isRTL ? 'تبديل البوابة' : 'Switch Portal')
    : (isRTL ? 'بوابات الدخول السريع' : 'Quick Portals Login');

  return (
    <div ref={dropdownRef} className={`relative select-none ${className}`}>
      {/* Target trigger button */}
      <motion.button
        id="login-dropdown-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleDropdown}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-[11px] font-black tracking-wider transition-all cursor-pointer ${
          isSidebarMode
            ? 'w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10'
            : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.3)]'
        }`}
      >
        <span className="flex items-center gap-2">
          {currentUser ? <ArrowLeftRight className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{triggerButtonText}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Main Options Dropdown Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isSidebarMode ? -10 : 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isSidebarMode ? -10 : 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute z-[200] w-80 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2.5 text-white ${
              isSidebarMode 
                ? 'bottom-16 left-0 right-0' 
                : (isRTL ? 'left-0' : 'right-0')
            } ${isSidebarMode ? '' : 'top-14'}`}
          >
            {selectedStaff ? (
              /* Password Challenge Screen */
              <div className="flex flex-col gap-3 py-1">
                <div className={`flex items-center justify-between pb-2 border-b border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedStaff(null);
                      setPasswordInput('');
                      setErrorMsg(null);
                    }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] uppercase font-bold transition-colors cursor-pointer"
                  >
                    {isRTL ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    <span>{isRTL ? 'رجوع' : 'Back'}</span>
                  </button>
                  <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {isRTL ? 'تأكيد كلمة المرور' : 'ENTER PASSWORD'}
                  </span>
                </div>

                <div className={`p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-[11px] font-black text-white">{selectedStaff.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{selectedStaff.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{selectedStaff.email}</span>
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setErrorMsg(null);
                    setIsVerifying(true);
                    try {
                      await login(selectedStaff.email, passwordInput);
                      setIsOpen(false);
                      setSelectedStaff(null);
                      setPasswordInput('');
                    } catch (err: any) {
                      console.error("Portal login failed", err);
                      setErrorMsg(
                        isRTL 
                          ? 'كلمة المرور غير صحيحة لهدا الحساب.' 
                          : 'Incorrect password for this account.'
                      );
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'مطلوب إدخال كلمة المرور لدخول البوابة:' : 'PASSWORD REQUIRED FOR PORTAL ENTRY:'}
                    </label>
                    <input
                      type="password"
                      required
                      autoFocus
                      className="block w-full bg-slate-950/70 border border-white/10 hover:border-cyan-500/20 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 text-center font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    <span>{isRTL ? 'تأكيد وتسجيل الدخول' : 'VERIFY & LOG IN'}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Portal Choices Screen */
              <>
                {/* Header detail */}
                <div className={`flex items-center justify-between pb-2.5 border-b border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isRTL ? 'بوابات المنصة الذكية' : 'Smart Platform Gateways'}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {isRTL ? 'اختر العضو وأدخل كلمة المرور الخاصة به' : 'Select member and input their password'}
                    </span>
                  </div>
                  <Terminal className="w-4 h-4 text-cyan-400 opacity-60 shrink-0" />
                </div>

                {/* Portals Choices */}
                <div className="flex flex-col gap-2">
                  {/* Portal 1: Academic */}
                  <div className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-2.5 border border-white/5 hover:border-cyan-500/30 transition-all">
                    <button
                      onClick={() => setActivePortal(activePortal === 'academic' ? 'none' : 'academic')}
                      className={`w-full flex items-center justify-between font-bold text-xs cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
                          <GraduationCap className="w-4 h-4" />
                        </span>
                        <span className="flex flex-col justify-center">
                          <span className="text-[11px] text-amber-300 font-extrabold">١. بوابة الدكتور المشرف والأكاديميين</span>
                          <span className="text-[9px] text-slate-400 font-medium">Academic Portal (تفويض الدكتور المشرف بمكانه المخصص)</span>
                        </span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${activePortal === 'academic' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activePortal === 'academic' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/5"
                        >
                          {academicStaff.map((staff, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedStaff({ name: staff.name, email: staff.email, title: staff.title });
                                setPasswordInput('');
                                setErrorMsg(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-amber-500/15 text-[10px] text-slate-200 hover:text-white transition-all cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{staff.name}</p>
                                <p className="text-[9px] text-slate-500 truncate">{staff.title}</p>
                              </div>
                              {isRTL ? <ChevronLeft className="w-3 h-3 text-amber-500/50" /> : <ChevronRight className="w-3 h-3 text-amber-500/50" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Portal 2: Admin */}
                  <div className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-2.5 border border-white/5 hover:border-cyan-500/30 transition-all">
                    <button
                      onClick={() => setActivePortal(activePortal === 'admin' ? 'none' : 'admin')}
                      className={`w-full flex items-center justify-between font-bold text-xs cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                          <Crown className="w-4 h-4" />
                        </span>
                        <span className="flex flex-col justify-center">
                          <span className="text-[11px] text-cyan-300 font-extrabold">٢. بوابة القيادة والإدارة</span>
                          <span className="text-[9px] text-slate-400 font-medium">Admin & Lifecycle Lead (قائد الابتكار ومدير البيانات)</span>
                        </span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${activePortal === 'admin' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activePortal === 'admin' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/5"
                        >
                          {adminStaff.map((staff, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedStaff({ name: staff.name, email: staff.email, title: staff.title });
                                setPasswordInput('');
                                setErrorMsg(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-cyan-500/15 text-[10px] text-slate-200 hover:text-white transition-all cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{staff.name}</p>
                                <p className="text-[9px] text-slate-500 truncate">{staff.title}</p>
                              </div>
                              {isRTL ? <ChevronLeft className="w-3 h-3 text-cyan-500/50" /> : <ChevronRight className="w-3 h-3 text-cyan-500/50" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Portal 3: Engineers */}
                  <div className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-2.5 border border-white/5 hover:border-cyan-500/30 transition-all">
                    <button
                      onClick={() => setActivePortal(activePortal === 'engineer' ? 'none' : 'engineer')}
                      className={`w-full flex items-center justify-between font-bold text-xs cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                          <Wrench className="w-4 h-4" />
                        </span>
                        <span className="flex flex-col justify-center">
                          <span className="text-[11px] text-emerald-300 font-extrabold font-sans">٣. بوابة الأنظمة المتقدمة والعمليات</span>
                          <span className="text-[9px] text-slate-400 font-medium">Advanced Systems Portal (فريق المهندسين والبرمجة)</span>
                        </span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${activePortal === 'engineer' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activePortal === 'engineer' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/5 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {engineerStaff.map((staff, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedStaff({ name: staff.name, email: staff.email, title: staff.title });
                                setPasswordInput('');
                                setErrorMsg(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-emerald-500/15 text-[10px] text-slate-200 hover:text-white transition-all cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <Settings className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{staff.name}</p>
                                <p className="text-[9px] text-slate-500 truncate">{staff.title}</p>
                              </div>
                              {isRTL ? <ChevronLeft className="w-3 h-3 text-emerald-500/50" /> : <ChevronRight className="w-3 h-3 text-emerald-500/50" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Actions - manual login option */}
                {onManualLoginClick && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActivePortal('none');
                      onManualLoginClick();
                    }}
                    className={`w-full flex items-center justify-center gap-2.5 mt-1.5 py-3 hover:bg-white/5 border border-dashed border-white/10 rounded-xl text-[10px] font-black tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Key className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isRTL ? 'بوابة الدخول اليدوي بكلمة مرور' : 'MANUAL CREDENTIALS LOGIN'}</span>
                  </button>
                )}

                {/* Logout button if someone is logged in */}
                {currentUser && (
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                      setActivePortal('none');
                    }}
                    className="w-full text-center py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer mt-1"
                  >
                    {isRTL ? 'تسجيل الخروج الحالي' : 'LOGOUT CURRENT SESSION'}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
