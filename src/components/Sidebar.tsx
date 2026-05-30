import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  BarChart3, 
  Map as MapIcon, 
  Upload, 
  History, 
  FileText, 
  Settings, 
  AlertTriangle, 
  RailSymbol,
  Plus,
  Wrench,
  FileDown,
  Users,
  Video,
  Calendar,
  Maximize,
  Minimize,
  LogOut,
  ShieldAlert,
  Box,
  Library,
  Database,
  Film,
  User as UserIcon,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  TrendingUp,
  Navigation,
  Flame,
  Radio,
  Truck,
  X,
  Signal,
  Battery,
  Wifi,
  Compass,
  Loader2,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LoginDropdown } from './LoginDropdown';
import { TrackQrGenerator } from './TrackQrGenerator';
import { TrackInspection } from '../types';
import { generateMaintenanceHistoryReport } from '../lib/pdfReport';
import { getUserEmoji } from '../constants/users';

interface NavItemProps {
  icon: typeof BarChart3;
  label: string;
  active?: boolean;
  onClick: () => void;
  isRTL?: boolean;
}

const NavItem = ({ icon: Icon, label, active, onClick, isRTL }: NavItemProps) => (
  <motion.button
    onClick={onClick}
    initial="initial"
    whileHover="hover"
    className={cn(
      "w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] relative outline-none flex-row group",
      active ? "text-white" : "text-slate-400 hover:text-white"
    )}
  >
    {/* Active state background */}
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-600/5 rounded-[1.25rem] border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}

    {/* Non-active expanding hover background: expands smoothly on hover */}
    {!active && (
      <motion.div
        className="absolute inset-0 bg-white/5 rounded-[1.25rem] pointer-events-none origin-center"
        initial={{ scale: 0.9, opacity: 0 }}
        variants={{
          hover: { scale: 1, opacity: 1 }
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    )}

    {/* Active expanding hover highlight overlay */}
    {active && (
      <motion.div
        className="absolute inset-0 bg-blue-600/5 rounded-[1.25rem] pointer-events-none origin-center"
        initial={{ scale: 0.95, opacity: 0 }}
        variants={{
          hover: { scale: 1.02, opacity: 1 }
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    )}

    {/* Icon Container: scales and rotates subtly */}
    <motion.div 
      variants={{
        initial: active ? { scale: 1, rotate: 3 } : { scale: 1, rotate: 0 },
        hover: { scale: 1.12, rotate: active ? 6 : -3 }
      }}
      transition={{ type: "spring", stiffness: 450, damping: 15 }}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center relative z-10 transition-colors duration-300",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "bg-white/5 text-slate-500"
      )}
    >
      <Icon className={cn("w-4 h-4 transition-colors duration-300", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
    </motion.div>

    {/* Label Text: becomes bolder on hover */}
    <motion.span 
      variants={{
        initial: { fontWeight: active ? 900 : 500 },
        hover: { fontWeight: 800 }
      }}
      transition={{ duration: 0.15 }}
      className="text-sm relative z-10 tracking-tight"
    >
      {label}
    </motion.span>

    {active && (
      <motion.div 
        layoutId="active-indicator"
        className={cn("w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6] relative z-10", isRTL ? "mr-auto" : "ml-auto")} 
      />
    )}
  </motion.button>
);

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  inspections?: TrackInspection[];
}

const getUserPicture = (username?: string) => {
  if (!username) return "";
  switch (username.trim()) {
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
    case "م. روشان": return "/roshan.png";
    case "أ.د. محمد مرسي الجوهري": return "/president_gohary.png";
    case "أ.د. علاء عرفة": return "/dean_alaa.jpg";
    case "أ.د. ابراهيم شعيب": return "/dr_ibrahim_shoaib.png";
    default: return "";
  }
};

export function Sidebar({ currentTab, setTab, inspections = [] }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { user, logout, hasPermission } = useAuth();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Maintenance Segment report selection & Battery Health tracker
  const [selectedReportSegmentId, setSelectedReportSegmentId] = useState<string>('all');
  const [hudBattery, setHudBattery] = useState(92);

  useEffect(() => {
    // Slowly drain battery over time for dynamic real-time look
    const timer = setInterval(() => {
      setHudBattery((prev) => {
        if (prev <= 12) return 100; // Auto-charged
        return Math.max(12, prev - 0.05);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hudVoltage = (18.6 + (hudBattery / 100) * 6.4 + (Math.sin(Date.now() / 1500) * 0.015)).toFixed(2);
  const remainingSeconds = Math.round((hudBattery / 100) * 1620); // 27 minutes max
  const remainingMins = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;

  // Drone Connection modal state
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectingId, setIsConnectingId] = useState<string | null>(null);
  const [connectionSuccessId, setConnectionSuccessId] = useState<string | null>(null);
  const [dronePingLogs, setDronePingLogs] = useState<string[]>([]);
  
  // Custom interactive list of simulated drones & their link statuses
  const [simulatedDrones, setSimulatedDrones] = useState([
    { id: 'dr-1', nameAr: 'طائرة فالكون الاستكشافية Falcon T5', nameEn: 'Falcon Inspection Drone T5', model: 'DJI Matrice 300 RTK', battery: 92, signal: 'excellent', connection: 'active', frequency: '5.8 GHz', ip: '192.168.1.100' },
    { id: 'dr-2', nameAr: 'طائرة المراقبة الحرارية Thermal X8', nameEn: 'Thermal Surveyor X8', model: 'Custom Octocopter Lipo 6S', battery: 74, signal: 'good', connection: 'active', frequency: '2.4 GHz', ip: '192.168.1.101' },
    { id: 'dr-3', nameAr: 'طائرة فحص المسار الذكية Z4', nameEn: 'Smart Track Finder Z4', model: 'Pixhawk APM 2.8 Custom', battery: 45, signal: 'warning', connection: 'inactive', frequency: '5.8 GHz', ip: '192.168.1.102' },
    { id: 'dr-4', nameAr: 'كاشف العيوب بالموجات فوق الصوتية Sentinel', nameEn: 'Ultrasonic Defect Finder Drone', model: 'Custom Quad Pixhawk 4', battery: 88, signal: 'excellent', connection: 'inactive', frequency: '5.8 GHz', ip: '192.168.1.103' }
  ]);

  const [newDroneName, setNewDroneName] = useState('');
  const [newDroneModel, setNewDroneModel] = useState('');
  const [newDroneIP, setNewDroneIP] = useState('');

  const advancedTabs = ['predictive_maintenance', 'autopilot_command', 'thermal_vision', 'api_gateway', 'load_simulator'];
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() => advancedTabs.includes(currentTab));

  useEffect(() => {
    if (advancedTabs.includes(currentTab)) {
      setIsAdvancedOpen(true);
    }
  }, [currentTab]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleScanDrones = () => {
    setIsScanning(true);
    setDronePingLogs(prev => [...prev, `${isRTL ? '[نظام] جاري البحث عن مستقبلات البث المجاورة...' : '[SYS] Inspecting neighboring broadcast transmitters...'}`]);
    
    setTimeout(() => {
      setDronePingLogs(prev => [...prev, `${isRTL ? '[تردد] جاري فحص الحزم الترددية 5.8 جيجاهرتز...' : '[RF] Inspecting 5.8 GHz frequency band...'}`]);
    }, 500);

    setTimeout(() => {
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? '[اتصال] عثر على 4 وحدات متوافقة مع نظام التوجيه الذاتي MAVLink.' : '[LINK] Found 4 devices compatible with autopilot telemetry standard.'}`
      ]);
      setIsScanning(false);
    }, 1200);
  };

  const handleToggleConnection = (id: string) => {
    const drone = simulatedDrones.find(d => d.id === id);
    if (!drone) return;

    if (drone.connection === 'active') {
      // Disconnect
      setSimulatedDrones(prev => prev.map(d => d.id === id ? { ...d, connection: 'inactive' } : d));
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? `[اتصال] تم فصل ${drone.nameAr} بنجاح.` : `[LINK] Disconnected ${drone.nameEn} successfully.`}`
      ]);
    } else {
      // Connect
      setIsConnectingId(id);
      setDronePingLogs(prev => [
        ...prev, 
        `${isRTL ? `[إشارة] محاولة إرسال حزم التزامن إلى ${drone.ip}...` : `[SIGNAL] Sending sync telemetry packets to ${drone.ip}...`}`
      ]);

      setTimeout(() => {
        setDronePingLogs(prev => [
          ...prev, 
          `${isRTL ? `[نظام] استقبال بث كاذب للموقع الجغرافي. جاري فحص صلاحية MAVLink v2.0...` : `[SYS] Fake GPS lock detected. Testing MAVLink compliance v2.0...`}`
        ]);
      }, 700);

      setTimeout(() => {
        setSimulatedDrones(prev => prev.map(d => d.id === id ? { ...d, connection: 'active' } : d));
        setIsConnectingId(null);
        setConnectionSuccessId(id);
        setDronePingLogs(prev => [
          ...prev, 
          `${isRTL ? `[نجاح] تم إقران الطائرة ${drone.nameAr} بنشاط!` : `[SUCCESS] Linked ${drone.nameEn} successfully!`}`
        ]);
        setTimeout(() => setConnectionSuccessId(null), 3000);
      }, 1500);
    }
  };

  const handleAddNewDrone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDroneName) return;

    const newUnit = {
      id: `dr-${Date.now()}`,
      nameAr: newDroneName,
      nameEn: newDroneName,
      model: newDroneModel || 'DIY Pixhawk Custom',
      battery: 100,
      signal: 'excellent' as const,
      connection: 'inactive' as const,
      frequency: '5.8 GHz',
      ip: newDroneIP || '192.168.1.109'
    };

    setSimulatedDrones(prev => [...prev, newUnit]);
    setDronePingLogs(prev => [
      ...prev, 
      `${isRTL ? `[تسجيل] تم إدراج الطائرة الجديدة بقاعدة البيانات: ${newDroneName}` : `[REGISTRY] Newly registered drone saved to schema: ${newDroneName}`}`
    ]);
    setNewDroneName('');
    setNewDroneModel('');
    setNewDroneIP('');
  };

  return (
    <aside className={cn(
      "w-72 bg-slate-950 border-slate-800 flex flex-col h-screen sticky top-0 shadow-2xl z-50 shrink-0",
      isRTL ? "border-l" : "border-r"
    )}>
      <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
        <div id="tour-logo" className="flex flex-col gap-1 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden border border-white/10 group overflow-hidden">
              <motion.img 
                whileHover={{ scale: 1.1, rotate: 5 }}
                src="/AI Rail Inspector logo2.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1 opacity-90 group-hover:opacity-100 transition-opacity" 
              />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-white font-black tracking-tighter text-lg leading-tight uppercase font-display italic">
                فحص السكك<br/>
                <span className="text-blue-500">الحديدية</span>
              </h1>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-blue-600/50 to-transparent w-full mt-4" />
        </div>

        <nav id="tour-navigation" className="space-y-1">
          {hasPermission('page', 'dashboard') && (
            <NavItem 
              icon={BarChart3} 
              label={t('dashboard')} 
              active={currentTab === 'dashboard'} 
              onClick={() => setTab('dashboard')} 
              isRTL={isRTL}
            />
          )}
          <NavItem 
            icon={Radio} 
            label={t('crewIntercom')} 
            active={currentTab === 'crew_intercom'} 
            onClick={() => setTab('crew_intercom')} 
            isRTL={isRTL}
          />
          {hasPermission('page', 'map') && (
            <NavItem 
              icon={Upload} 
              label={t('analysisHub')} 
              active={currentTab === 'analysis'} 
              onClick={() => setTab('analysis')} 
              isRTL={isRTL}
            />
          )}
          {hasPermission('page', 'map') && (
            <NavItem 
              icon={MapIcon} 
              label={t('geotagMap')} 
              active={currentTab === 'map'} 
              onClick={() => setTab('map')} 
              isRTL={isRTL}
            />
          )}
          {hasPermission('page', 'logs') && (
            <NavItem 
              icon={History} 
              label={t('inspectionLog')} 
              active={currentTab === 'history'} 
              onClick={() => setTab('history')} 
              isRTL={isRTL}
            />
          )}
          <NavItem 
            icon={CheckCircle} 
            label={t('tasks')} 
            active={currentTab === 'tasks'} 
            onClick={() => setTab('tasks')} 
            isRTL={isRTL}
          />
          {hasPermission('page', 'tasks') && (
            <NavItem 
              icon={Calendar} 
              label={t('maintenanceSchedule')} 
              active={currentTab === 'maintenance'} 
              onClick={() => setTab('maintenance')} 
              isRTL={isRTL}
            />
          )}
          {hasPermission('page', 'reports') && (
            <NavItem 
              icon={FileText} 
              label={t('reports')} 
              active={currentTab === 'reports'} 
              onClick={() => setTab('reports')} 
              isRTL={isRTL}
            />
          )}
          {hasPermission('page', 'reports') && (
            <NavItem 
              icon={Wrench} 
              label={isRTL ? "تقارير صيانة القطاع" : "Segment Reports"} 
              active={currentTab === 'segment_reports'} 
              onClick={() => setTab('segment_reports')} 
              isRTL={isRTL}
            />
          )}
          <NavItem 
            icon={Users} 
            label={t('team')} 
            active={currentTab === 'team'} 
            onClick={() => setTab('team')} 
            isRTL={isRTL}
          />
          {hasPermission('page', 'live') && (
            <NavItem 
              icon={Video} 
              label={t('liveScanner')} 
              active={currentTab === 'live'} 
              onClick={() => setTab('live')} 
              isRTL={isRTL}
            />
          )}
          {hasPermission('page', 'live') && (
            <NavItem 
              icon={Battery} 
              label={isRTL ? "تشخيص بطاريات الدرون" : "UAV Cell Monitor"} 
              active={currentTab === 'drone_battery'} 
              onClick={() => setTab('drone_battery')} 
              isRTL={isRTL}
            />
          )}

          {hasPermission('page', '3d_models') && (
            <NavItem 
              icon={Library} 
              label={t('threeDModels')} 
              active={currentTab === '3d_models'} 
              onClick={() => setTab('3d_models')} 
              isRTL={isRTL}
            />
          )}

          {hasPermission('page', 'db_training') && (
            <NavItem 
              icon={Database} 
              label={t('dbTraining')} 
              active={currentTab === 'db_training'} 
              onClick={() => setTab('db_training')} 
              isRTL={isRTL}
            />
          )}

          {hasPermission('page', 'inventory') && (
            <NavItem 
              icon={Box} 
              label={t('inventory')} 
              active={currentTab === 'inventory'} 
              onClick={() => setTab('inventory')} 
              isRTL={isRTL}
            />
          )}

          {hasPermission('page', 'media') && (
            <NavItem 
              icon={Film} 
              label={t('media')} 
              active={currentTab === 'media'} 
              onClick={() => setTab('media')} 
              isRTL={isRTL}
            />
          )}
          
          <NavItem 
            icon={BookOpen} 
            label={t('projectGuide')} 
            active={currentTab === 'guide'} 
            onClick={() => setTab('guide')} 
            isRTL={isRTL}
          />

          {/* Advanced systems category accordion */}
          <div id="tour-advanced-systems" className="space-y-1 pt-2">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-[1.25rem] bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all select-none cursor-pointer flex-row group mb-1",
                isAdvancedOpen ? "text-white border-blue-500/20 bg-blue-500/5" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">{t('advancedSystems')}</span>
              </div>
              <motion.div
                animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-500 group-hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isAdvancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden space-y-1.5 pt-1 bg-slate-900/40 rounded-2xl border border-white/5 p-1"
                >
                  {[
                    { id: 'predictive_maintenance', label: t('predictiveMaintenance'), icon: TrendingUp, badge: 'PRO' },
                    { id: 'autopilot_command', label: t('autoPilotCommand'), icon: Navigation, badge: 'AUTO' },
                    { id: 'thermal_vision', label: t('thermalVision'), icon: Flame, badge: 'HOT' },
                    { id: 'api_gateway', label: t('apiGateway'), icon: Database, badge: 'SECURE' },
                    { id: 'load_simulator', label: t('loadSimulator'), icon: Truck, badge: 'CALC' }
                  ].map(sub => {
                    const SubIcon = sub.icon;
                    const isActive = currentTab === sub.id;
                    return (
                      <motion.button
                        key={sub.id}
                        onClick={() => setTab(sub.id)}
                        whileHover={{ x: isRTL ? -3 : 3 }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-extrabold transition-all cursor-pointer relative",
                          isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-450 hover:text-white"
                        )}
                      >
                        <SubIcon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-blue-400" : "text-slate-500")} />
                        <span className="truncate pr-12 text-slate-300 hover:text-white">{sub.label}</span>
                        
                        {/* Shimmer pulse badge */}
                        <span className={cn(
                          "absolute text-[7.5px] font-black px-1.5 py-0.5 rounded border tracking-wider flex items-center gap-1",
                          isRTL ? "left-2" : "right-2",
                          isActive ? "bg-blue-500/20 text-blue-300 border-blue-500/20" : "bg-white/5 text-slate-500 border-white/5"
                        )}>
                          <span className={cn("w-1 h-1 rounded-full animate-ping", isActive ? "bg-blue-400" : "bg-slate-500")} />
                          {sub.badge}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hasPermission('admin') && (
            <NavItem 
              icon={ShieldAlert} 
              label={isRTL ? "الإدارة" : "Admin Panel"} 
              active={currentTab === 'admin'} 
              onClick={() => setTab('admin')} 
              isRTL={isRTL}
            />
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className={`flex items-center gap-3 px-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {(() => {
            const sidebarEmoji = getUserEmoji(user?.username, user?.roleId || (user?.permissions?.isAdmin ? 'admin' : 'engineer'));
            return (
              <button 
                onClick={() => setTab('profile')}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden border transition-all hover:scale-105 active:scale-95 shadow-lg relative",
                  currentTab === 'profile' ? "border-blue-500 ring-4 ring-blue-500/20" : "border-white/10 bg-white/5"
                )}
              >
                 <img 
                   src={user?.profile_picture || getUserPicture(user?.username) || (user?.permissions?.isAdmin ? "/leader.jpeg" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`)}
                   alt="User Profile" 
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
                   }}
                 />
                 {sidebarEmoji && (
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 border border-white/20 rounded-md flex items-center justify-center text-[8px] shadow-sm z-20">
                     {sidebarEmoji}
                   </div>
                 )}
              </button>
            );
          })()}
          <div 
            onClick={() => setTab('profile')}
            className={`flex flex-col cursor-pointer hover:opacity-80 transition-opacity ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <p className="text-sm font-black text-white truncate max-w-[90px] tracking-tight">{user?.username}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
               {user?.permissions?.isAdmin ? (isRTL ? 'مدير نظام' : 'ADMIN') : (isRTL ? 'فني فحص' : 'TECH')}
            </p>
          </div>
          <div className={cn("flex items-center gap-1", isRTL ? "mr-auto" : "ml-auto")}>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-slate-500 hover:text-red-500"
              title={isRTL ? "تسجيل الخروج" : "Logout"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5 bg-black/20">
        <p className="text-[8px] text-slate-600 leading-tight text-center font-black uppercase tracking-widest italic opacity-50">
          © 2026 فحص السكك الحديدية
        </p>
      </div>

      {/* Dynamic Drone Connector Portal */}
      {typeof document !== 'undefined' && isDroneModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDroneModalOpen(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -15 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)] text-white flex flex-col md:flex-row max-h-[90vh] z-10"
            >
              {/* Top gradient border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-605 to-emerald-500" />
              
              {/* Close Button */}
              <button
                onClick={() => setIsDroneModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Drone Management & Terminal */}
              <div className={`p-8 md:w-3/5 border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[90vh] ${isRTL ? 'md:order-1 border-l' : 'md:order-0 border-r'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="text-base font-black tracking-tight text-white leading-tight">
                        {isRTL ? 'مدير اتصال غرف الطيران الفني' : 'Autonomous Drone Stream Manager'}
                      </h3>
                      <p className="text-slate-400 text-[10px] mt-1 pr-4">
                        {isRTL ? 'إقران طائرات التوجيه الذاتي MAVLink النشطة للبدء بمسح المسارات وتوليد عينات الكشف.' : 'Secure MAVLink active drone data feeds for high-resolution track defect scanning.'}
                      </p>
                    </div>
                  </div>

                  {/* Drone Cards List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        {isRTL ? 'الأجهزة النشطة المجاورة' : 'Detected Aerial Units'}
                      </span>
                      <button
                        onClick={handleScanDrones}
                        disabled={isScanning}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[9px] font-black tracking-wider text-slate-350 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isScanning ? (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        ) : (
                          <Wifi className="w-3 h-3" />
                        )}
                        <span>{isRTL ? 'إعادة فحص الطيف الترددي' : 'Scan RF Spectrum'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                      {simulatedDrones.map((drone) => {
                        const isConnected = drone.connection === 'active';
                        const isThisConnecting = isConnectingId === drone.id;
                        const isThisSuccess = connectionSuccessId === drone.id;

                        return (
                          <div 
                            key={drone.id} 
                            className={`p-3.5 rounded-xl border transition-all ${
                              isConnected 
                                ? 'bg-gradient-to-r from-blue-950/20 to-slate-900 border-blue-500/30' 
                                : 'bg-slate-950/20 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                  <h4 className="text-xs font-black text-white">{isRTL ? drone.nameAr : drone.nameEn}</h4>
                                </div>
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{drone.model} • {drone.ip} • Temp Sensor</p>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider ${
                                  drone.signal === 'excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                                  drone.signal === 'good' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {drone.signal.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Battery className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-mono">{drone.battery}%</span>
                                </div>
                              </div>
                            </div>

                            <div className={`mt-3 pt-2.5 border-t border-white/5 flex gap-2 items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                                <Compass className="w-3.5 h-3.5" />
                                <span className="font-mono text-[9px]">{drone.frequency}</span>
                              </div>

                              <button
                                onClick={() => handleToggleConnection(drone.id)}
                                disabled={isThisConnecting}
                                className={`px-4 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                                  isThisSuccess 
                                    ? 'bg-emerald-600 text-white' 
                                    : isConnected 
                                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10'
                                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                              >
                                {isThisConnecting ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>{isRTL ? 'جاري الاتصال...' : 'Connecting...'}</span>
                                  </>
                                ) : isThisSuccess ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{isRTL ? 'متصل بنجاح ✓' : 'Connected ✓'}</span>
                                  </>
                                ) : isConnected ? (
                                  <span>{isRTL ? 'قطع الاتصال' : 'Disconnect'}</span>
                                ) : (
                                  <span>{isRTL ? 'إقران الآن' : 'Pair Unit'}</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Console log Terminal */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-505">
                      {isRTL ? 'شاشة التشخيص والاتصالات MAVLink' : 'Telemetry Terminal Logs'}
                    </span>
                    <button
                      onClick={() => setDronePingLogs([])}
                      className="text-[9px] text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                    >
                      {isRTL ? 'مسح السجلات' : 'Clear Logs'}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 h-28 overflow-y-auto font-mono text-[9.5px] text-emerald-400 leading-relaxed space-y-1 select-all scrollbar-thin">
                    {dronePingLogs.length === 0 ? (
                      <p className="text-slate-650 italic">
                        {isRTL ? '> بانتظار إشارات البث للبدء بالحزم...' : '> Idle. Dynamic telemetry terminal ready...'}
                      </p>
                    ) : (
                      dronePingLogs.map((log, index) => (
                        <p key={index} className="text-emerald-400 font-mono">
                          {log}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Register New Hardware and Specs */}
              <div className={`p-8 md:w-2/5 bg-slate-950/40 flex flex-col justify-between overflow-y-auto max-h-[90vh] ${isRTL ? 'md:order-0' : 'md:order-1'}`}>
                <div>
                  <h4 className={`text-xs font-black text-slate-450 uppercase tracking-widest mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'تسجيل طائرة ذكية جديدة وثيقة' : 'Register New Drone Hardware'}
                  </h4>

                  <form onSubmit={handleAddNewDrone} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'اسم الوحدة الفنية' : 'Device Call Sign'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isRTL ? 'مسيرة دلتا طنطا 3' : 'Delta Tanta Drone 3'}
                        value={newDroneName}
                        onChange={(e) => setNewDroneName(e.target.value)}
                        className={`w-full bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الموديل الميكانيكي' : 'System Frame / Model'}
                      </label>
                      <input
                        type="text"
                        placeholder="Pixhawk Octo DIY v3"
                        value={newDroneModel}
                        onChange={(e) => setNewDroneModel(e.target.value)}
                        className={`w-full bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'عنوان الاتصال IP' : 'MAVLink Link IP'}
                      </label>
                      <input
                        type="text"
                        placeholder="192.168.1.109"
                        value={newDroneIP}
                        onChange={(e) => setNewDroneIP(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-600/20 uppercase"
                    >
                      {isRTL ? 'تسجيل بالشبكة وحفظ' : 'Register Drone Link'}
                    </button>
                  </form>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-300">
                      {isRTL ? 'بروتوكول تشفير معلمات الطيران مفعل' : 'Encryption & MAVLink standard live'}
                    </span>
                  </div>
                  <p className={`text-[9.5px] text-slate-500 leading-normal ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL 
                      ? 'جميع اتصالات الأجهزة مفصولة ماديًا عبر خادم محلي لتأمين فحص السكك من القرصنة أو تزوير الإحداثيات.'
                      : 'All hardware handshakes strictly run through the sandboxed secure APM controller proxy for sovereign safety.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </aside>
  );
}
