import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div id="auth-loading-screen" className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Cyberpunk grid backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(to_top,rgba(6,182,212,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        {/* Technical spinner core */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute w-11 h-11 border-4 border-indigo-500/10 border-b-indigo-500 rounded-full animate-spin [animation-duration:1.5s]" />
          <div className="absolute w-6 h-6 border-2 border-emerald-500/15 border-r-emerald-400 rounded-full animate-spin [animation-duration:0.8s]" />
        </div>

        {/* Dynamic technical messaging */}
        <div className="flex flex-col items-center gap-1.5 text-center relative z-10">
          <span className="text-cyan-400 font-black tracking-widest text-[11px] uppercase animate-pulse">
            جاري التحقق من الهوية الرقمية عبر Firebase...
          </span>
          <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest leading-none">
            Verifying secure credentials & cloud tokens
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
