import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Camera, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Laptop, Smartphone, Globe, LogOut,
  Phone, Briefcase, FileText, Edit2, Save, X, Building, Quote, Sparkles, MessageSquare, Heart, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getUserEmoji } from '../constants/users';

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

export function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const { isRTL, t } = useLanguage();
  const [profileData, setProfileData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Edit fields states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setEditFullName(user.fullName || '');
      setEditUsername(user.username || '');
      setEditPhone(user.phone || '');
      setEditDepartment(user.department || '');
      setEditBio(user.bio || '');
      // Mock sessions
      setActiveSessions([
        { id: '1', device: 'Desktop - Chrome (HQ)', ip: '192.168.1.105', last_active: new Date().toISOString() },
        { id: '2', device: 'Mobile - iOS (Personnel Unit)', ip: '10.0.0.42', last_active: new Date().toISOString() }
      ]);
    }
  }, [user]);

  const startEditing = () => {
    if (profileData) {
      setEditFullName(profileData.fullName || '');
      setEditUsername(profileData.username || '');
      setEditPhone(profileData.phone || '');
      setEditDepartment(profileData.department || '');
      setEditBio(profileData.bio || '');
    }
    setIsEditing(true);
    setMsg(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      setMsg({ type: 'error', text: isRTL ? "اسم المستخدم مطلوب" : "Username is required" });
      return;
    }
    setIsSaving(true);
    setMsg(null);
    try {
      const updatedFields = {
        fullName: editFullName,
        username: editUsername,
        phone: editPhone,
        department: editDepartment,
        bio: editBio
      };
      await updateUser(updatedFields);
      setProfileData((prev: any) => ({ ...prev, ...updatedFields }));
      setMsg({
        type: 'success',
        text: isRTL ? "تم تحديث معلوماتك الشخصية بنجاح" : "Your personal profile was updated successfully"
      });
      setIsEditing(false);
    } catch (err) {
      setMsg({
        type: 'error',
        text: isRTL ? "حدث خطأ أثناء تحديث البيانات" : "An error occurred while updating profile info"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchProfile = async () => {
    // Simulated: user is already in state via AuthContext
    if (user) setProfileData(user);
  };

  const fetchSessions = async () => {
    // Simulated sessions
  };

  const handleLogoutAll = async () => {
    if (!confirm(isRTL ? "هل أنت متأكد من تسجيل الخروج من جميع الأجهزة الأخرى؟" : "Are you sure you want to log out from all other devices?")) return;
    
    setMsg({ type: 'success', text: isRTL ? "تم تسجيل الخروج من جميع الأجهزة" : "Logged out from all devices" });
    setActiveSessions([]);
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    setMsg(null);
    setTimeout(() => {
      setMsg({ 
        type: 'success', 
        text: isRTL 
          ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${user?.email}` 
          : `A password reset link has been sent to ${user?.email}` 
      });
      setIsResetting(false);
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size to keep base64 representation concise and prevent memory bottlenecks
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'error', text: isRTL ? "حجم الصورة يجب أن لا يتجاهل 2 ميجابايت" : "Image size should not exceed 2MB" });
      return;
    }

    setIsUploading(true);
    setMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateUser({ profile_picture: base64String } as any);
        setProfileData((prev: any) => ({ ...prev, profile_picture: base64String }));
        setMsg({ type: 'success', text: isRTL ? "تم تحديث الصورة بنجاح" : "Profile picture updated successfully" });
      } catch (err) {
        setMsg({ type: 'error', text: isRTL ? "فشل في تحديث الصورة" : "Failed to update profile picture" });
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setMsg({ type: 'error', text: isRTL ? "حدث خطأ أثناء قراءة الملف" : "Error reading file" });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const roleLabel = profileData.role_name || (profileData.permissions.isAdmin ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "عضو فريق" : "Team Member"));
  const userEmoji = getUserEmoji(profileData.username, profileData.role_id || profileData.roleId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-100/50 transition-colors duration-500" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
              {profileData.profile_picture || getUserPicture(profileData.username) ? (
                <img src={profileData.profile_picture || getUserPicture(profileData.username)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            {userEmoji && (
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-slate-900 border-2 border-white rounded-xl flex items-center justify-center text-xl shadow-lg z-20" title={roleLabel}>
                {userEmoji}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors cursor-pointer border-2 border-white">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>

          <div className="text-center md:text-right flex-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
              {profileData.fullName || profileData.username}
            </h2>
            {profileData.fullName && (
              <p className="text-slate-400 font-extrabold text-xs mb-1">@{profileData.username}</p>
            )}
            <p className="text-slate-500 font-medium mb-4">{profileData.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                <Shield className="w-3" />
                {roleLabel}
              </div>
              {profileData.department && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                  <Building className="w-3" />
                  {profileData.department}
                </div>
              )}
            </div>
          </div>
        </div>

        {msg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-8 flex items-center gap-3 p-4 rounded-2xl border",
              msg.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
            )}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-bold">{msg.text}</span>
          </motion.div>
        )}
      </div>

      {/* Personal Information (Sleek Bento-style Card) */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50/20 to-indigo-50/20 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl" />
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">
                {isRTL ? "المعلومات الشخصية" : "Personal Information"}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium leading-none">
                {isRTL ? "إدارة وتعديل بيانات الاتصال والهوية الشخصية والنبذة" : "Manage your contact profile details, bio and department"}
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل البيانات" : "Edit Details"}</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Full Name */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-0.5">
                    {isRTL ? "الاسم الكامل" : "Full Name"}
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {profileData.fullName || (isRTL ? "غير محدد" : "Not specified")}
                  </p>
                </div>
              </div>

              {/* Username */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 flex items-center justify-center font-black text-sm">
                  @
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-0.5">
                    {isRTL ? "اسم المستخدم" : "Username"}
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {profileData.username}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-0.5">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {profileData.phone || (isRTL ? "غير محدد" : "Not specified")}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-0.5">
                    {isRTL ? "القسم / الإدارة" : "Department"}
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {profileData.department || (isRTL ? "غير محدد" : "Not specified")}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-blue-50/20 to-indigo-50/20 border border-indigo-100/30 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-500 shrink-0 mt-1">
                  <Quote className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">
                    {isRTL ? "النبذة التعريفية" : "Short Biography"}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                    {profileData.bio || (isRTL ? "لا توجد نبذة تعريفية مضافة حتى الآن. قم بإضافة نبذة لتعريف زملائك بدورك." : "No biography added yet. Update your profile to describe your role with other members.")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="edit"
              onSubmit={handleSaveProfile}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-10 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full name input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 pl-1">
                    {isRTL ? "الاسم الكامل (يظهر رئيسياً)" : "Full Name (Main Display)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:bg-white"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder={isRTL ? "أدخل اسمك الكامل..." : "Enter your full name..."}
                    />
                  </div>
                </div>

                {/* Username input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 pl-1">
                    {isRTL ? "اسم المستخدم (فريد)" : "Username (Unique handle)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none font-bold text-sm">
                      @
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:bg-white"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder={isRTL ? "اسم المستخدم..." : "Username..."}
                    />
                  </div>
                </div>

                {/* Phone input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 pl-1">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:bg-white"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                    />
                  </div>
                </div>

                {/* Department input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 pl-1">
                    {isRTL ? "القسم أو الإدارة" : "Department"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl py-3 ltr pl-10 pr-4 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:bg-white"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      placeholder={isRTL ? "مثال: ميكانيكا، برمجيات، إدارة..." : "E.g. Engineering, Operations..."}
                    />
                  </div>
                </div>

                {/* Bio text area */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 pl-1">
                    {isRTL ? "النبذة التعريفية والدور" : "Short biography & primary role"}
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-3 text-slate-400 pointer-events-none">
                      <Quote className="w-4 h-4" />
                    </div>
                    <textarea
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:bg-white resize-none"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder={isRTL ? "عبر باختصار عن دورك في الفريق، المسؤوليات، ومجال اهتمامك..." : "Share a short bio, your main responsibilities and what you are focusing on..."}
                    />
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{isRTL ? "إلغاء" : "Cancel"}</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isRTL ? "حفظ التعديلات" : "Save Changes"}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Info Area */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            {isRTL ? "معلومات الحساب" : "Account Information"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                {isRTL ? "اسم المستخدم" : "Username"}
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-bold">
                <User className="w-4 h-4 text-slate-400" />
                {profileData.username}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                {isRTL ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-bold">
                <Mail className="w-4 h-4 text-slate-400" />
                {profileData.email}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                {isRTL ? "الأمان" : "Security"}
              </label>
              <button 
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-bold hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all disabled:opacity-50 group"
              >
                {isResetting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                )}
                {isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Permissions & Access */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 lg:col-span-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            {isRTL ? "الأجهزة النشطة" : "Active Devices"}
          </h3>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/sess">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  {session.device.toLowerCase().includes('phone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">{session.device}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-slate-500 font-bold font-mono tracking-widest">{session.ip}</p>
                  </div>
                </div>
              </div>
            ))}

            {activeSessions.length === 0 && (
              <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {isRTL ? "لا توجد أجهزة نشطة أخرى" : "No other active devices"}
                </p>
              </div>
            )}

            <button 
              onClick={handleLogoutAll}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-600/20"
            >
              <LogOut className="w-4 h-4" />
              {isRTL ? "تسجيل الخروج من جميع الأجهزة" : "Logout from All Devices"}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">{isRTL ? "صلاحية الرفع" : "Upload Access"}</span>
                <div className={cn("w-2.5 h-2.5 rounded-full", profileData.permissions?.actions?.canUpload ? "bg-emerald-500" : "bg-red-500")} />
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">{isRTL ? "صلاحية التحميل" : "Download Access"}</span>
                <div className={cn("w-2.5 h-2.5 rounded-full", profileData.permissions?.actions?.canDownload ? "bg-emerald-500" : "bg-red-500")} />
             </div>
          </div>
        </div>

        {/* New CEO Insights Section */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 lg:col-span-1">
           <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-white/5 pb-4">
            {isRTL ? "نظرة عامة للمدير" : "CEO Insights"}
          </h3>
          
          <div className="space-y-4">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isRTL ? "إجمالي الكوادر" : "Total Personnel"}</p>
                <p className="text-2xl font-black text-white italic">06 <span className="text-xs opacity-40">Registered</span></p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isRTL ? "عمليات التحليل" : "System Analyses"}</p>
                <p className="text-2xl font-black text-blue-500 italic">242 <span className="text-xs opacity-40 uppercase">Records</span></p>
             </div>
             <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{isRTL ? "تنبيهات النظام" : "System Alerts"}</p>
                <p className="text-2xl font-black text-white italic">02 <span className="text-xs opacity-40 uppercase">Critical</span></p>
             </div>
          </div>
          
          <div className="pt-4 text-center">
             <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black leading-relaxed">
               {isRTL 
                 ? "أنت متصل بصلاحيات المدير التنفيذي الكاملة. جميع الأنظمة تحت إشرافك المباشر." 
                 : "Connected with Full CEO Privileges. All systems under direct supervision."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
