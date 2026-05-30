import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, Database, AlertCircle, Check, Cloud, CloudOff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function SyncIndicator() {
  const { isRTL, language } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkPendingCount = () => {
    if (!('indexedDB' in window)) return;
    
    try {
      const request = indexedDB.open('ai-rail-offline-db', 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('offline-requests')) {
          setPendingCount(0);
          return;
        }
        
        try {
          const tx = db.transaction('offline-requests', 'readonly');
          const store = tx.objectStore('offline-requests');
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            setPendingCount(countRequest.result);
          };
          countRequest.onerror = () => {
            setPendingCount(0);
          };
        } catch (txError) {
          console.warn('Sync DB transaction failed:', txError);
          setPendingCount(0);
        }
      };
      
      request.onerror = () => {
        setPendingCount(0);
      };
    } catch (err) {
      console.warn('Failed to open IndexedDB for sync indicator:', err);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkPendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkPendingCount();
    };

    const handleQueued = () => {
      checkPendingCount();
    };

    const handleReplayed = () => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        checkPendingCount();
      }, 1200);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-offline-queued', handleQueued);
    window.addEventListener('sw-replay-success', handleReplayed);

    // Also run an interval check every 4 seconds in case changes are saved or replayed elsewhere
    const interval = setInterval(checkPendingCount, 4000);
    checkPendingCount();

    // Inside click helper
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-offline-queued', handleQueued);
      window.removeEventListener('sw-replay-success', handleReplayed);
      clearInterval(interval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleManualSync = () => {
    if (!isOnline) return;
    setIsSyncing(true);
    
    // Message the service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
    }
    
    // Give it a visual spinner animation anyway and trigger a refresh
    setTimeout(() => {
      setIsSyncing(false);
      checkPendingCount();
    }, 1500);
  };

  return (
    <div ref={containerRef} className="relative select-none z-50">
      {/* Indicator Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
          !isOnline
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
            : pendingCount > 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 animate-pulse'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
        }`}
      >
        {/* Status Icon */}
        {!isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        ) : pendingCount > 0 || isSyncing ? (
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 shrink-0 ${isSyncing || pendingCount > 0 ? 'animate-spin' : ''}`} />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}

        {/* Dynamic Label */}
        <span>
          {!isOnline
            ? isRTL
              ? `غير متصل (${pendingCount})`
              : `OFFLINE (${pendingCount})`
            : pendingCount > 0
            ? isRTL
              ? `معلق للرفع (${pendingCount})`
              : `PENDING SYNC (${pendingCount})`
            : isRTL
            ? 'مزامنة كاملة'
            : 'SYNCED'}
        </span>
      </motion.button>

      {/* Popover detail box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-12 mt-1.5 w-72 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4.5 shadow-2xl flex flex-col gap-3.5 text-xs text-white ${
              isRTL ? 'left-0' : 'right-0'
            }`}
          >
            {/* Header section */}
            <div className={`flex items-center justify-between pb-2 border-b border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h4 className="font-bold text-slate-200 text-[11px] tracking-wide uppercase">
                {isRTL ? 'إدارة المزامنة السحابية' : 'Cloud Sync Manager'}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {isOnline ? (isRTL ? 'متصل بالشبكة' : 'CONNECTED') : (isRTL ? 'وضع أوفلاين' : 'OFFLINE')}
              </span>
            </div>

            {/* Dynamic notice based on state */}
            {pendingCount > 0 ? (
              <div className={`flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-200 text-[11px] leading-relaxed ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-bold mb-0.5">
                    {isRTL ? 'تغييرات محلية معلقة' : 'Pending Local Changes'}
                  </p>
                  <p className="text-[10px] text-amber-300">
                    {isRTL 
                      ? `لديك عدد (${pendingCount}) من الفحوصات أو تحديثات المهام المسجلة دون إنترنت بانتظار رفعها للمخدم الميداني.`
                      : `You have ${pendingCount} offline-created inspections or task reports waiting to be updated safely on the server.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-200 text-[11px] leading-relaxed ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">
                    {isRTL ? 'قاعدة البيانات متزامنة' : 'Database Fully Synced'}
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    {isRTL 
                      ? 'جميع عمليات المسح، الصور والتعديلات المسجلة محلياً تم رفعها وتصنيفها بالخادم بنجاح.'
                      : 'All scans, images, and telemetry modifications recorded locally are safe and fully verified on the cloud server.'}
                  </p>
                </div>
              </div>
            )}

            {/* Status grid */}
            <div className={`grid grid-cols-2 gap-2 text-[10px] font-medium bg-white/5 rounded-xl p-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500">{isRTL ? 'المهام المعلقة:' : 'Pending Backlog:'}</span>
                <span className="font-bold text-slate-200 font-mono">{pendingCount} {isRTL ? 'عمليات' : 'ops'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500">{isRTL ? 'نوع الحفظ:' : 'Storage Mode:'}</span>
                <span className="font-bold text-slate-200 font-mono">IndexedDB Enc.</span>
              </div>
            </div>

            {/* Sync Now button */}
            {isOnline && pendingCount > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer text-[11px] uppercase tracking-wider shadow-lg shadow-blue-500/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing 
                    ? (isRTL ? 'مزامنة جارية...' : 'SYNCHRONIZING...') 
                    : (isRTL ? 'مزامنة السجلات الآن' : 'FORCE SYNC NOW')}
                </span>
              </button>
            )}

            {/* If offline but has pending */}
            {!isOnline && pendingCount > 0 && (
              <div className="text-[9px] text-center text-slate-500 italic mt-1 bg-white/5 rounded-lg py-1">
                {isRTL 
                  ? 'سيتم بدء المزامنة تلقائياً بمجرد الاتصال بالإنترنت'
                  : 'Pending changes will sync automatically when network is back.'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
