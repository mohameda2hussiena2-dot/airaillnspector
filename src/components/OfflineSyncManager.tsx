import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface OfflineToast {
  id: string;
  type: 'online' | 'offline' | 'queued' | 'synced';
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}

export function OfflineSyncManager() {
  const { isRTL } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [toasts, setToasts] = useState<OfflineToast[]>([]);

  const addToast = (
    type: OfflineToast['type'],
    titleEn: string,
    titleAr: string,
    descEn: string,
    descAr: string
  ) => {
    const newToast: OfflineToast = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      titleEn,
      titleAr,
      descEn,
      descAr,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast(
        'online',
        'System is Back Online',
        'تم استعادة الاتصال بالإنترنت',
        'Local queue operations will now synchronize automatically.',
        'سيتم الآن مزامنة جميع عمليات المهام المعلقة تلقائيًا.'
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast(
        'offline',
        'System Offline Mode Active',
        'الحالة: العمل دون اتصال بأمان',
        'Telemetry insights & task logs are being cached in local secure storage.',
        'واجهات الفحص، وسجل المهام والتقارير تعمل بالكامل محليًا.'
      );
    };

    const handleQueued = () => {
      addToast(
        'queued',
        'Action Cached Locally',
        'تم حفظ التعديل أوفلاين',
        'Your transaction has been securely queued. It will sync once network is restored.',
        'تم حفظ تعديل المهمة أو التقرير مؤقتًا وسيتم رفعها فور عودة الشبكة.'
      );
    };

    const handleReplayed = () => {
      addToast(
        'synced',
        'Synchronization Completed',
        'اكتملت المزامنة الخلفية بنجاح',
        'All offline cached task mutations have been successfully synced with the server.',
        'تم إرسال كافة التعديلات، وجداول الصيانة وتقارير العمل المخزنة محليًا للمخدم.'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-offline-queued', handleQueued);
    window.addEventListener('sw-replay-success', handleReplayed);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-offline-queued', handleQueued);
      window.removeEventListener('sw-replay-success', handleReplayed);
    };
  }, []);

  return (
    <>
      {/* Small floating pulse indicator in the corner of the screen */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none items-end">
        {/* Connection status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-lg ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400 font-black animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>{isRTL ? 'متصل' : 'ONLINE'}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>{isRTL ? 'أوفلاين' : 'OFFLINE'}</span>
            </>
          )}
        </motion.div>

        {/* Floating Toasts container */}
        <div className="flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`p-4 rounded-xl border shadow-xl flex gap-3 backdrop-blur-xl transition-all duration-300 ${
                  toast.type === 'online'
                    ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                    : toast.type === 'offline'
                    ? 'bg-slate-950/95 border-amber-500/30 text-amber-100'
                    : toast.type === 'queued'
                    ? 'bg-sky-950/90 border-sky-500/30 text-sky-100'
                    : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-100'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {toast.type === 'online' && (
                    <div className="p-1 px-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Wifi className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === 'offline' && (
                    <div className="p-1 px-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                      <WifiOff className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === 'queued' && (
                    <div className="p-1 px-1.5 bg-sky-500/20 rounded-lg text-sky-400">
                      <Database className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === 'synced' && (
                    <div className="p-1 px-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <h4 className={`text-xs font-extrabold tracking-tight leading-none ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? toast.titleAr : toast.titleEn}
                  </h4>
                  <p className={`text-[10px] text-slate-400 mt-1 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? toast.descAr : toast.descEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
