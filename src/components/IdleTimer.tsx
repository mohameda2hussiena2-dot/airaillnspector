import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Clock, LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const COUNTDOWN_TIME = 60; // 60 seconds

export function IdleTimer() {
  const { user, logout } = useAuth();
  const { isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    setShowModal(false);
    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (showModal) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(COUNTDOWN_TIME);
    }, IDLE_TIMEOUT);
  }, [showModal]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  useEffect(() => {
    if (showModal) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showModal, handleLogout]);

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: COUNTDOWN_TIME, ease: "linear" }}
              className="h-full bg-blue-500"
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>

            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
              {isRTL ? "انتهت فترة النشاط" : "Session Expiring"}
            </h2>
            <p className="text-sm text-slate-400 font-medium mb-8">
              {isRTL 
                ? `سيتم تسجيل خروجك تلقائياً خلال ${countdown} ثانية لحماية بياناتك.`
                : `You will be logged out automatically in ${countdown} seconds due to inactivity.`}
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetTimer();
                }}
                className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/10"
              >
                {isRTL ? "البقاء متصلاً" : "Stay Active"}
              </button>
              <button
                onClick={handleLogout}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {isRTL ? "خروج الآن" : "Logout Now"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
