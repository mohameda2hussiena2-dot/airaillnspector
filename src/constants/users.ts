
import { User } from '../types';

export const getUserEmoji = (username?: string, roleId?: string): string => {
  if (!username) return "";
  const name = username.trim();
  switch (name) {
    case "محمد حسين عبدالعزيز": return "👑";
    case "أ.د. ابراهيم شعيب": return "🎓";
    case "أ.د. محمد مرسي الجوهري": return "🎓";
    case "أ.د. علاء عرفة": return "🎓";
    case "م. روشان": return "🔬";
    case "محمد محمد عبدالله": return "🎨";
    case "نورة شحاتة محمد": return "📊";
    case "فارس محمد صبري": return "📸";
    case "شهد احمد هلال": return "🔎";
    case "محمد راوف عبده محمد": return "⚙️";
    case "بيتر هانى فوزى شحاتة": return "🔌";
    case "عادل قدرى محمد": return "🔎";
    case "فيلوباتير جورج وليم": return "💻";
    case "عبدالرحمن على محمد": return "⚡";
    case "محمد منتصر محمد": return "🖥️";
    case "حنين علاء على": return "🧪";
    case "سلمى خالد محمود احمد":
    case "سلمي خالد محمود احمد": return "🔬";
    case "احمد ثروت إبراهيم": return "🛠️";
    case "ناصف محمد ناصف": return "🏗️";
    case "زياد عماد على": return "📡";
    default:
      if (roleId === 'ceo' || roleId === 'admin') return "👑";
      if (roleId === 'supervising_prof' || roleId === 'academic') return "🎓";
      if (roleId === 'supervising_assistant') return "🔬";
      return "🛠️";
  }
};

