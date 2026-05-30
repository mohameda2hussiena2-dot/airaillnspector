import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CyberBackground } from './components/CyberBackground';
import { AnalysisTool } from './components/AnalysisTool';
import { MapView } from './components/MapView';
import { InspectionLog } from './components/InspectionLog';
import { MaintenanceSchedule } from './components/MaintenanceSchedule';
import { Team } from './components/Team';
import { LiveScanner } from './components/LiveScanner';
import { Tasks } from './components/Tasks';
import { TrackInspection, DefectType, Severity } from './types';
import { Shield, Bell, Search, Settings, HelpCircle, FileBarChart, Globe, User, LogOut, ChevronDown, ChevronUp, Sun, Moon, Camera, Loader2 } from 'lucide-react';
import { ROLE_PERMISSIONS, getUserEmoji } from './constants/users';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { useLanguage } from './i18n/LanguageContext';
import { generateInspectionReport, generateFullProjectReport } from './lib/pdfReport';
import { ReportAnnotationModal } from './components/ReportAnnotationModal';
import { Heartbeat } from './components/Heartbeat';
import { IdleTimer } from './components/IdleTimer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { WorkspacePage } from './components/WorkspacePage';
import { Profile } from './components/Profile';
import { ProjectGuide } from './components/ProjectGuide';
import { LandingPage } from './components/LandingPage';
import { OfflineSyncManager } from './components/OfflineSyncManager';
import { OnboardingTour } from './components/OnboardingTour';
import { SyncIndicator } from './components/SyncIndicator';
import { PredictiveMaintenance } from './components/PredictiveMaintenance';
import { AutoPilotCommand } from './components/AutoPilotCommand';
import { ThermalVision } from './components/ThermalVision';
import { ApiGateway } from './components/ApiGateway';
import { CrewIntercom } from './components/CrewIntercom';
import { LoadSimulator } from './components/LoadSimulator';
import { collection, onSnapshot, query, orderBy, setDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { DroneBatteryPage } from './components/DroneBatteryPage';
import { SegmentReportsPage } from './components/SegmentReportsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspections, setInspections] = useState<TrackInspection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, token, isLoading, hasPermission, logout, updateUser } = useAuth();
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [dropdownUploading, setDropdownUploading] = useState(false);

  const handleDropdownImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      console.warn("Image size exceeds 2MB limit");
      return;
    }

    setDropdownUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        if (updateUser) {
          await updateUser({ profile_picture: base64String } as any);
        }
      } catch (err) {
        console.error("Failed to update profile picture from dropdown:", err);
      } finally {
        setDropdownUploading(false);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file in dropdown context");
      setDropdownUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [activeReportInspection, setActiveReportInspection] = useState<TrackInspection | null>(null);

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

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#user-profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen]);

  // Utility to map role id to text
  const getRoleName = (roleId?: string, isRtlHand?: boolean) => {
    if (!roleId) return isRtlHand ? 'عضو فريق' : 'Team Member';
    const roleObj = ROLE_PERMISSIONS[roleId];
    if (!roleObj) return isRtlHand ? 'عضو فريق' : 'Team Member';
    
    if (isRtlHand) {
      return roleObj.name || 'عضو فريق';
    } else {
      switch (roleId) {
        case 'ceo': return 'CEO / Project Lead';
        case 'supervising_prof': return 'Supervising Professor';
        case 'supervising_assistant': return 'Assistant Supervisor';
        case 'three_d_manager': return '3D Design Manager';
        case 'data_manager': return 'Data & Project Manager';
        case 'software_tech': return 'Software & Tech Team';
        case 'mechanical_team': return 'Mechanical & Hardware';
        case 'research_data': return 'Research & Data';
        case 'media_team': return 'Media & Coordination';
        case 'components_manager': return 'Components Manager';
        default: return 'Team Member';
      }
    }
  };

  // Real-time Firestore Listener
  useEffect(() => {
    if (!user) return; // Prevent subscribing before login!
    
    // If we're logged in via local offline fallback, don't query Firestore (since request.auth is null)
    if (token === 'local-fallback-token') {
      console.info("Using offline storage fallback mode (Local Account). skipping live Firestore stream.");
      setIsFirebaseLoaded(true);
      return;
    }

    const q = query(collection(db, 'inspections'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as TrackInspection[];
      
      if (docs.length > 0) {
        setInspections(docs);
        localStorage.setItem('railway_inspections', JSON.stringify(docs.slice(0, 50)));
      }
      setIsFirebaseLoaded(true);
    }, (error) => {
      console.warn("Firestore subscription failed for inspections. Marking database as loaded to use client context caches.", error);
      setIsFirebaseLoaded(true);
    });

    return () => unsubscribe();
  }, [user, token]);

  // Load sample data only if Firebase hasn't returned anything after a while and localStorage is empty
  useEffect(() => {
    if (isFirebaseLoaded && inspections.length === 0) {
      const saved = localStorage.getItem('railway_inspections');
      if (saved) {
        try {
          setInspections(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load local history");
        }
      } else {
        // Seed initial sample information so the user sees 'Information' immediately
        const sampleInspections: TrackInspection[] = [
          {
            id: 'insp-sample-1',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1551528345-66779435f3df?q=80&w=2070&auto=format&fit=crop',
            location: { lat: 31.0409, lng: 31.3785, altitude: 15 },
            defects: [
              { id: 'd1', type: DefectType.CRACK, severity: Severity.HIGH, confidence: 0.92, box: { ymin: 2, xmin: 3, ymax: 4, xmax: 5 }, description: 'Structural crack detected in main rail' }
            ],
            summary: 'Critical structural integrity concern on Section A4'
          },
          {
            id: 'insp-sample-2',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1615107530635-4424388147d3?q=80&w=1974&auto=format&fit=crop',
            location: { lat: 31.0415, lng: 31.3792, altitude: 12 },
            defects: [
              { id: 'd2', type: DefectType.MISSING_BOLT, severity: Severity.MEDIUM, confidence: 0.88, box: { ymin: 5, xmin: 6, ymax: 7, xmax: 8 }, description: 'Loosened bolt on sleeper 242' }
            ],
            summary: 'Routine maintenance recommended for fastener replacement'
          }
        ];
        setInspections(sampleInspections);
        localStorage.setItem('railway_inspections', JSON.stringify(sampleInspections));
      }
    }
  }, [isFirebaseLoaded, inspections.length]);

  // Redirect if current tab is not allowed
  useEffect(() => {
    if (!user) return;
    
    const checkTab = (tab: string) => {
      if (tab === 'dashboard') return hasPermission('page', 'dashboard');
      if (tab === 'analysis' || tab === 'map') return hasPermission('page', 'map');
      if (tab === 'history') return hasPermission('page', 'logs');
      if (tab === 'maintenance') return hasPermission('page', 'maintenance');
      if (tab === 'tasks') return true;
      if (tab === 'team') return true;
      if (tab === 'reports') return hasPermission('page', 'reports');
      if (tab === 'live') return hasPermission('page', 'live');
      if (tab === 'admin') return hasPermission('admin');
      if (tab === '3d_models') return hasPermission('page', '3d_models');
      if (tab === 'db_training') return hasPermission('page', 'db_training');
      if (tab === 'inventory') return hasPermission('page', 'inventory');
      if (tab === 'media') return hasPermission('page', 'media');
      if (tab === 'guide') return true;
      if (tab === 'profile') return true;
      return true;
    };

    if (!checkTab(activeTab)) {
      // Find first available tab
      const pages = ['dashboard', 'map', 'logs', 'tasks', 'reports', 'live', 'admin-users', '3d_models', 'db_training', 'inventory', 'media'];
      const firstAllowed = pages.find(p => hasPermission('page', p));
      if (firstAllowed) {
        let target = firstAllowed;
        if (target === 'logs') target = 'history';
        else if (target === 'tasks') target = 'maintenance';
        else if (target === 'admin-users') target = 'team';
        setActiveTab(target);
      }
    }
  }, [user, activeTab, hasPermission]);

  // Auto-Redirect upon login based on role
  useEffect(() => {
    if (user) {
      const redirectedKey = `redirected_${user.id}`;
      const hasRedirected = sessionStorage.getItem(redirectedKey);
      
      if (!hasRedirected) {
        if (user.roleId === 'engineer') {
          setActiveTab('live'); // Engineers land on Live Scanner / Tasks
        } else if (user.roleId === 'academic') {
          setActiveTab('reports'); // Academics land on Reports view
        } else if (user.roleId === 'admin') {
          setActiveTab('dashboard'); // Admins land on complete Dashboard view
        }
        sessionStorage.setItem(redirectedKey, 'true');
      }
    } else {
      // Clear navigation redirection flags on logout
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('redirected_')) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [user]);

  const handleNewInspection = async (inspection: TrackInspection) => {
    if (!hasPermission('action', 'canUpload')) {
      alert(isRTL ? "ليس لديك صلاحية الرفع" : "You do not have upload permissions");
      return;
    }
    
    const inspectionId = inspection.id || `insp-${Date.now()}`;
    const formattedInspection: TrackInspection = {
      ...inspection,
      id: inspectionId,
      reviewed: inspection.reviewed !== undefined ? inspection.reviewed : false
    };

    try {
      if (token === 'local-fallback-token') {
        throw new Error("Local fallback mode doesn't write to cloud");
      }
      await setDoc(doc(db, 'inspections', inspectionId), formattedInspection);
    } catch (error) {
      console.warn("Firestore writes failed, falling back to local offline cache", error);
      
      // Pessimistic/offline fallback immediately
      setInspections(prev => {
        const merged = [formattedInspection, ...prev.filter(x => x.id !== inspectionId)];
        localStorage.setItem('railway_inspections', JSON.stringify(merged.slice(0, 50)));
        return merged;
      });

      // Dispatch custom offline queue alert
      window.dispatchEvent(new CustomEvent('sw-offline-queued', {
        detail: { url: 'firestore/inspections', method: 'WRITE' }
      }));
    }
  };

  const handleToggleReviewed = async (id: string) => {
    const inspection = inspections.find(insp => insp.id === id);
    if (!inspection) return;

    try {
      if (token === 'local-fallback-token') {
        throw new Error("Local fallback mode doesn't write to cloud");
      }
      await updateDoc(doc(db, 'inspections', id), {
        reviewed: !inspection.reviewed
      });
    } catch (error) {
      console.warn("Firestore field update failed, saving locally", error);
      setInspections(prev => {
        const updated = prev.map(insp => insp.id === id ? { ...insp, reviewed: !insp.reviewed } : insp);
        localStorage.setItem('railway_inspections', JSON.stringify(updated.slice(0, 50)));
        return updated;
      });
    }
  };

  const handleBulkReview = async (ids: string[]) => {
    try {
      if (token === 'local-fallback-token') {
        throw new Error("Local fallback mode doesn't write to cloud");
      }
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.update(doc(db, 'inspections', id), { reviewed: true });
      });
      await batch.commit();
    } catch (error) {
      console.warn("Firestore batch update failed, saving locally", error);
      setInspections(prev => {
        const updated = prev.map(insp => ids.includes(insp.id) ? { ...insp, reviewed: true } : insp);
        localStorage.setItem('railway_inspections', JSON.stringify(updated.slice(0, 50)));
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <ProtectedRoute>
      <div className={`flex h-screen bg-[#020617] font-sans selection:bg-blue-500/20 selection:text-blue-400 ${isRTL ? 'font-arabic' : ''}`}>
        <Heartbeat />
        <IdleTimer />
        <OfflineSyncManager />
        <OnboardingTour currentTab={activeTab} setTab={setActiveTab} />
        <Sidebar currentTab={activeTab} setTab={setActiveTab} inspections={inspections} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Cyberpunk Animated Technical Background Overlay */}
        <CyberBackground />

        {/* Header */}
        <header className="h-20 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-10 z-40 relative">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-full max-w-md group">
               <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors`} />
               <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all`}
               />
             </div>
          </div>

          <div id="tour-header-controls" className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 transition-all text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              {language === 'en' ? 'العربية' : 'الإنجليزية'}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 transition-all text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest cursor-pointer"
              title={theme === 'dark' ? (isRTL ? "الوضع المضيء" : "Light Mode") : (isRTL ? "الوضع المظلم" : "Dark Mode")}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{isRTL ? "مضيء" : "Light"}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-500" />
                  <span>{isRTL ? "مظلم" : "Dark"}</span>
                </>
              )}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </motion.button>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-1.5 shrink-0"
            >
               <Shield className="w-3.5 h-3.5 text-blue-500" />
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('systemSecure')}</span>
            </motion.div>

            <SyncIndicator />

            {/* Separator */}
            <div className="h-8 w-px bg-white/5 mx-2" />

            {/* User Profile Dropdown Container */}
            {user && (() => {
              const userEmoji = getUserEmoji(user.username, user.roleId);
              return (
                <div id="user-profile-dropdown-container" className="relative group/prof">
                  <motion.button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2.5 ${isRTL ? 'pl-2.5 pr-3' : 'pl-3 pr-2.5'} py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 transition-all select-none cursor-pointer`}
                  >
                    <div className="relative shrink-0 select-none">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs relative">
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      {userEmoji && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-900 border border-white/20 rounded-md flex items-center justify-center text-[7px] shadow-sm z-20">
                          {userEmoji}
                        </div>
                      )}
                    </div>
                    <div className={`hidden md:flex flex-col ${isRTL ? 'items-end text-right' : 'items-start text-left'} min-w-0`}>
                      <span className="text-[11px] font-bold text-white leading-3 max-w-[120px] truncate">{user.username}</span>
                      <span className="text-[9px] font-semibold text-slate-500 leading-3 mt-0.5 truncate max-w-[120px]">
                        {getRoleName(user.roleId, isRTL)}
                      </span>
                    </div>
                    {isProfileDropdownOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-12 mt-2 w-64 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-2.5 text-xs text-white ${
                          isRTL ? 'left-0' : 'right-0'
                        }`}
                      >
                        {/* User profile details overview */}
                        <div className={`flex flex-col gap-1 pb-3 border-b border-white/5 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="relative group/avatar shrink-0 select-none">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm relative">
                                {user.profile_picture ? (
                                  <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-blue-400" />
                                )}
                                {dropdownUploading && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                  </div>
                                )}
                                {/* Editable photo upload overlay overlay */}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity duration-200 z-10">
                                  <Camera className="w-4 h-4" />
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleDropdownImageUpload} 
                                    disabled={dropdownUploading} 
                                  />
                                </label>
                              </div>
                              {userEmoji && (
                                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-slate-950 border border-white/20 rounded-lg flex items-center justify-center text-[10px] shadow-lg z-20">
                                  {userEmoji}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate text-[11px] leading-3 mb-1">{user.username}</p>
                              <p className="text-[9px] text-slate-500 truncate font-mono">{user.email}</p>
                            </div>
                          </div>
                          <div className={`mt-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block ${isRTL ? 'self-end' : 'self-start'} w-fit`}>
                            {getRoleName(user.roleId, isRTL)}
                          </div>
                        </div>

                      {/* Menu items */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white font-bold text-[11px] ${
                            isRTL ? 'flex-row-reverse text-right' : 'text-left'
                          }`}
                        >
                          <User className="w-4 h-4 text-blue-500" />
                          <span>{isRTL ? 'عرض الملف الشخصي' : 'View Profile'}</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all cursor-pointer text-slate-300 font-bold text-[11px] ${
                            isRTL ? 'flex-row-reverse text-right' : 'text-left'
                          }`}
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="min-h-full w-full max-w-screen-2xl mx-auto p-6 md:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
              {activeTab === 'dashboard' && <Dashboard inspections={inspections} />}
              {activeTab === 'analysis' && <AnalysisTool onAnalysisResult={handleNewInspection} />}
              {activeTab === 'map' && (
                <div className="flex flex-col xl:flex-row h-full gap-8">
                  <div className="flex-1 min-h-[500px]">
                    <MapView 
                      inspections={inspections} 
                      selectedId={selectedId} 
                      onSelect={setSelectedId} 
                    />
                  </div>
                  <div className="w-full xl:w-[450px] 2xl:w-[550px] shrink-0 border-l border-white/5 pl-4 overflow-hidden flex flex-col">
                    <InspectionLog 
                      inspections={inspections} 
                      onToggleReviewed={handleToggleReviewed} 
                      onBulkReview={handleBulkReview}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'history' && (
                <InspectionLog 
                  inspections={inspections} 
                  onToggleReviewed={handleToggleReviewed} 
                  onBulkReview={handleBulkReview} 
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
              {activeTab === 'maintenance' && <MaintenanceSchedule inspections={inspections} />}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'team' && <Team />}
              {activeTab === 'live' && <LiveScanner onAnalysisResult={handleNewInspection} />}
              {activeTab === '3d_models' && <WorkspacePage type="3d_models" />}
              {activeTab === 'db_training' && <WorkspacePage type="db_training" />}
              {activeTab === 'inventory' && <WorkspacePage type="inventory" />}
              {activeTab === 'media' && <WorkspacePage type="media" />}
              {activeTab === 'guide' && <ProjectGuide />}
              {activeTab === 'predictive_maintenance' && <PredictiveMaintenance />}
              {activeTab === 'autopilot_command' && <AutoPilotCommand />}
              {activeTab === 'thermal_vision' && <ThermalVision />}
              {activeTab === 'api_gateway' && <ApiGateway />}
              {activeTab === 'crew_intercom' && <CrewIntercom />}
              {activeTab === 'load_simulator' && <LoadSimulator />}
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'admin' && <AdminPanel />}
              {activeTab === 'drone_battery' && <DroneBatteryPage />}
              {activeTab === 'segment_reports' && <SegmentReportsPage inspections={inspections} />}
              {activeTab === 'reports' && (
                <div className="flex flex-col h-full gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('reports')}</h2>
                      <p className="text-sm text-slate-500 font-arabic-desc">{t('reportSync')}</p>
                    </div>
                  </div>
                  
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all duration-300 shadow-sm shadow-slate-200/50">
                       <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <FileBarChart className="w-8 h-8 text-blue-600" />
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 mb-2">{t('weeklyAudit')}</h3>
                       <p className="text-xs text-slate-500 mb-6 max-w-xs">{t('auditDesc')}</p>
                       <button 
                         onClick={async () => {
                           if (!hasPermission('action', 'canDownload')) {
                             alert(isRTL ? "ليس لديك صلاحية التحميل" : "You do not have download permissions");
                             return;
                           }
                           if (inspections.length > 0) {
                             const latest = inspections[0];
                             setActiveReportInspection(latest);
                             setIsAnnotationModalOpen(true);
                           } else {
                             alert(t('noDetections'));
                           }
                         }}
                         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20"
                       >
                          {t('generateAudit')}
                       </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all duration-300 shadow-sm shadow-slate-200/50">
                       <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Settings className="w-8 h-8 text-slate-400" />
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 mb-2">{t('maintenanceSchedule')}</h3>
                       <p className="text-xs text-slate-500 mb-6 max-w-xs">{t('scheduleDesc')}</p>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setActiveTab('maintenance')}
                           className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 px-4 rounded-xl transition-all text-sm border border-slate-200 whitespace-nowrap"
                         >
                            {isRTL ? "عرض الجدول" : "View Schedule"}
                         </button>
                         <button 
                           onClick={() => {
                             const workOrders = inspections.flatMap(inspection => 
                               inspection.defects
                                 .filter(defect => defect.severity === 'CRITICAL' || defect.severity === 'HIGH')
                                 .map(defect => ({
                                   'Order ID': `WO-${inspection.id.slice(-4)}-${defect.id.slice(-4)}`,
                                   'Type': defect.type,
                                   'Severity': defect.severity,
                                   'Latitude': inspection.location.lat,
                                   'Longitude': inspection.location.lng,
                                   'Detection Date': new Date(inspection.timestamp).toLocaleString()
                                 }))
                             );
                             if (!hasPermission('action', 'canDownload')) {
                               alert(isRTL ? "ليس لديك صلاحية التحميل" : "You do not have download permissions");
                               return;
                             }
                             if (workOrders.length > 0) {
                               const worksheet = XLSX.utils.json_to_sheet(workOrders);
                               const workbook = XLSX.utils.book_new();
                               XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Schedule");
                               XLSX.writeFile(workbook, `Maintenance_Schedule.xlsx`);
                             } else {
                               alert(isRTL ? "لا توجد أوامر عمل للتصدير" : "No work orders to export");
                             }
                           }}
                           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20 whitespace-nowrap"
                         >
                            {t('exportExcel')}
                         </button>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-blue-50/30 border border-blue-100 rounded-3xl p-8 flex flex-col items-center justify-center border-dashed gap-4">
                     <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">{t('reportSync')}</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (!hasPermission('action', 'canDownload')) {
                            alert(isRTL ? "ليس لديك صلاحية التحميل" : "You do not have download permissions");
                            return;
                          }
                          generateFullProjectReport(inspections, language, t);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
                      >
                       <FileBarChart className="w-5 h-5" />
                       {t('generateComprehensiveReport')}
                     </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>

    <ReportAnnotationModal
      isOpen={isAnnotationModalOpen}
      onClose={() => {
        setIsAnnotationModalOpen(false);
        setActiveReportInspection(null);
      }}
      onSubmit={handleAnnotationSubmit}
    />
    </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
