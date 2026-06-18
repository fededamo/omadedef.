import React, { useEffect, useState } from 'react';
import { X, Settings2, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Task } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onPurgeOldTasks: () => void;
}

const PREDEFINED_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
];

export function SettingsModal({ isOpen, onClose, tasks, onPurgeOldTasks }: SettingsModalProps) {
  const [autoPurge, setAutoPurge] = useState(false);
  const [accentColor, setAccentColor] = useState('#ffffff');

  useEffect(() => {
    const savedAutoPurge = localStorage.getItem('omadedef_autopurge');
    if (savedAutoPurge) {
      setAutoPurge(JSON.parse(savedAutoPurge));
    }
    
    if (isOpen) {
      const savedColor = localStorage.getItem('omadedef_accent_color') || '#ffffff';
      setAccentColor(savedColor);
    }
  }, [isOpen]);

  const handleToggleAutoPurge = () => {
    const newVal = !autoPurge;
    setAutoPurge(newVal);
    localStorage.setItem('omadedef_autopurge', JSON.stringify(newVal));
  };

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('omadedef_accent_color', color);
    document.documentElement.style.setProperty('--app-accent', color);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
  const oldTasks = tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                   <Settings2 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-serif">Settings</h2>
              </div>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors outline-none border-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col gap-8">
               <div className="flex flex-col gap-6">
                 
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-sm font-medium text-white mb-1">Accent Color</h3>
                       <p className="text-xs text-neutral-500 max-w-[240px]">Customize the primary color throughout the application.</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 mt-2">
                     {PREDEFINED_COLORS.map(c => (
                       <button
                         key={c.value}
                         onClick={() => handleColorChange(c.value)}
                         className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${accentColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#0a0a0a] ring-white' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                         style={{ backgroundColor: c.value }}
                         title={c.name}
                       />
                     ))}
                   </div>
                 </div>

                 <div className="h-px bg-neutral-900 my-2"></div>
                 
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-sm font-medium text-white mb-1">Auto-Purge Old Tasks</h3>
                     <p className="text-xs text-neutral-500 max-w-[240px]">Automatically delete completed tasks older than 30 days to keep the interface clean.</p>
                   </div>
                   <button 
                     onClick={handleToggleAutoPurge}
                     className={`w-11 h-6 rounded-full relative transition-colors ${autoPurge ? 'bg-emerald-500' : 'bg-neutral-800 border border-neutral-700'}`}
                   >
                     <motion.div 
                       className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform`}
                       animate={{ left: autoPurge ? '24px' : '4px' }}
                     />
                   </button>
                 </div>
                 
                 <div className="h-px bg-neutral-900 my-2"></div>
                 
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-sm font-medium text-white mb-1">Manual Purge (30+ days)</h3>
                     <p className="text-xs text-neutral-500 max-w-[240px]">You have {oldTasks.length} old completed tasks.</p>
                   </div>
                   <button 
                     disabled={oldTasks.length === 0}
                     onClick={onPurgeOldTasks}
                     className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/20"
                   >
                     <Trash2 className="w-3.5 h-3.5" /> Purge Now
                   </button>
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