export const ROLE_PERMISSIONS: Record<string, any> = {
  academic: {
    name: 'الأستاذ المشرف الأكاديمي',
    description: 'بوابة الإشراف الأكاديمي - مراجعة الإحصائيات الفنية والتقارير المعتمدة وتحميل الـ PDF والخرائط',
    pageAccess: ['dashboard', 'reports', 'map', 'history', '3d_models', 'media'],
    actions: { canUpload: false, canDownload: true },
    isAdmin: false
  },
  admin: {
    name: 'بوابة الإدارة والقيادة',
    description: 'الإشراف الإداري والقيادي الكامل وتتبع جميع المؤشرات وإدارة شمل المحاكاة والنظام',
    pageAccess: ['dashboard', 'live', 'map', 'analysis', 'history', 'maintenance', 'reports', 'team', '3d_models', 'db_training', 'inventory', 'media', 'admin-users', 'admin', 'crew_intercom'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: true
  },
  engineer: {
    name: 'بوابة المهندسين والفنيين',
    description: 'المسح والمطابقة الميدانية الذكية وإدارة مهام الصيانة والتشغيل ومتابعة الأعطال الفنية والاتصالات',
    pageAccess: ['live', 'analysis', 'maintenance', 'dashboard', 'map', '3d_models', 'db_training', 'inventory', 'media', 'crew_intercom'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: false
  },
  ceo: {
    name: 'الرئيس التنفيذي / قائد المشروع',
    description: 'يمكنك الوصول الكامل لجميع صلاحيات النظام',
    pageAccess: ['dashboard', 'live', 'map', 'analysis', 'history', 'maintenance', 'reports', 'team', '3d_models', 'db_training', 'inventory', 'media', 'admin-users'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: true
  },
  supervising_prof: {
    name: 'الأستاذ المشرف الأكاديمي',
    description: 'واجهة مخصصة لعرض الإحصائيات ومراجعة التقارير المعتمدة وتحميل الـ PDF',
    pageAccess: ['dashboard', 'reports'],
    actions: { canUpload: false, canDownload: true },
    isAdmin: false
  },
  supervising_assistant: {
    name: 'مساعد مشرف',
    description: 'يدأب في العمل والأكاديمية ومتابعة تقدم الفرق',
    pageAccess: ['dashboard', 'live', 'map', 'analysis', 'history', 'maintenance', 'reports', 'team', '3d_models', 'db_training', 'inventory', 'media'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: true
  },
  three_d_manager: {
    name: 'مدير التصميم ثلاثي الأبعاد',
    description: 'مسؤول عن جميع التصاميم ثلاثية الأبعاد ونماذج الهندسة',
    pageAccess: ['3d_models', 'live', 'dashboard'],
    actions: { canUpload: true, canDownload: false },
    isAdmin: false
  },
  data_manager: {
    name: 'مدير المشاريع والبيانات',
    description: 'إدارة حياة المشروع وكشف البيانات والتعليقات',
    pageAccess: ['db_training', 'analysis', 'reports', 'team', 'dashboard', 'live', 'map', 'history', 'maintenance', '3d_models', 'inventory', 'media'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: false
  },
  software_tech: {
    name: 'فريق السوفت وير والتقنية',
    description: 'تطوير الخوارزميات والذكاء الاصطناعي وواجهة المستخدم',
    pageAccess: ['dashboard', 'live', 'analysis', '3d_models', 'map'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: false
  },
  mechanical_team: {
    name: 'فريق الميكانيكا والهاردوير',
    description: 'التصميم الإنشائي والتركيبات الميكانيكية والأنظمة الصلبة',
    pageAccess: ['maintenance', 'history', 'live', 'inventory', 'dashboard'],
    actions: { canUpload: true, canDownload: false },
    isAdmin: false
  },
  research_data: {
    name: 'فريق البحث وجمع البيانات',
    description: 'جمع العينات والبحث العلمي وتحليل البيانات الأولية',
    pageAccess: ['dashboard', 'history', 'reports', 'map'],
    actions: { canUpload: false, canDownload: true },
    isAdmin: false
  },
  media_team: {
    name: 'فريق التنسيق والميديا',
    description: 'التوثيق الإعلامي وتنسيق التواصل الخارجي والداخلي',
    pageAccess: ['media', 'reports', 'dashboard', 'live', 'team'],
    actions: { canUpload: true, canDownload: true },
    isAdmin: false
  },
  components_manager: {
    name: 'مسؤول المكونات والقطع',
    description: 'إدارة المخزون وتوريد القطع اللازمة للفريق',
    pageAccess: ['inventory', 'maintenance', 'dashboard'],
    actions: { canUpload: true, canDownload: false },
    isAdmin: false
  }
};

export const MOCK_USERS = [
  // 1. بوابة الإدارة والقيادة (role: admin)
  { email: "mohameda2hussiena2@gmail.com", username: "محمد حسين عبدالعزيز", role: "admin", password: "mohameda2hussiena2@gmail.com" },
  { email: "nourashehata135@gmail.com", username: "نورة شحاتة محمد", role: "admin", password: "nourashehata135@gmail.com" },
  { email: "roshankamal75@gmail.com", username: "م. روشان", role: "admin", password: "roshankamal75@gmail.com" },

  // 2. بوابة الإشراف الأكاديمي (role: academic)
  { email: "elgohary.president@ymail.com", username: "أ.د. محمد مرسي الجوهري", role: "academic", password: "elgohary.president@ymail.com" },
  { email: "arafa.dean@ymail.com", username: "أ.د. علاء عرفة", role: "academic", password: "arafa.dean@ymail.com" },
  { email: "ask.shoaib@ymail.com", username: "أ.د. ابراهيم شعيب", role: "academic", password: "ask.shoaib@ymail.com" },

  // 3. بوابة المهندسين والفنيين (role: engineer)
  // فريق الهاردوير والميكانيكا
  { email: "tharwat14ahmed14@gmail.com", username: "احمد ثروت إبراهيم", role: "engineer", password: "30401190202592" },
  { email: "hanypeter620@gmail.com", username: "بيتر هانى فوزى شحاتة", role: "engineer", password: "30205020201059" },
  { email: "nasefmohamad11@gmail.com", username: "ناصف محمد ناصف", role: "engineer", password: "30201011847358" },
  { email: "m7oha4medr5aouf5@gmail.com", username: "محمد راوف عبده محمد", role: "engineer", password: "30409181501278" },
  { email: "hdhd89060@gmail.com", username: "محمد محمد عبدالله", role: "engineer", password: "30407113300334" },
  
  // فريق السوفت وير
  { email: "felopatereltop@gmail.com", username: "فيلوباتير جورج وليم", role: "engineer", password: "30207300202355" },
  { email: "mohamedmontaser218@gmail.com", username: "محمد منتصر محمد", role: "engineer", password: "30408210201371" },
  { email: "abdogazy444@gmail.com", username: "عبدالرحمن على محمد", role: "engineer", password: "30401010206692" },

  // فريق البحث والبيانات
  { email: "hannenalaa30@gmail.com", username: "حنين علاء على", role: "engineer", password: "30303280202565" },
  { email: "salmakahaled42@gmail.com", username: "سلمي خالد محمود احمد", role: "engineer", password: "30406140202348" },
  { email: "shahdahmedabbas9@gmail.com", username: "شهد احمد هلال", role: "engineer", password: "30401221801821" },
  { email: "zeademad800@gmail.com", username: "زياد عماد على", role: "engineer", password: "30502250201095" },
  { email: "adelkadryabodonia@gmail.com", username: "عادل قدرى محمد", role: "engineer", password: "30408061500239" },

  // فريق التنسيق والميديا
  { email: "fa01029489007@gmail.com", username: "فارس محمد صبري", role: "engineer", password: "30308081803152" }
];

export const getMockUser = (email: string): User | null => {
  const mock = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!mock) return null;
  return {
    id: `mock-${mock.email}`,
    email: mock.email,
    username: mock.username,
    roleId: mock.role,
    permissions: ROLE_PERMISSIONS[mock.role]
  };
};
