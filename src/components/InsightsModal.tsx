import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { format, subDays, isSameDay } from 'date-fns';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export function InsightsModal({ isOpen, onClose, tasks }: InsightsModalProps) {
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = tasks.filter(t => t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), date));
      data.push({
        name: format(date, 'MMM d'),
        completed: dayTasks.length
      });
    }
    return data;
  }, [tasks]);

  const totalCompletedLast7Days = chartData.reduce((acc, curr) => acc + curr.completed, 0);

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
            className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                   <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-serif">Productivity Insights</h2>
              </div>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col gap-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Past 7 Days</span>
                     <span className="text-3xl font-serif text-white">{totalCompletedLast7Days} <span className="text-sm font-sans tracking-tight text-neutral-500">tasks</span></span>
                  </div>
                  <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Daily Average</span>
                     <span className="text-3xl font-serif text-white">{(totalCompletedLast7Days / 7).toFixed(1)} <span className="text-sm font-sans tracking-tight text-neutral-500">tasks</span></span>
                  </div>
               </div>

               <div className="mt-4">
                 <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-6">Completion Trend</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width={undefined} height="100%" minWidth={0} minHeight={0}>
                       <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                             <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" opacity={0.5} />
                         <XAxis 
                           dataKey="name" 
                           stroke="#525252" 
                           fontSize={10}
                           tickLine={false}
                           axisLine={false}
                           dy={10}
                         />
                         <YAxis 
                           stroke="#525252" 
                           fontSize={10}
                           tickLine={false}
                           axisLine={false}
                           dx={-10}
                           allowDecimals={false}
                         />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }}
                           itemStyle={{ color: '#fff' }}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="completed" 
                           stroke="#ffffff" 
                           strokeWidth={2}
                           fillOpacity={1} 
                           fill="url(#colorCompleted)" 
                         />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
