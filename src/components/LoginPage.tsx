import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ChevronRight, ShieldCheck, TrainFront, Box, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { getMockUser } from '../constants/users';

interface LoginPageProps {
  onBack?: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { login } = useAuth();
  const { isRTL } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const email = formData.email.toString().toLowerCase().trim();
    const password = formData.password.toString().trim();

    try {
      await login(email, password);
      // Success will trigger onAuthStateChanged and navigate automatically
    } catch (err: any) {
      console.error("Login attempt failed", err);
      // Clean, professional user-facing error messages in Arabic & English
      const code = err.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError(isRTL ? "بيانات الاعتماد غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور." : "Invalid credentials. Please verify your email and password.");
      } else if (code === "auth/invalid-email") {
        setError(isRTL ? "صيغة البريد الإلكتروني المدخل غير صالحة." : "The entered email format is invalid.");
      } else if (code === "auth/too-many-requests") {
        setError(isRTL ? "تم حظر محاولات الدخول مؤقتاً لكثرة المحاولات الخاطئة. يرجى المحاولة لاحقاً." : "Login temporarily blocked due to too many failed attempts. Please try again later.");
      } else if (code === "auth/user-disabled") {
        setError(isRTL ? "هذا الحساب معطل حالياً من قِبل المشرف." : "This account has been disabled by the administrator.");
      } else {
        setError(isRTL ? "حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى إعادة المحاولة." : err.message || "An unexpected login error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-sm font-bold uppercase tracking-widest">{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </button>
        )}
        <div className="text-center mb-8">
          {/* Project Logo Group */}
          <div className="relative inline-flex items-center justify-center mb-6">
             <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 transform -rotate-6">
                <TrainFront className="w-12 h-12 text-white" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-xl">
                <Box className="w-5 h-5 text-blue-400" />
             </div>
          </div>

          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            فحص السكك الحديدية
          </h1>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-blue-500 uppercase tracking-widest px-4 py-1 bg-blue-500/10 rounded-full inline-block mx-auto mb-4 border border-blue-500/20">
              مرحباً بك في المنصة الذكية
            </p>
            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
              النظام المتكامل لإدارة عمليات فحص وصيانة السكك الحديدية بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pr-12 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pr-12 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              <span className="absolute left-0 pl-6 flex items-center group-hover:translate-x-1 transition-transform">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </span>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isRTL ? 'جاري تسجيل الدخول...' : 'Signing In...'}</span>
                </div>
              ) : (
                isRTL ? 'تسجيل الدخول' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 font-mono">
              نظام التحكم في الصلاحيات v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
