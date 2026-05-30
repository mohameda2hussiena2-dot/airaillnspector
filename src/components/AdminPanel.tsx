import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Users, Trash2, Edit3, X, BarChart3, History, Settings, CheckCircle, Library, Box, Plus, Download, Search, Laptop, Smartphone, Globe, LogOut, Clock, Activity, AlertTriangle, User, Loader2, Camera } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getApiUrl } from '../lib/api';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_USERS, ROLE_PERMISSIONS } from '../constants/users';
import { MOCK_STATS, MOCK_MODELS } from '../constants/mockData';
import { getLogs, LogEntry } from '../lib/logger';
import { getTasks, saveTask, updateTask, Task } from '../lib/tasks';

const FALLBACK_ROLES = [
  { id: 'ceo', name: 'CEO', permissions: { pageAccess: ['dashboard', 'analysis', 'map', 'history', 'maintenance', 'reports', 'team', 'live', '3d_models', 'db_training', 'inventory', 'media', 'admin-users'], actions: { canDownload: true, canUpload: true }, isAdmin: true }, is_custom: false },
  { id: 'three_d_manager', name: 'مسؤول الرسم ثلاثي الأبعاد', permissions: { pageAccess: ['dashboard', '3d_models'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'data_manager', name: 'Project Developer & Data Manager', permissions: { pageAccess: ['dashboard', 'db_training'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'media_team', name: 'فريق التنسيق والميديا', permissions: { pageAccess: ['dashboard', 'media'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'research_data', name: 'فريق البحث وجمع البيانات', permissions: { pageAccess: ['dashboard', 'db_training'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'mechanical_team', name: 'فريق الميكانيكا والهاردوير', permissions: { pageAccess: ['dashboard', 'maintenance'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'software_tech', name: 'فريق السوفت وير والتقنية', permissions: { pageAccess: ['dashboard', 'analysis', 'map', 'history', 'live'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'components_manager', name: 'مسؤول المكونات', permissions: { pageAccess: ['dashboard', 'inventory'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'supervising_assistant', name: 'معيدة وميسرة مخرجات المشروع', permissions: { pageAccess: ['dashboard', 'team'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false },
  { id: 'supervising_prof', name: 'الإشراف والتوجيه الأكاديمي', permissions: { pageAccess: ['dashboard', 'team'], actions: { canDownload: true, canUpload: true }, isAdmin: false }, is_custom: false }
];

const FALLBACK_USERS = [
  { id: "mock-1", email: "mohameda2hussiena2@gmail.com", username: "محمد حسين عبدالعزيز", role_id: "ceo", is_online: true },
  { id: "mock-2", email: "hdhd89060@gmail.com", username: "محمد محمد عبدالله", role_id: "three_d_manager", is_online: false },
  { id: "mock-3", email: "nourashehata135@gmail.com", username: "نورة شحاتة محمد", role_id: "data_manager", is_online: true },
  { id: "mock-4", email: "fa01029489007@gmail.com", username: "فارس محمد صبري", role_id: "media_team", is_online: false },
  { id: "mock-5", email: "shahdahmedabbas9@gmail.com", username: "شهد احمد هلال", role_id: "research_data", is_online: false },
  { id: "mock-6", email: "m7oha4medr5aouf5@gmail.com", username: "محمد راوف عبده محمد", role_id: "mechanical_team", is_online: false },
  { id: "mock-7", email: "adelkadryabodonia@gmail.com", username: "عادل قدرى محمد", role_id: "research_data", is_online: false },
  { id: "mock-8", email: "abdogazy444@gmail.com", username: "عبدالرحمن على محمد", role_id: "software_tech", is_online: true },
  { id: "mock-9", email: "felopatereltop@gmail.com", username: "فيلوباتير جورج وليم", role_id: "software_tech", is_online: true },
  { id: "mock-10", email: "hanypeter620@gmail.com", username: "بيتر هانى فوزى شحاتة", role_id: "components_manager", is_online: false },
  { id: "mock-11", email: "mohamedmontaser218@gmail.com", username: "محمد منتصر محمد", role_id: "software_tech", is_online: true },
  { id: "mock-12", email: "hannenalaa30@gmail.com", username: "حنين علاء على", role_id: "research_data", is_online: false },
  { id: "mock-13", email: "salmakahaled42@gmail.com", username: "سلمي خالد محمود احمد", role_id: "research_data", is_online: false },
  { id: "mock-14", email: "tharwat14ahmed14@gmail.com", username: "احمد ثروت إبراهيم", role_id: "mechanical_team", is_online: false },
  { id: "mock-15", email: "nasefmohamad11@gmail.com", username: "ناصف محمد ناصف", role_id: "mechanical_team", is_online: false },
  { id: "mock-16", email: "zeademad800@gmail.com", username: "زياد عماد على", role_id: "research_data", is_online: false },
  { id: "mock-17", email: "roshankamal75@gmail.com", username: "م. روشان", role_id: "supervising_assistant", is_online: true },
  { id: "mock-18", email: "ask.shoaib@ymail.com", username: "أ.د. ابراهيم شعيب", role_id: "supervising_prof", is_online: true }
];

const FALLBACK_STATS = {
  totalUsers: 18,
  onlineUsersCount: 6,
  pendingTasks: 3,
  avgAiRating: 4.88,
  userAnalytics: [
    { username: "محمد حسين عبدالعزيز", activePercent: 98, role_id: "ceo" },
    { username: "عبدالرحمن على محمد", activePercent: 95, role_id: "software_tech" },
    { username: "فيلوباتير جورج وليم", activePercent: 94, role_id: "software_tech" },
    { username: "محمد منتصر محمد", activePercent: 96, role_id: "software_tech" },
    { username: "احمد ثروت إبراهيم", activePercent: 92, role_id: "mechanical_team" }
  ],
  chartData: [
    { date: '2026-05-16', totalMinutes: 240, activeUsers: 4 },
    { date: '2026-05-17', totalMinutes: 380, activeUsers: 6 },
    { date: '2026-05-18', totalMinutes: 310, activeUsers: 5 },
    { date: '2026-05-19', totalMinutes: 490, activeUsers: 8 },
    { date: '2026-05-20', totalMinutes: 420, activeUsers: 7 },
    { date: '2026-05-21', totalMinutes: 560, activeUsers: 9 },
    { date: '2026-05-22', totalMinutes: 510, activeUsers: 11 }
  ],
  taskStatusDistribution: [
    { name: 'Pending', value: 3, color: '#f97316' },
    { name: 'In Progress', value: 5, color: '#3b82f6' },
    { name: 'Completed', value: 10, color: '#10b981' }
  ],
  sessionLogs: [
    { id: 1, action: 'USER_LOGIN_SUCCESS', system: 'API_GATEWAY', user: 'محمد حسين عبدالعزيز', timestamp: '2026-05-22T19:52:58Z' },
    { id: 2, action: 'AI_MODEL_PREDICTION', system: 'ANALYSIS_UNIT', user: 'فيلوباتير جورج وليم', timestamp: '2026-05-22T19:50:12Z' },
    { id: 3, action: 'BACKEND_SYNC', system: 'TELEMETRY', user: 'عبدالرحمن على محمد', timestamp: '2026-05-22T19:48:44Z' }
  ]
};

export function AdminPanel() {
  const { user, token, hasPermission } = useAuth();
  const { isRTL } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'dashboard' | 'logs' | 'tasks' | 'models' | 'roles'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const socketRef = useRef<any>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const getMemberImage = (name: string) => {
    if (!name) return "";
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
    if (!name) return { age: null, desc: "" };
    const trimmedName = name.trim();
    
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
      "زياد عماد على": 22
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
      desc: details[trimmedName] || `${role} - عضو أساسي فائز برالي الروبوتات يساهم بفاعلية في أول منظومة فحص مصرية بالكامل للسكك الحديدية.`
    };
  };

  // User Management Filters & Sort
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSortField, setUserSortField] = useState<'username' | 'email' | 'created_at'>('username');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isAdminUploading, setIsAdminUploading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role_id: '',
    profile_picture: '',
    permissions: {
      pageAccess: ['dashboard'],
      actions: {
        canDownload: false,
        canUpload: false
      },
      isAdmin: false
    }
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      pageAccess: ['dashboard'],
      actions: {
        canDownload: false,
        canUpload: false
      },
      isAdmin: false
    }
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    assigned_role: '',
    due_date: '',
    deadline_time: '',
    status: 'pending'
  });

  const [taskFilters, setTaskFilters] = useState({
    status: 'all',
    assignee: 'all',
    role: 'all'
  });

  const [modelForm, setModelForm] = useState({
    name: '',
    category: 'Drone Parts',
    version: 'V1.0',
    engineer: user?.username || ''
  });
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const availablePages = [
    { id: 'dashboard', label: isRTL ? 'لوحة التحكم' : 'Dashboard' },
    { id: 'analysis', label: isRTL ? 'مركز التحليل' : 'Analysis Center' },
    { id: 'map', label: isRTL ? 'خريطة المواقع' : 'Site Map' },
    { id: 'history', label: isRTL ? 'سجل الفحص' : 'Inspection Log' },
    { id: 'maintenance', label: isRTL ? 'جدول الصيانة' : 'Maintenance Tasks' },
    { id: 'reports', label: isRTL ? 'التقارير' : 'Reports' },
    { id: 'team', label: isRTL ? 'فريق العمل' : 'Work Team' },
    { id: 'live', label: isRTL ? 'المسح المباشر' : 'Live Scanner' },
    { id: '3d_models', label: isRTL ? 'مكتبة التصميمات' : '3D Models Library' },
    { id: 'db_training', label: isRTL ? 'إدارة قواعد البيانات والتدريب' : 'Data & AI Training' },
    { id: 'inventory', label: isRTL ? 'المخازن وقطع الغيار' : 'Inventory & Spare Parts' },
    { id: 'media', label: isRTL ? 'المركز الإعلامي والتوثيق' : 'Media & Documentation' },
    { id: 'admin-users', label: isRTL ? 'إدارة المستخدمين' : 'User Management' },
  ];

  const applyPreset = (role: any) => {
    setFormData({
      ...formData,
      role_id: role.id,
      permissions: role.permissions
    });
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      username: user.username,
      password: '',
      role_id: user.role_id || '',
      profile_picture: user.profile_picture || '',
      permissions: user.permissions
    });
    setActiveSubTab('users');
    setMsg(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      email: '', 
      username: '', 
      password: '', 
      role_id: '',
      profile_picture: '',
      permissions: {
        pageAccess: ['dashboard'],
        actions: { canDownload: false, canUpload: false },
        isAdmin: false
      }
    });
    setMsg(null);
  };

  const togglePage = (pageId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        pageAccess: prev.permissions.pageAccess.includes(pageId)
          ? prev.permissions.pageAccess.filter(p => p !== pageId)
          : [...prev.permissions.pageAccess, pageId]
      }
    }));
  };

  const toggleAction = (action: 'canDownload' | 'canUpload') => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        actions: {
          ...prev.permissions.actions,
          [action]: !prev.permissions.actions[action]
        }
      }
    }));
  };

  const toggleRolePage = (pageId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        pageAccess: prev.permissions.pageAccess.includes(pageId)
          ? prev.permissions.pageAccess.filter(p => p !== pageId)
          : [...prev.permissions.pageAccess, pageId]
      }
    }));
  };

  const toggleRoleAction = (action: 'canDownload' | 'canUpload') => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        actions: {
          ...prev.permissions.actions,
          [action]: !prev.permissions.actions[action]
        }
      }
    }));
  };

  const fetchData = async () => {
    try {
      // 1. Fetch Users
      try {
        const usersRes = await fetch(getApiUrl('/api/users'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (usersRes.ok) {
          const uData = await usersRes.json();
          setUsers(Array.isArray(uData) && uData.length > 0 ? uData : FALLBACK_USERS);
        } else {
          setUsers(FALLBACK_USERS);
        }
      } catch (e) {
        console.warn("Using fallback users due to error:", e);
        setUsers(FALLBACK_USERS);
      }

      // 2. Fetch Roles
      try {
        const rolesRes = await fetch(getApiUrl('/api/roles'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (rolesRes.ok) {
          const rData = await rolesRes.json();
          setRoles(Array.isArray(rData) && rData.length > 0 ? rData : FALLBACK_ROLES);
        } else {
          setRoles(FALLBACK_ROLES);
        }
      } catch (e) {
        console.warn("Using fallback roles due to error:", e);
        setRoles(FALLBACK_ROLES);
      }

      // 3. Fetch Stats
      try {
        const statsRes = await fetch(getApiUrl('/api/admin/stats'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData && typeof sData === 'object' ? sData : FALLBACK_STATS);
        } else {
          setStats(FALLBACK_STATS);
        }
      } catch (e) {
        console.warn("Using fallback stats due to error:", e);
        setStats(FALLBACK_STATS);
      }

      // 4. Fetch Tasks
      try {
        const tasksRes = await fetch(getApiUrl('/api/engineering/tasks'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          setTasks(Array.isArray(tData) ? tData : []);
        }
      } catch (e) {
        console.warn("Could not load tasks, using empty or existing list", e);
      }

      // 5. Fetch Logs
      try {
        const logsRes = await fetch(getApiUrl('/api/audit-logs'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setActivityLogs(Array.isArray(lData) ? lData : []);
        }
      } catch (e) {
        console.warn("Could not load audit logs", e);
      }

      // 6. Fetch Models
      try {
        const modelsRes = await fetch(getApiUrl('/api/admin/models'), { headers: { 'Authorization': `Bearer ${token}` } });
        if (modelsRes.ok) {
          const mData = await modelsRes.json();
          setModels(Array.isArray(mData) ? mData : []);
        }
      } catch (e) {
        console.warn("Could not load models", e);
      }

    } catch (err) {
      console.error("General failure in fetchData, falling back to all defaults", err);
      setUsers(FALLBACK_USERS);
      setRoles(FALLBACK_ROLES);
      setStats(FALLBACK_STATS);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? window.location.origin : '');
    
    if (!socketUrl) {
      console.error('Backend URL is missing in VITE_API_URL environment variable. Real-time updates disabled.');
      return;
    }

    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket');
      if (user?.id) {
        socket.emit('login', user.id);
      }
    });

    socket.on('active_users_count', (count: number) => {
      setActiveUsersCount(count);
    });

    socket.on('user_status_change', () => {
      fetchData(); // Refresh list when someone's status changes
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.id]);

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'error', text: isRTL ? "حجم الصورة يجب أن لا يتجاوز 2 ميجابايت" : "Image size should not exceed 2MB" });
      return;
    }

    setIsAdminUploading(true);
    setMsg(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, profile_picture: base64String }));
      setMsg({ type: 'success', text: isRTL ? "تم تحميل الصورة بنجاح" : "Profile picture loaded" });
      setIsAdminUploading(false);
    };
    reader.onerror = () => {
      setMsg({ type: 'error', text: isRTL ? "حدث خطأ أثناء قراءة الملف" : "Error reading file" });
      setIsAdminUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMsg({ type: 'success', text: editingId ? (isRTL ? 'تم تحديث الموظف' : 'Asset Synced') : (isRTL ? 'تم إنشاء الموظف' : 'Asset Deployed') });
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        setMsg({ type: 'error', text: error.error || 'Operation failed' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error' });
    }
  };

  const handleDelete = async (userId: string | number, userName: string) => {
    if (user?.id === userId) {
      setMsg({ type: 'error', text: isRTL ? 'لا يمكنك حذف حسابك الحالي' : 'You cannot delete your own account' });
      return;
    }
    if (!window.confirm(isRTL ? `هل أنت متأكد من حذف ${userName}؟` : `Are you sure you want to delete ${userName}?`)) return;
    
    try {
      const res = await fetch(getApiUrl(`/api/users/${userId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: 'success', text: isRTL ? 'تم الحذف بنجاح' : 'Asset terminated' });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to delete' });
    }
  };

  const handleCreateTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const url = editingTaskId ? `/api/engineering/tasks/${editingTaskId}` : '/api/engineering/tasks';
      const method = editingTaskId ? 'PUT' : 'POST';
      
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        setTaskForm({ title: '', description: '', assigned_to: '', assigned_role: '', due_date: '', deadline_time: '', status: 'pending' });
        setEditingTaskId(null);
        setIsTaskModalOpen(false);
        setMsg({ type: 'success', text: editingTaskId ? (isRTL ? 'تم تحديث المهمة' : 'Directive Updated') : (isRTL ? 'تم تكليف المهمة بنجاح' : 'Directive Committed') });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process task' });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      assigned_role: task.assigned_role || '',
      due_date: task.due_date || '',
      deadline_time: task.deadline_time || '',
      status: task.status
    });
    setMsg(null);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Purge this directive?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: 'success', text: isRTL ? 'تم حذف المهمة' : 'Directive Erased' });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to delete task' });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = taskFilters.status === 'all' || task.status === taskFilters.status;
    const assigneeMatch = taskFilters.assignee === 'all' || 
                         (task.assigned_to === taskFilters.assignee);
    const roleMatch = taskFilters.role === 'all' || task.assigned_role === taskFilters.role;
    return statusMatch && assigneeMatch && roleMatch;
  });

  const isCEO = user?.role_id === 'ceo';
  const isSupervisor = user?.role_id === 'supervising_prof' || user?.role_id === 'supervising_assistant';
  const canMutate = isCEO;

  if (!hasPermission('admin')) return <div className="p-8 text-center text-red-500 font-bold uppercase tracking-widest">{isRTL ? "غير مصرح لك بدخول هذه الصفحة" : "Access Denied - Admins Only"}</div>;

  return (
    <div className="p-6 space-y-8 bg-slate-950/20 min-h-screen">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{isRTL ? "مركز إدارة النظام" : "System Control Center"}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{isRTL ? "لوحة التحكم الشاملة والمراقبة" : "Comprehensive industrial oversight"}</p>
          </div>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white/5 flex gap-1">
          {[
            { id: 'dashboard', label: isRTL ? 'الإحصائيات' : 'Stats', icon: BarChart3 },
            { id: 'users', label: isRTL ? 'الفريق' : 'Team', icon: Users },
            { id: 'roles', label: isRTL ? 'الأدوار' : 'Roles', icon: Shield },
            { id: 'tasks', label: isRTL ? 'المهام' : 'Tasks', icon: CheckCircle },
            { id: 'models', label: isRTL ? 'التصميمات' : '3D Models', icon: Library },
            { id: 'logs', label: isRTL ? 'السجلات' : 'Logs', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                activeSubTab === tab.id ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 py-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                msg.type === 'success' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" : "bg-red-500/10 text-red-500 shadow-red-500/10"
              )}>
                {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                  {msg.type === 'success' ? (isRTL ? "تم بنجاح" : "SYSTEM_SUCCESS") : (isRTL ? "خطأ في النظام" : "SYSTEM_FAILURE")}
                </p>
                <p className="text-white font-black italic uppercase tracking-tighter text-sm">{msg.text}</p>
              </div>
            </div>
            <button 
              onClick={() => setMsg(null)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Role Form */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl h-fit">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
              <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-600/20">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              {editingRoleId ? (isRTL ? "تعديل الصلاحية" : "Edit Role Profile") : (isRTL ? "إضافة صلاحية جديدة" : "New Security Layer")}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "اسم الصلاحية" : "Role Identifier"}</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  value={roleForm.name}
                  onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                  placeholder="MECHANICAL_COMMAND"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "الوصف" : "Operational Intent"}</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all h-24 placeholder:text-slate-600 resize-none"
                  value={roleForm.description}
                  onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                  placeholder="Describe the access context..."
                />
              </div>
              
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">
                    {isRTL ? "بروتوكول الوصول" : "System Node Access"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePages.map(page => (
                      <label key={page.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox"
                            className="peer appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                            checked={roleForm.permissions.pageAccess.includes(page.id)}
                            onChange={() => toggleRolePage(page.id)}
                          />
                          <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter transition-colors">{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">
                    {isRTL ? "أذونات الإجراءات" : "Action Clearances"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        className="appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                        checked={roleForm.permissions.actions.canDownload}
                        onChange={() => toggleRoleAction('canDownload')}
                      />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter">{isRTL ? "تنزيل التقارير" : "Can Download"}</span>
                    </label>
                    <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        className="appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                        checked={roleForm.permissions.actions.canUpload}
                        onChange={() => toggleRoleAction('canUpload')}
                      />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter">{isRTL ? "رفع البيانات" : "Can Upload"}</span>
                    </label>
                  </div>
                </div>

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 transition-all cursor-pointer group hover:bg-red-500/10">
                  <input 
                    type="checkbox"
                    className="appearance-none w-5 h-5 rounded-lg border-2 border-red-500/20 checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer"
                    checked={roleForm.permissions.isAdmin}
                    onChange={() => setRoleForm({...roleForm, permissions: {...roleForm.permissions, isAdmin: !roleForm.permissions.isAdmin}})}
                  />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] italic group-hover:text-red-400">
                    {isRTL ? "صلاحيات مدير نظام" : "MASTER ADMIN CLEARANCE"}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    const url = editingRoleId ? `/api/roles/${editingRoleId}` : '/api/roles';
                    const method = editingRoleId ? 'PUT' : 'POST';
                    const res = await fetch(getApiUrl(url), {
                      method,
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(editingRoleId ? roleForm : { ...roleForm, id: `role_${Date.now()}`, isCustom: true })
                    });
                    
                    if (res.ok) {
                      setEditingRoleId(null);
                      setRoleForm({ name: '', description: '', permissions: { pageAccess: ['dashboard'], actions: { canDownload: false, canUpload: false }, isAdmin: false } });
                      fetchData();
                    }
                  } }
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all italic"
                  disabled={!roleForm.name}
                >
                  {editingRoleId ? (isRTL ? "تحديث" : "Commit Changes") : (isRTL ? "حفظ" : "Initialize Role")}
                </button>
                {editingRoleId && (
                  <button onClick={() => { setEditingRoleId(null); setRoleForm({ name: '', description: '', permissions: { pageAccess: ['dashboard'], actions: { canDownload: false, canUpload: false }, isAdmin: false } }); }} className="px-6 py-3 bg-white/5 text-slate-400 rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    {isRTL ? "إلغاء" : "Abort"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Roles List */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/5 overflow-hidden h-fit">
            <div className="p-8 border-b border-white/5 font-black bg-white/[0.02] flex justify-between items-center italic">
              <span className="text-white uppercase tracking-tighter">{isRTL ? "الأدوار المتاحة" : "Security Schemas"}</span>
              <span className="text-[10px] text-blue-500 font-mono font-black uppercase border border-blue-500/20 px-3 py-1 rounded-full">{roles.length} LOADED</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01] text-slate-500 font-black uppercase text-[10px] tracking-widest">
                  <tr className={isRTL ? "text-right" : ""}>
                    <th className="px-8 py-5 border-b border-white/5">{isRTL ? "الدور" : "Identitier"}</th>
                    <th className="px-8 py-5 border-b border-white/5">{isRTL ? "الصلاحيات" : "Authorization Scope"}</th>
                    <th className="px-8 py-5 border-b border-white/5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {roles.map(role => (
                    <tr key={role.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className={isRTL ? "text-right" : ""}>
                          <p className="font-black text-white italic flex items-center gap-2 uppercase tracking-tighter">
                            {role.name}
                            {!role.isCustom && <Shield className="w-3 h-3 text-blue-500" />}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 max-w-[240px] truncate">{role.description}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                          <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-tighter border border-white/5">
                            {role.permissions.pageAccess.length} NODES
                          </span>
                          {role.permissions.isAdmin && (
                            <span className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20 italic">ADMIN</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingRoleId(role.id);
                              setRoleForm({
                                name: role.name,
                                description: role.description,
                                permissions: role.permissions
                              });
                            }}
                            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {role.id !== 'ceo' && role.id !== user?.role_id && (
                            <button 
                              onClick={async () => {
                                if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الصلاحية؟ سيتم نقل الموظفين المرتبطين بها تلقائياً للقسم البرمجي.' : 'Erase this security schema? Users assigned to this role will be reassigned to the Tech team.')) return;
                                const res = await fetch(getApiUrl(`/api/roles/${role.id}`), {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (res.ok) {
                                  fetchData();
                                } else {
                                  const err = await res.json();
                                  setMsg({ type: 'error', text: err.error || 'Failed to delete role' });
                                }
                              }}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'dashboard' && stats && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Level System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-12 h-12 text-white" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "إجمالي الكادر" : "Total Personnel"}</p>
              <h4 className="text-4xl font-black text-white italic tracking-tighter">{stats.totalUsers}</h4>
              <div className="mt-4 h-1 w-12 bg-blue-600 rounded-full" />
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "نشط حالياً" : "Operations Online"}</p>
              <div className="flex items-end gap-2">
                <h4 className="text-4xl font-black text-emerald-500 italic tracking-tighter">{activeUsersCount}</h4>
                <span className="text-[10px] text-slate-600 font-bold font-mono pb-1">LIVE_SIGNALS</span>
              </div>
              <div className="mt-4 h-1 w-12 bg-emerald-500/30 rounded-full" />
            </div>
            
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "دقة النظام" : "AI Reliability"}</p>
              <div className="flex items-end gap-2">
                <h4 className="text-4xl font-black text-blue-500 italic tracking-tighter">{(stats.avgAiRating * 20).toFixed(1)}%</h4>
              </div>
              <div className="mt-4 h-1 w-12 bg-blue-500/30 rounded-full" />
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "مهام معلقة" : "System Backlog"}</p>
              <h4 className="text-4xl font-black text-orange-500 italic tracking-tighter">{stats.pendingTasks}</h4>
              <div className="mt-4 h-1 w-12 bg-orange-500/30 rounded-full" />
            </div>
          </div>

          {/* Real-time Monitoring Table */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
            <div className={`p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">
                  {isRTL ? "مراقبة نشاط الكادر المباشر" : "LIVE PERSONNEL TELEMETRY"}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                  {isRTL ? "تتبع الحالة ومدة الجلسة والمسؤولية" : "REAL-TIME SESSION TRACKING & OPERATIONAL STATUS"}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{activeUsersCount} ONLINE</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01] text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                  <tr className={isRTL ? "text-right" : ""}>
                    <th className="px-8 py-5">{isRTL ? "الموظف" : "Personnel Asset"}</th>
                    <th className="px-8 py-5">{isRTL ? "الدور" : "Operational Role"}</th>
                    <th className="px-8 py-5">{isRTL ? "الحالة" : "Status Signal"}</th>
                    <th className="px-8 py-5">{isRTL ? "آخر دخول" : "Last Intersection"}</th>
                    <th className="px-8 py-5">{isRTL ? "مدة الجلسة" : "Session Uptime"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.userAnalytics?.map((u: any) => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors leading-none">
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border",
                            u.is_online ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-slate-500"
                          )}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="font-black text-white uppercase tracking-tighter italic text-sm">{u.username}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono mt-1">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-blue-500/5 text-blue-500 text-[9px] font-black uppercase tracking-widest italic border border-blue-500/10 whitespace-nowrap">
                          {roles.find(r => r.id === u.role_id)?.name || u.role_id}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", u.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-700")} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", u.is_online ? "text-emerald-500" : "text-slate-600")}>
                            {u.is_online ? "Active" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn("flex flex-col gap-1", isRTL ? 'items-end' : '')}>
                          <p className="text-[10px] text-white font-black uppercase tracking-tighter">
                            {u.last_login ? new Date(u.last_login).toLocaleTimeString() : '---'}
                          </p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'NEVER_LOGGED'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn("flex items-center gap-2", isRTL ? 'flex-row-reverse' : '')}>
                          <p className={cn("font-mono font-black text-sm italic tracking-tighter", u.is_online ? "text-white" : "text-slate-700")}>
                            {u.is_online ? (
                              <>
                                {Math.floor(u.session_duration / 60)}m {u.session_duration % 60}s
                              </>
                            ) : "00:00:00"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart */}
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">
                     {isRTL ? "مؤشر النشاط الأسبوعي" : "Weekly Operational Uptime"}
                   </h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isRTL ? "إجمالي دقائق العمل في الـ 7 أيام الماضية" : "Total operational minutes over 7 days"}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/50" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MINUTES_ENGAGED</span>
                 </div>
               </div>

               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData || []}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                      />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                                  {label}
                                </p>
                                <div className="space-y-1">
                                  <div className="text-white font-black italic uppercase tracking-tighter text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    {isRTL ? "دقائق النشاط" : "UPTIME"}: {payload[0].value}m
                                  </div>
                                  {payload[1] && (
                                    <div className="text-emerald-500 font-black italic uppercase tracking-tighter text-xs flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                      {isRTL ? "مستخدمون نشطون" : "ACTIVE_NODES"}: {payload[1].value}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalMinutes" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        animationDuration={2000}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="activeUsers" 
                        name="Users"
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#10b981' }}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Task Status Distribution (Pie Chart) */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl relative">
               <h3 className="text-lg font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-4 mb-6">
                 {isRTL ? "توزيع المهام حسب الحالة" : "Dispatch Distribution"}
               </h3>
               
               <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.taskStatusDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { color: '#64748b' }, // Pending
                          { color: '#3b82f6' }, // In Progress
                          { color: '#10b981' }  // Completed
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-3 gap-2 mt-4">
                 {(stats.taskStatusDistribution || []).map((item: any, i: number) => (
                   <div key={i} className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate">{item.name}</p>
                     <p className="text-lg font-black text-white italic">{item.value}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Historical Session Telemetry Table */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden min-h-[400px]">
            <div className={`p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">
                  {isRTL ? "سجل الجلسات التاريخي" : "HISTORICAL SESSION TELEMETRY"}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                  {isRTL ? "الأرشيف الكامل للدخول والخروج للجلسات الفعالة والمنتهية" : "FULL ARCHIVE OF SESSION START, TERMINATION, AND DEVICE METRICS"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black bg-blue-600/20 text-blue-500 border border-blue-500/30 px-3 py-1 rounded-lg uppercase tracking-widest italic">
                  AUDIT_VERIFIED
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01] text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                  <tr className={isRTL ? "text-right" : ""}>
                    <th className="px-8 py-5 font-black uppercase tracking-widest">{isRTL ? "الموظف" : "Personnel Asset"}</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest">{isRTL ? "الجهاز" : "Source Device"}</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest">{isRTL ? "البدء" : "Intersection Start"}</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest">{isRTL ? "الانتهاء" : "Session End"}</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest">{isRTL ? "المدة" : "Engagement Duration"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(stats.sessionLogs || []).map((log: any) => (
                    <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors leading-none">
                      <td className="px-8 py-5">
                        <p className="font-black text-white uppercase tracking-tighter italic text-xs">{log.username}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {log.device.toLowerCase().includes('phone') ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Laptop className="w-3.5 h-3.5 text-blue-500" />}
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[200px]">{log.device}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] text-white font-mono font-bold tracking-widest">
                        {log.login_at ? new Date(log.login_at).toLocaleString() : '---'}
                      </td>
                      <td className="px-8 py-5 text-[10px] text-slate-400 font-mono font-bold tracking-widest">
                        {log.logout_at ? new Date(log.logout_at).toLocaleString() : '---'}
                      </td>
                      <td className="px-8 py-5">
                         <span className="px-3 py-1 rounded-lg bg-white/5 text-blue-500 text-[9px] font-black uppercase font-mono tracking-widest border border-white/5 italic">
                           {Math.floor(log.duration_seconds / 60)}M {log.duration_seconds % 60}S
                         </span>
                      </td>
                    </tr>
                  ))}

                  {(stats.sessionLogs || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">
                        {isRTL ? "لا توجد سجلات مؤرشفة" : "NO ARCHIVED TELEMETRY FOUND"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personnel Mission Matrix */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
               
               <div className={`flex items-center justify-between mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                 <div>
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">
                     {isRTL ? "مصفوفة توزيع المهام والمسؤوليات" : "DUTY DISTRIBUTION MATRIX"}
                   </h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isRTL ? "توزيع الأدوار بناءً على الخبرات والقدرات" : "Personnel mapping by technical expertise"}</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all flex items-center gap-2">
                       <Search className="w-3 h-3" />
                       {isRTL ? "بحث في الموظفين" : "Filter Assets"}
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { name: "محمد حسين عبدالعزيز", role: isRTL ? "الرئيس التنفيذي / قائد المشروع" : "CEO / Project Leader", detail: isRTL ? "الوصول الكامل للنظام، اتخاذ القرارات الإستراتيجية." : "Full project strategic & operational control.", icon: "👑" },
                   { name: "أ.د. ابراهيم شعيب", role: isRTL ? "الأستاذ المشرف" : "Supervising Professor", detail: isRTL ? "المكلف الأكاديمي والاطلاع الشامل على التقارير والبيانات." : "Academic oversight & master data auditing.", icon: "🎓" },
                   { name: "م. روشان", role: isRTL ? "مساعد مشرف" : "Supervising Assistant", detail: isRTL ? "الناحية الأكاديمية والعلمية ومتابعة تقدم المجموعات." : "Technical supervision & academic coordination.", icon: "🔬" },
                   { name: "محمد محمد عبدالله", role: isRTL ? "مدير التصميم ثلاثي الأبعاد" : "3D & Design Manager", detail: isRTL ? "مسؤول عن جميع التصاميم والنماذج والمطبوعات ثلاثية الأبعاد." : "Master architect of all 3D digital twins.", icon: "📐" },
                   { name: "نورة شحاتة محمد", role: isRTL ? "مدير المشاريع والبيانات" : "Data & Lifecycle Manager", detail: isRTL ? "إدارة هيكلية المشروع ومراجعة البيانات والاتصالات." : "Telemetry & metadata cycle orchestration.", icon: "📊" },
                   { name: "فارس محمد صبري", role: isRTL ? "مسؤول الإعلام والتوثيق" : "Media & PR Lead", detail: isRTL ? "التنسيق الإعلامي وتوثيق التحركات والتقرير الخارجي." : "Documentation & communication strategy.", icon: "📸" },
                   { name: "شهد احمد هلال", role: isRTL ? "فريق البحث وجمع البيانات" : "Research & Field Team", detail: isRTL ? "جمع لأول مرة البيانات والمعلومات الميدانية." : "Primary harvesting of field telemetry.", icon: "🔎" },
                   { name: "محمد راوف عبده محمد", role: isRTL ? "فريق الميكانيكا والهاردوير" : "Mechanical Systems", detail: isRTL ? "التصميم الإنشائي والتركيبات الميكانيكية والأنظمة الصلبة." : "Structural design & assembly lead.", icon: "⚙️" },
                   { name: "بيتر هانى فوزى شحاتة", role: isRTL ? "مسؤول المكونات والقطع" : "Components Manager", detail: isRTL ? "إدارة المخزون وتوريد القطع اللازمة للفريق وسلسلة التوريد." : "Inventory & supply chain management.", icon: "🔌" },
                   { name: "عادل قدرى محمد", role: isRTL ? "فريق البحث وجمع البيانات" : "Research & Field Team", detail: isRTL ? "جمع لأول مرة البيانات والمعلومات الميدانية." : "Primary harvesting of field telemetry.", icon: "🔎" },
                   { name: "فيلوباتير جورج وليم", role: isRTL ? "فريق السوفت وير والتقنية" : "Software & Tech Team", detail: isRTL ? "تطوير الخوارزميات والذكاء الاصطناعي وواجهة المستخدم." : "AI algorithms & UI development.", icon: "💻" },
                   { name: "عبدالرحمن على محمد", role: isRTL ? "فريق السوفت وير والتقنية" : "Software & Tech Team", detail: isRTL ? "برمجة الأنظمة المدمجة ومعالجة البيانات السحابية." : "Embedded systems & cloud telemetry.", icon: "⚡" },
                   { name: "محمد منتصر محمد", role: isRTL ? "فريق السوفت وير والتقنية" : "Software & Tech Team", detail: isRTL ? "تطوير الواجهات المتقدمة وبرمجيات الذكاء الاصطناعي." : "Advanced UI & AI software architecture.", icon: "🖥️" },
                   { name: "حنين علاء على", role: isRTL ? "فريق البحث وجمع البيانات" : "Research & Field Team", detail: isRTL ? "تحليل العينات الميدانية وتوثيق النتائج البحثية." : "Field sample analysis & research documentation.", icon: "🧪" },
                   { name: "سلمي خالد محمود احمد", role: isRTL ? "فريق البحث وجمع البيانات" : "Research & Field Team", detail: isRTL ? "إدارة قواعد بيانات البحث والتحقق من صحة العينات." : "Research DB management & field verification.", icon: "🔬" },
                   { name: "احمد ثروت إبراهيم", role: isRTL ? "فريق الميكانيكا والهاردوير" : "Mechanical Systems", detail: isRTL ? "صيانة الأنظمة الميكانيكية والمعايرة الإنشائية." : "Mechanical maintenance & structural calibration.", icon: "🛠️" },
                   { name: "ناصف محمد ناصف", role: isRTL ? "فريق الميكانيكا والهاردوير" : "Mechanical Systems", detail: isRTL ? "تجميع النماذج الصلبة واختبارات التحمل الإنشائي." : "Hard-model assembly & stress testing.", icon: "🏗️" },
                   { name: "زياد عماد على", role: isRTL ? "فريق البحث وجمع البيانات" : "Research & Field Team", detail: isRTL ? "التوثيق الميداني والمساعدة في جمع البيانات الأولية." : "Field documentation & telemetry harvesting.", icon: "📡" }
                 ].map((item, i) => (
                   <div key={i} className="group relative bg-white/[0.03] hover:bg-white/[0.05] p-6 rounded-3xl border border-white/5 transition-all cursor-default">
                      <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                         <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                            {item.icon}
                         </div>
                         <div className={isRTL ? 'text-right' : ''}>
                           <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">{item.name}</h4>
                           <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest opacity-60">{item.role}</span>
                         </div>
                      </div>
                      <p className={cn("text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors h-12 overflow-hidden", isRTL ? "text-right" : "")}>
                        {item.detail}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                         <div className="flex gap-1 group-hover:opacity-100 opacity-20 transition-opacity">
                            {[1, 2, 3].map(dot => <div key={dot} className="w-1 h-1 rounded-full bg-blue-500" />)}
                         </div>
                         <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">{isRTL ? "بصمة الموظف النشطة" : "ACTIVE_ID_SIGNAL"}</span>
                      </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-12 p-8 bg-blue-600/5 border border-blue-500/10 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className={cn("space-y-1", isRTL ? "text-right" : "")}>
                    <h4 className="text-white font-black text-sm italic uppercase tracking-tighter">{isRTL ? "بيانات تتبع المشروع المباشرة" : "LIVE PROJECT TELEMETRY"}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isRTL ? "سجل النشاط الجاري لجميع أعضاء الفريق" : "Real-time activity stream for 18 deployed assets"}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-900/60 px-6 py-4 rounded-2xl border border-white/5 text-center">
                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{isRTL ? "المهام المنجزة" : "SUCCESS_RATE"}</p>
                       <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">84.2%</p>
                    </div>
                    <div className="bg-slate-900/60 px-6 py-4 rounded-2xl border border-white/5 text-center">
                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{isRTL ? "الاستجابة" : "RESPONSE_TIME"}</p>
                       <p className="text-2xl font-black text-blue-500 italic tracking-tighter">1.2s</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* System Clearances & Rules */}
            <div className="space-y-8">
               <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                  <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">
                    {isRTL ? "صلاحيات الوصول والتحكم:" : "SECURITY PRIVILEGE MAP"}
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: isRTL ? "أدوار النظام المحددة" : "Defined System Roles", count: 10, color: "text-blue-500" },
                      { label: isRTL ? "إجمالي الكوادر المفعّلة" : "Deployed Personnel", count: 18, color: "text-emerald-500" },
                      { label: isRTL ? "عقد الوصول النشطة" : "Active Access Nodes", count: 12, color: "text-orange-500" }
                    ].map((row, i) => (
                      <div key={i} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{row.label}</span>
                        <span className={cn("font-mono text-xl font-black italic", row.color)}>{row.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                    <p className={cn("text-[9px] text-slate-500 leading-relaxed italic", isRTL ? "text-right" : "")}>
                      {isRTL ? "تم إعداد 10 أدوار مختلفة داخل النظام، لكل منها واجهاته الخاصة وتوزيع الأدوار والصلاحيات (مثل الرفع، التحميل، أو التحكم الكامل)." : "System initialized with 10 immutable role profiles, each with strict interface routing and CRUD clearance levels."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-4">
                       <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2">
                         <Shield className="w-3 h-3" />
                         {isRTL ? "ميزات الذكاء الاصطناعي" : "AI ENFORCEMENT"}
                       </button>
                       <button className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                         {isRTL ? "تصفية المهام" : "FILTER TASKS"}
                       </button>
                    </div>
                  </div>
               </div>

               {/* Activity Pulse */}
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <History className="w-32 h-32 text-white" />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-4 opacity-80">{isRTL ? "حالة النظام" : "SYSTEM PULSE"}</h4>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                     <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{isRTL ? "مستقر - نشط" : "STABLE / ACTIVE"}</p>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white w-3/4 shadow-[0_0_10px_white]" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                 <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                   <Library className="w-5 h-5 text-indigo-400" />
                 </div>
                 {isRTL ? "مكتبة التصميمات المهندس" : "3D Component Repository"}
               </h3>
               <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                 {models.length} {isRTL ? "عناصر" : "BLUEPRINTS"}
               </span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01] text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    <tr className={isRTL ? "text-right" : ""}>
                      <th className="px-8 py-5 border-b border-white/5">{isRTL ? "اسم القطعة" : "Technical Identifier"}</th>
                      <th className="px-8 py-5 border-b border-white/5">{isRTL ? "الإصدار" : "Revision"}</th>
                      <th className="px-8 py-5 border-b border-white/5">{isRTL ? "التاريخ" : "Timestamp"}</th>
                      <th className="px-8 py-5 border-b border-white/5">{isRTL ? "المهندس" : "Lead Engineer"}</th>
                      <th className="px-8 py-5 border-b border-white/5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {models.map(model => (
                      <tr key={model.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-white/5 rounded-lg">
                                <Box className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                <p className="font-black text-white uppercase tracking-tighter italic">{model.name}</p>
                                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{model.category}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 font-mono text-[11px] text-slate-400 font-black">{model.version}</td>
                        <td className="px-8 py-5 text-[11px] text-slate-500 font-black uppercase tracking-tighter">{new Date(model.last_modified).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-black text-slate-300 text-xs uppercase tracking-widest italic">{model.engineer}</td>
                        <td className="px-8 py-5">
                           <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                 <Download className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (!window.confirm('Delete blueprint?')) return;
                                  // Pure client-side simulation
                                  setModels(prev => prev.filter(m => m.id !== model.id));
                                  setMsg({ type: 'success', text: isRTL ? 'تم حذف التصميم بنجاح' : 'Blueprint deleted successfully' });
                                }}
                                className="p-2.5 bg-red-500/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {models.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center text-slate-600 font-black uppercase tracking-[0.4em] text-xs h-full">{isRTL ? "لا توجد ملفات" : "Null Data Stream"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl h-fit space-y-6">
             <h3 className="text-lg font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
                <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-600/20">
                  <Plus className="w-5 h-5 text-blue-500" />
                </div>
                {isRTL ? "إضافة ملف جديد" : "Deploy Component"}
             </h3>
             <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "اسم القطعة" : "Component Name"}</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-bold uppercase tracking-tighter"
                    value={modelForm.name}
                    onChange={e => setModelForm({...modelForm, name: e.target.value})}
                    placeholder="CHASSIS_V2"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "التصنيف" : "Sub-System"}</label>
                  <select 
                    className="w-full bg-slate-800/80 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase tracking-tighter"
                    value={modelForm.category}
                    onChange={e => setModelForm({...modelForm, category: e.target.value})}
                  >
                     <option value="Drone Parts">Drone Technology</option>
                     <option value="Mounting">Mounting Systems</option>
                     <option value="3D Print">Additive Manufacturing</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "الإصدار" : "Revision"}</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none font-mono text-xs font-black uppercase"
                      value={modelForm.version}
                      onChange={e => setModelForm({...modelForm, version: e.target.value})}
                      placeholder="1.0.0-ALPHA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRTL ? "المهندس" : "Assigned Lead"}</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none font-black uppercase tracking-tighter text-xs"
                      value={modelForm.engineer}
                      onChange={e => setModelForm({...modelForm, engineer: e.target.value})}
                    />
                  </div>
               </div>
               <button 
                  onClick={async () => {
                    const res = await fetch(getApiUrl('/api/admin/models'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(modelForm)
                    });
                    if (res.ok) {
                      setModelForm({ name: '', category: 'Drone Parts', version: 'V1.0', engineer: user?.username || '' });
                      fetchData();
                    }
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.3em] hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all italic mt-4 disabled:opacity-50"
                  disabled={!modelForm.name}
               >
                  {isRTL ? "حفظ البيانات" : "Register Design"}
               </button>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3 italic font-black uppercase tracking-tighter text-white">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-500">
                  <Activity className="w-5 h-5" />
                </div>
                <h3>{isRTL ? "سجل نشاط النظام المتقدم" : "System Reality Stream"}</h3>
              </div>
              <button 
                onClick={() => {
                  fetch(getApiUrl('/api/admin/logs/clear'), { 
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  }).then(() => fetchData());
                }}
                className={cn("px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20", !hasPermission('action', 'canDelete') && "hidden")}
              >
                {isRTL ? "تصفير السجل" : "Purge Stream"}
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-[35px] before:w-px before:bg-white/5">
                {activityLogs.length > 0 ? activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-16 group">
                    <div className="absolute left-[24px] top-1.5 w-[22px] h-[22px] rounded-full bg-slate-900 border-4 border-slate-950 shadow-[0_0_10px_rgba(37,99,235,0.2)] group-hover:bg-blue-600 transition-all z-10" />
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group-hover:border-blue-500/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter italic bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{log.action}</span>
                           <span className="text-white font-black uppercase tracking-tighter text-xs italic">{log.username}</span>
                         </div>
                         <span className="text-[10px] text-slate-600 font-mono font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-24 text-center">
                    <History className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-700 font-black uppercase tracking-[0.4em] italic text-xs">{isRTL ? "السجل خالي تماماً" : "VACUUM_DETECTED"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Header Row with Dispatch Button */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-600/20 text-blue-500 shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    {isRTL ? "إدارة التكليفات الميدانية" : "Mission Command Registry"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] font-mono">
                      {isRTL ? "تتبع الأهداف وتوزيع المهام الحية" : "REAL_TIME_TACTICAL_DISTRIBUTION"}
                    </p>
                  </div>
                </div>
             </div>
             <button 
               onClick={() => setIsTaskModalOpen(true)}
               className="group flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all italic shadow-2xl hover:bg-blue-500 hover:text-white"
             >
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-all duration-500" />
               {isRTL ? "إضافة مهمة +" : "Dispatch Directive +"}
             </button>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden text-white">
            <div className={`p-8 border-b border-white/5 font-black bg-white/[0.02] italic text-white uppercase tracking-tighter flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>{isRTL ? "سجل التوجيهات العملياتية" : "Active Directive Matrix"}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{isRTL ? "الحالة" : "Filter Status"}:</span>
                  <select 
                    className="bg-transparent border-none text-white outline-none text-[10px] uppercase font-black tracking-tighter cursor-pointer"
                    value={taskFilters.status}
                    onChange={e => setTaskFilters({...taskFilters, status: e.target.value})}
                  >
                    <option value="all" className="bg-slate-900">{isRTL ? "الكل" : "ALL_UNITS"}</option>
                    <option value="pending" className="bg-slate-900">{isRTL ? "قيد الانتظار" : "QUEUED"}</option>
                    <option value="in-progress" className="bg-slate-900">{isRTL ? "جاري العمل" : "ACTIVE"}</option>
                    <option value="completed" className="bg-slate-900">{isRTL ? "مكتمل" : "SUCCESS"}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{isRTL ? "المسؤول" : "Personnel Asset"}:</span>
                  <select 
                    className="bg-transparent border-none text-white outline-none text-[10px] uppercase font-black tracking-tighter cursor-pointer"
                    value={taskFilters.assignee}
                    onChange={e => setTaskFilters({...taskFilters, assignee: e.target.value})}
                  >
                    <option value="all" className="bg-slate-900">{isRTL ? "الكل" : "COLLECTIVE"}</option>
                    <option value="unassigned" className="bg-slate-900">{isRTL ? "غير محدد" : "UNASSIGNED"}</option>
                    {Array.from(new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'UNASSIGNED'))).map(name => (
                      <option key={name} value={name} className="bg-slate-900 uppercase">{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01] text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                  <tr className={isRTL ? "text-right" : ""}>
                    <th className="px-8 py-6">{isRTL ? "المهمة والعنوان" : "Sector / Directive"}</th>
                    <th className="px-8 py-6">{isRTL ? "المورد البشري" : "Asset Tag"}</th>
                    <th className="px-8 py-6">{isRTL ? "الموعد" : "SLA_Deadline"}</th>
                    <th className="px-8 py-6">{isRTL ? "الحالة الحالية" : "Field Status"}</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-white italic uppercase tracking-tighter text-base">{task.title}</span>
                          {task.description && (
                            <span className="text-[10px] text-slate-600 font-medium line-clamp-1 max-w-xs">{task.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{task.assignee || 'UNASSIGNED'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-mono text-slate-400 font-black italic">{task.due_date}</span>
                           <span className="text-[8px] font-mono text-slate-600 font-black uppercase tracking-widest">{task.deadline_time}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic transition-all ${
                          task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 
                          task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)]' : 
                          'bg-white/5 text-slate-500 border border-white/10'
                        }`}>
                          {task.status === 'completed' ? (isRTL ? "مكتمل" : "SUCCESS") :
                           task.status === 'in-progress' ? (isRTL ? "جاري" : "ACTIVE") :
                           (isRTL ? "معلق" : "QUEUED")}
                        </span>
                        {task.report && (
                           <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20" title={task.report}>
                             <Activity className="w-3 h-3" />
                             <span className="text-[8px] font-black uppercase tracking-tighter italic">REPORT</span>
                           </div>
                        )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleEditTask(task)} 
                            className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                            title={isRTL ? "تعديل" : "Modify"}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)} 
                            className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                            title={isRTL ? "حذف" : "Purge"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-slate-800 font-black uppercase tracking-[0.5em] text-xs h-full italic">
                        {isRTL ? "لا توجد توجيهات مطابقة" : "NO_OPERATIONAL_DIRECTIVES_FOUND"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Form */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl h-fit">
            <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={cn("p-2 rounded-lg border", editingId ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-blue-600/10 border-blue-600/20 text-blue-500")}>
                  {editingId ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h3 className="font-black text-white italic uppercase tracking-tighter">
                  {editingId 
                    ? (isRTL ? "تعديل الموظف" : "Update Asset")
                    : (isRTL ? "إضافة عنصر جديد" : "Enlist Personnel")
                  }
                </h3>
              </div>
              {editingId && (
                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 italic">
                    {isRTL ? "نماذج سريعة للوظائف" : "Clearance Presets"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => applyPreset(role)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-lg text-[9px] font-black text-slate-400 hover:text-blue-500 transition-all uppercase tracking-tighter"
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Profile Picture Management directly in the Form for Admin */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center relative shadow-xl">
                        {formData.profile_picture || getMemberImage(formData.username) ? (
                          <img 
                            src={formData.profile_picture || getMemberImage(formData.username)} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-10 h-10 text-slate-500" />
                        )}
                        {isAdminUploading && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <label className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg cursor-pointer border-2 border-slate-900 z-20">
                        <Camera className="w-4 h-4" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleAdminImageUpload} 
                          disabled={isAdminUploading} 
                        />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isRTL ? "صورة الملف الشخصي" : "OPERATIONAL_AVATAR"}
                      </p>
                      {formData.profile_picture && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, profile_picture: '' }))}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 hover:underline"
                        >
                          {isRTL ? "حذف الصورة المخصصة" : "TERMINATE_AVATAR"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{isRTL ? "الدور الوظيفي" : "Operational Protocol"}</label>
                  <select 
                    className="w-full bg-slate-800/80 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter italic"
                    value={formData.role_id} 
                    onChange={e => {
                      const r = roles.find(role => role.id === e.target.value);
                      if (r) {
                        setFormData({
                          ...formData,
                          role_id: r.id,
                          permissions: r.permissions
                        });
                      } else {
                        setFormData({ ...formData, role_id: '' });
                      }
                    }}
                  >
                    <option value="" className="bg-slate-900 text-slate-500 uppercase font-black italic">{isRTL ? "صلاحيات مخصصة" : "CUSTOM_CLEARANCE"}</option>
                    {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900 font-black italic">{r.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{isRTL ? "البريد الإلكتروني" : "Comm Channel"}</label>
                  <input
                    type="email" required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] font-black transition-all italic placeholder:text-slate-700"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="UID@HQ.COM"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{isRTL ? "اسم المستخدم" : "Asset Identifier"}</label>
                  <input
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter italic transition-all placeholder:text-slate-700"
                    value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="PERSONNEL_X"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                    {isRTL ? "كلمة المرور" : "Security Key"}
                    {editingId && <span className="text-[10px] text-slate-600 mx-2 lowercase italic">[{isRTL ? "اتركها فارغة لعدم التغيير" : "retain current if blank"}]</span>}
                  </label>
                  <input
                    type="password" required={!editingId}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest transition-all"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="space-y-6 pt-4 border-t border-white/5">
                    <div>
                      <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">
                        {isRTL ? "بروتوكول الوصول للعقد" : "System Node Access"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {availablePages.map(page => (
                          <label key={page.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                            <input 
                              type="checkbox"
                              className="appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                              checked={formData.permissions.pageAccess.includes(page.id)}
                              onChange={() => togglePage(page.id)}
                            />
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter transition-colors">{page.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">
                        {isRTL ? "أذونات الإجراءات" : "Action Clearances"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                          <input 
                            type="checkbox"
                            className="appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                            checked={formData.permissions.actions.canDownload}
                            onChange={() => toggleAction('canDownload')}
                          />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter italic">{isRTL ? "تنزيل" : "Download"}</span>
                        </label>
                        <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                          <input 
                            type="checkbox"
                            className="appearance-none w-5 h-5 rounded-lg border-2 border-white/10 checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                            checked={formData.permissions.actions.canUpload}
                            onChange={() => toggleAction('canUpload')}
                          />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter italic">{isRTL ? "رفع" : "Upload"}</span>
                        </label>
                      </div>
                    </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 transition-all cursor-pointer group hover:bg-red-500/10">
                      <input 
                        type="checkbox"
                        className="appearance-none w-5 h-5 rounded-lg border-2 border-red-500/20 checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer"
                        checked={formData.permissions.isAdmin}
                        onChange={() => setFormData({...formData, permissions: {...formData.permissions, isAdmin: !formData.permissions.isAdmin}})}
                      />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] italic group-hover:text-red-400">
                        {isRTL ? "صلاحيات مدير النظام" : "FULL ADMIN CLEARANCE"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={!canMutate} className={cn("flex-1 py-4 rounded-xl font-black uppercase tracking-[0.3em] transition-all italic shadow-lg shadow-blue-600/20 disabled:opacity-50", editingId ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" : "bg-blue-600 hover:bg-blue-700 text-white")}>
                    {editingId ? (isRTL ? "تحديث الحساب" : "Sync Asset") : (isRTL ? "إنشاء الحساب" : "Deploy Asset")}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-black uppercase tracking-widest transition-colors italic">
                      {isRTL ? "إلغاء" : "Abort"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={isRTL ? "البحث عن موظف..." : "Search personnel..."}
                  className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-600"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter text-xs cursor-pointer"
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                >
                  <option value="all" className="bg-slate-900">{isRTL ? "جميع الأدوار" : "ALL_ROLES"}</option>
                  {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900 font-black italic">{r.name}</option>)}
                </select>
                
                <select 
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter text-xs cursor-pointer"
                  value={userSortField}
                  onChange={e => setUserSortField(e.target.value as any)}
                >
                  <option value="username" className="bg-slate-900">{isRTL ? "الاسم" : "SORT_NAME"}</option>
                  <option value="email" className="bg-slate-900">{isRTL ? "البريد" : "SORT_EMAIL"}</option>
                  <option value="created_at" className="bg-slate-900">{isRTL ? "تاريخ الانضمام" : "SORT_DATE"}</option>
                </select>

                <button 
                  onClick={() => setUserSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-white/5 border border-white/10 p-3 rounded-2xl text-slate-400 hover:text-white transition-all"
                >
                  <BarChart3 className={cn("w-5 h-5", userSortOrder === 'desc' ? "rotate-180" : "")} />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/5 overflow-hidden min-h-[600px]">
              <div className={`p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-4 italic ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-600/20 text-blue-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">{isRTL ? "فريق العمل" : "Team Directory"}</h3>
                </div>
                <span className="text-[10px] font-black bg-blue-600 text-white border border-blue-400/50 px-4 py-1.5 rounded-full italic tracking-widest">
                  {users.filter(u => {
                    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesRole = userRoleFilter === 'all' || u.role_id === userRoleFilter;
                    return matchesSearch && matchesRole;
                  }).length} MEMBERS
                </span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users
                  .filter(u => {
                    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesRole = userRoleFilter === 'all' || u.role_id === userRoleFilter;
                    return matchesSearch && matchesRole;
                  })
                  .sort((a, b) => {
                    const valA = (a[userSortField] || '').toString().toLowerCase();
                    const valB = (b[userSortField] || '').toString().toLowerCase();
                    if (userSortOrder === 'asc') return valA > valB ? 1 : -1;
                    return valA < valB ? 1 : -1;
                  })
                  .map(u => {
                    const role = roles.find(r => r.id === u.role_id);
                    const isOfficial = !role?.is_custom;
                    
                    return (
                      <div key={u.id} className="group bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[32px] p-8 hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden flex flex-col items-center">
                        {/* Status indicator */}
                        <div className={cn(
                          "absolute top-8 right-8 w-3 h-3 rounded-full border-2 border-slate-900",
                          u.is_online ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-700"
                        )} />
                        
                        <div className="relative mb-6">
                          <div className={cn(
                            "w-20 h-20 rounded-[24px] overflow-hidden flex items-center justify-center font-black text-3xl italic shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 relative",
                            u.is_online ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-slate-800/50 text-slate-500 border border-white/5"
                          )}>
                            {(u.profile_picture || getMemberImage(u.username)) && (
                              <img 
                                src={u.profile_picture || getMemberImage(u.username)} 
                                alt={u.username} 
                                className="w-full h-full object-cover absolute inset-0 z-10"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span className="font-black text-3xl italic">{u.username[0].toUpperCase()}</span>
                          </div>
                          {isOfficial && (
                             <div className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 rounded-lg shadow-lg border border-white/10 z-20">
                               <Shield className="w-3 h-3 text-white" />
                             </div>
                          )}
                        </div>
                        
                        <div className="text-center w-full space-y-4">
                          <div>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1 truncate group-hover:text-blue-400 transition-colors">{u.username}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono truncate px-4">{u.email}</p>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                             <span className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic border transition-all",
                               u.role_id === 'ceo' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                               u.role_id?.includes('supervising') ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                               u.role_id === 'software_tech' ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                               u.role_id === 'mechanical_team' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                               u.role_id === 'data_manager' || u.role_id === 'research_data' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                               u.role_id === 'media_team' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                               "bg-slate-800/50 text-slate-400 border-white/5 group-hover:border-blue-500/30"
                             )}>
                                {role?.name || u.role_id || "GUEST_ASSET"}
                             </span>
                          </div>

                          <p className="text-[11px] text-slate-500 group-hover:text-slate-400 leading-relaxed italic line-clamp-2 px-2 min-h-[32px] transition-colors">
                            {role?.description || (isRTL ? "عضو مساهم في المشروع" : "Project contributor and field asset")}
                          </p>
                        </div>

                        <div className="w-full h-px bg-white/5 my-6" />

                        <div className="flex items-center justify-center gap-3 w-full">
                          <button 
                            onClick={() => setSelectedUser(u)} 
                            className="flex-1 py-3 bg-white/5 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-emerald-500/20 italic"
                          >
                            {isRTL ? "معاينة الوحدة" : "Inspect Unit"}
                          </button>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => canMutate ? handleEdit(u) : setMsg({type: 'error', text: isRTL ? 'لا تملـك صلاحية التعديل' : 'Access Restricted'})} 
                              className="p-3 bg-white/5 hover:bg-blue-500/10 text-slate-500 hover:text-blue-500 rounded-xl transition-all border border-white/5 hover:border-blue-500/20"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => canMutate ? handleDelete(u.id, u.username) : setMsg({type: 'error', text: isRTL ? 'لا تملك صلاحية الحذف' : 'Locked'})} 
                              className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-white/5 hover:border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {users.length === 0 && (
                  <div className="col-span-full py-24 text-center text-slate-600 font-black uppercase tracking-[0.4em] text-xs">
                    {isRTL ? "قاعدة البيانات فارغة" : "NULL DATA SET"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Inspector Overlay */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
              <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                onClick={() => setSelectedUser(null)}
              />
              <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-8 right-8">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row h-full">
                  {/* Left Column: Basic Info & Role */}
                  <div className="lg:w-1/3 bg-white/[0.02] p-10 border-r border-white/5 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center text-3xl font-black text-blue-500 italic shadow-[0_0_40px_rgba(37,99,235,0.2)] mb-6 relative">
                      {(selectedUser.profile_picture || getMemberImage(selectedUser.username)) && (
                        <img 
                          src={selectedUser.profile_picture || getMemberImage(selectedUser.username)} 
                          alt={selectedUser.username} 
                          className="w-full h-full object-cover absolute inset-0 z-10"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-black text-3xl italic">{selectedUser.username[0].toUpperCase()}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{selectedUser.username}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-8">{selectedUser.email}</p>
                    
                    <div className="w-full space-y-4 pt-8 border-t border-white/5">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right w-full">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{isRTL ? "الدور المسند" : "Assigned Role"}</p>
                        <p className="text-white font-black uppercase italic tracking-tighter text-sm">
                          {roles.find(r => r.id === selectedUser.role_id)?.name || selectedUser.role_id || "CUSTOM"}
                        </p>
                      </div>
                      
                      {getMemberDetails(selectedUser.username, roles.find(r => r.id === selectedUser.role_id)?.name || selectedUser.role_id).age && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right w-full">
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{isRTL ? "السن" : "Age"}</p>
                          <p className="text-white font-black italic tracking-tighter text-sm">
                            {getMemberDetails(selectedUser.username, roles.find(r => r.id === selectedUser.role_id)?.name || selectedUser.role_id).age} {isRTL ? "عاماً" : "years old"}
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right w-full">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{isRTL ? "معرف الموظف" : "Asset User ID"}</p>
                        <p className="text-slate-400 font-mono text-[10px] font-bold overflow-hidden text-ellipsis">{selectedUser.id}</p>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right w-full">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{isRTL ? "نبذة وتفاصيل" : "Bio & Details"}</p>
                        <p className="text-slate-300 font-normal text-xs leading-relaxed max-h-[140px] overflow-y-auto">
                          {getMemberDetails(selectedUser.username, roles.find(r => r.id === selectedUser.role_id)?.name || selectedUser.role_id).desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Permissions & Activity */}
                  <div className="lg:w-2/3 p-10 space-y-10 overflow-y-auto max-h-[80vh]">
                    {/* Permissions Section */}
                    <div>
                      <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                        <Shield className="w-4 h-4" />
                        {isRTL ? "مصفوفة الصلاحيات" : "Authorization Matrix"}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-4">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-white/10 pb-2">{isRTL ? "الوصول للنظام" : "Node Access"}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.permissions?.pageAccess?.map((p: string) => (
                              <span key={p} className="px-3 py-1.5 bg-blue-600/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-blue-500/20 italic">
                                {p.replace(/-/g, ' ')}
                              </span>
                            )) || <span className="text-[9px] text-slate-600 italic">No access defined</span>}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-4">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-white/10 pb-2">{isRTL ? "أذونات الإجراءات" : "Action Rights"}</p>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white font-black uppercase tracking-tighter italic">{isRTL ? "الرفع" : "Upload Status"}</span>
                              <div className={cn("w-2 h-2 rounded-full", selectedUser.permissions?.actions?.canUpload ? "bg-emerald-500" : "bg-red-500")} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white font-black uppercase tracking-tighter italic">{isRTL ? "التحميل" : "Download Status"}</span>
                              <div className={cn("w-2 h-2 rounded-full", selectedUser.permissions?.actions?.canDownload ? "bg-emerald-500" : "bg-red-500")} />
                            </div>
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                              <span className="text-[10px] text-orange-500 font-black uppercase tracking-tighter italic">{isRTL ? "مسؤول نظام" : "Root Admin Key"}</span>
                              <div className={cn("w-3 h-3 rounded-md border border-orange-500/50", selectedUser.permissions?.isAdmin ? "bg-orange-500" : "bg-transparent")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Section */}
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                        <History className="w-4 h-4" />
                        {isRTL ? "سجل النشاط الأخير" : "Operational Activity Stream"}
                      </h4>
                      <div className="space-y-3">
                        {stats?.recentLogs?.filter((log: any) => log.user_id === selectedUser.id || log.actor === selectedUser.username).map((log: any) => (
                          <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/20 transition-all">
                            <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-emerald-500 transition-colors">
                              <History className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-white font-black uppercase tracking-tighter italic">{log.action}</span>
                                <span className="text-[9px] text-slate-600 font-bold font-mono">{new Date(log.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">{log.details}</p>
                            </div>
                          </div>
                        ))}
                        {stats?.recentLogs?.filter((log: any) => log.user_id === selectedUser.id || log.actor === selectedUser.username).length === 0 && (
                          <div className="p-12 text-center bg-white/[0.02] rounded-[32px] border border-dashed border-white/5">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic">{isRTL ? "لا يوجد نشاط مسجل مؤخراً" : "No synchronous activity detected"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Assignment Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden text-white"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-600/20 text-blue-500">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">
                      {editingTaskId ? (isRTL ? "تعديل التكليف" : "Modify Directive") : (isRTL ? "تكليف بمهمة جديدة" : "Dispatch Directive")}
                    </h3>
                 </div>
                 <button 
                   onClick={() => { setIsTaskModalOpen(false); setEditingTaskId(null); setTaskForm({ title: '', description: '', assigned_to: '', assigned_role: '', due_date: '', deadline_time: '', status: 'pending' }); }}
                   className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-all hover:text-white"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "عنوان المهمة" : "Mission Title"}</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase font-black tracking-tighter italic placeholder:text-slate-700"
                      value={taskForm.title}
                      onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="DEPLOY_UNIT_X"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "تعيين لموظف" : "Assign to Asset"}</label>
                    <select 
                      className="w-full bg-slate-800 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter"
                      value={taskForm.assigned_to}
                      onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value, assigned_role: ''})}
                    >
                      <option value="" className="bg-slate-900 text-slate-500 italic font-black uppercase tracking-widest">{isRTL ? "اختر موظفاً" : "SELECT_PERSONNEL"}</option>
                      {users.map(u => <option key={u.id} value={u.id} className="bg-slate-900 font-black uppercase">{u.username}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "تعيين لدور (كل الموظفين)" : "Assign to Vertical"}</label>
                    <select 
                      className="w-full bg-slate-800 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter"
                      value={taskForm.assigned_role}
                      onChange={e => setTaskForm({...taskForm, assigned_role: e.target.value, assigned_to: ''})}
                    >
                      <option value="" className="bg-slate-900 text-slate-500 italic font-black uppercase tracking-widest">{isRTL ? "اختر دوراً" : "SELECT_ROLE"}</option>
                      {roles.map(r => <option key={r.id} value={r.id} className="bg-slate-900 font-black uppercase">{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "الحالة الابتدائية" : "Initial Status"}</label>
                    <select 
                      className="w-full bg-slate-800 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase tracking-tighter"
                      value={taskForm.status}
                      onChange={e => setTaskForm({...taskForm, status: e.target.value})}
                    >
                      <option value="pending" className="bg-slate-900 text-slate-500 uppercase font-black italic">{isRTL ? "قيد الانتظار" : "QUEUED"}</option>
                      <option value="in-progress" className="bg-slate-900 text-blue-500 uppercase font-black italic">{isRTL ? "جاري العمل" : "ACTIVE"}</option>
                      <option value="completed" className="bg-slate-900 text-emerald-500 uppercase font-black italic">{isRTL ? "مكتمل" : "COMPLETED"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "تفاصيل وشرح المهمة" : "Operational Briefing"}</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-700 resize-none h-32"
                    value={taskForm.description}
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="Provide clear instructions for the field operative..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "تاريخ التسليم" : "Target Date"}</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-black"
                      value={taskForm.due_date}
                      onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{isRTL ? "وقت التسليم" : "Deadline Time"}</label>
                    <input 
                      type="time" 
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-black"
                      value={taskForm.deadline_time}
                      onChange={e => setTaskForm({...taskForm, deadline_time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.01] flex gap-4">
                 <button 
                   onClick={() => { setIsTaskModalOpen(false); setEditingTaskId(null); }}
                   className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all italic text-xs border border-white/5"
                 >
                   {isRTL ? "إلغاء النافذة" : "Abort Transaction"}
                 </button>
                 <button 
                   onClick={() => handleCreateTask()}
                   className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all italic text-xs shadow-2xl shadow-blue-600/30 disabled:opacity-50"
                   disabled={!taskForm.title}
                 >
                   {editingTaskId ? (isRTL ? "حفظ التعديلات" : "Commit Changes") : (isRTL ? "تكليف الموظف / إرسال" : "Dispatch Personnel Task")}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
