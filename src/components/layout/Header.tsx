import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, Bell, Settings, Target, TrendingUp, User } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';

interface HeaderProps {
  user: any;
  logout: () => void;
}

export function Header({ user, logout }: HeaderProps) {
  const { setShowSettingsModal, setShowFocusModeModal, setShowInsightsModal, setShowNotifications } = useUI();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="pt-[max(env(safe-area-inset-top),0px)] h-[calc(3.5rem+env(safe-area-inset-top))] sm:h-16 sm:pt-0 shrink-0 flex items-center justify-between px-4 sm:px-8 bg-transparent z-20 relative">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="sm:hidden relative">
          <button 
            onClick={() => setShowProfileMenu(p => !p)}
            className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-medium text-white transition transform active:scale-95 outline-none"
          >
             {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </button>
          <AnimatePresence>
            {showProfileMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                 transition={{ duration: 0.15 }}
                 className="absolute left-0 top-10 mt-2 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
               >
                  <div className="px-4 py-2 border-b border-neutral-900 mb-1">
                    <p className="text-xs font-medium text-white truncate">{user.displayName || 'User'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                     <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <div className="h-px bg-neutral-900 my-1"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-2">
                     <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif italic tracking-tight text-white mr-1">omadedef.</h1>
        {isOnline ? (
          <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400 uppercase tracking-widest hidden sm:inline-block">Real-time Sync Active</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-[10px] text-yellow-400 uppercase tracking-widest hidden sm:inline-block">Offline Mode</span>
        )}
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex gap-2 items-center text-[10px] sm:text-xs text-neutral-400 uppercase tracking-tighter">
           <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mb-[1px] ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
           <span className="hidden sm:inline">{isOnline ? 'Cloud Live' : 'Working Locally'}</span>
        </div>
        <button 
          onClick={() => setShowFocusModeModal(true)}
          className="text-neutral-500 hover:text-emerald-400 transition-colors p-1 group relative"
          title="Focus Mode"
        >
           <Target className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setShowInsightsModal(true)}
          className="text-neutral-500 hover:text-white transition-colors p-1"
        >
           <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => setShowNotifications(true)}
          className="text-neutral-500 hover:text-white transition-colors p-1"
        >
           <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setShowProfileMenu(p => !p)}
            className="flex items-center gap-2 cursor-pointer group outline-none"
          >
             <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-medium text-white group-hover:bg-neutral-700 transition transform group-active:scale-95">
               {user.displayName?.charAt(0) || user.email?.charAt(0)}
             </div>
          </button>
          <AnimatePresence>
            {showProfileMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                 transition={{ duration: 0.15 }}
                 className="absolute right-0 top-12 mt-2 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
               >
                  <div className="px-4 py-2 border-b border-neutral-900 mb-1">
                    <p className="text-xs font-medium text-white truncate">{user.displayName || 'User'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                     <User className="w-3.5 h-3.5" /> Profile
                  </button>
                  <button onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                     <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <div className="h-px bg-neutral-900 my-1"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-2">
                     <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
