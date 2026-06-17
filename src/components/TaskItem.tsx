import React from 'react';
import { Check, Clock, AlertCircle, Calendar, Trash2, Plus, Repeat, Bell, CheckCircle } from 'lucide-react';
import { Task, Category, Project } from '../types';
import { cn } from '../lib/utils';
import { format, differenceInDays } from 'date-fns';
import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from 'motion/react';

interface TaskItemProps {
  task: Task;
  category?: Category;
  project?: Project;
  onToggle: (id: string, completed: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onAddSubtask?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, category, project, onToggle, onDelete, onAddSubtask }) => {
  const urgencyStyles = {
    low: { text: "Low", classes: "text-emerald-500", border: "border-emerald-500/50", dot: "bg-emerald-500" },
    medium: { text: "Medium", classes: "text-blue-400", border: "border-blue-500/50", dot: "bg-blue-400" },
    high: { text: "High Priority", classes: "text-orange-400", border: "border-orange-500/50", dot: "bg-orange-400" },
    critical: { text: "Urgent", classes: "text-rose-500", border: "border-rose-500/50", dot: "bg-rose-500" },
  };

  const isLate = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

  const x = useMotionValue(0);
  const controls = useAnimation();
  
  const opacityRight = useTransform(x, [-80, -40], [1, 0]);
  const scaleRight = useTransform(x, [-80, -40], [1.1, 0.8]);
  
  const opacityLeft = useTransform(x, [40, 80], [0, 1]);
  const scaleLeft = useTransform(x, [40, 80], [0.8, 1.1]);

  const bgLeft = useTransform(x, [0, 80], ["rgba(16, 185, 129, 0)", "rgba(16, 185, 129, 0.15)"]);
  const bgRight = useTransform(x, [0, -80], ["rgba(244, 63, 94, 0)", "rgba(244, 63, 94, 0.15)"]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 60;
    const vThreshold = 400;

    if (offset < -threshold || velocity < -vThreshold) {
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.2 } });
      onDelete(task.id);
    } else if (offset > threshold || velocity > vThreshold) {
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      await controls.start({ x: window.innerWidth, transition: { duration: 0.2 } });
      onToggle(task.id, !task.completed);
      controls.start({ x: 0, transition: { type: 'spring', bounce: 0, duration: 0.4 } });
    } else {
      controls.start({ x: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.4 } });
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-xl group touch-pan-y"
    >
      {/* Background layer for swipe actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl overflow-hidden pointer-events-none">
        <motion.div className="absolute inset-y-0 left-0 w-1/2 flex items-center pl-6 origin-left" style={{ backgroundColor: bgLeft }}>
          <motion.div style={{ opacity: opacityLeft, scale: scaleLeft }} className="text-emerald-500 font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-bold">{task.completed ? 'Undo' : 'Complete'}</span>
          </motion.div>
        </motion.div>
        
        <motion.div className="absolute inset-y-0 right-0 w-1/2 flex justify-end items-center pr-6 origin-right" style={{ backgroundColor: bgRight }}>
          <motion.div style={{ opacity: opacityRight, scale: scaleRight }} className="text-rose-500 font-medium flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold">Delete</span>
            <Trash2 className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        className={cn(
          "relative flex items-center gap-4 p-4 rounded-xl border transition-colors duration-300 z-10 cursor-grab active:cursor-grabbing",
          task.completed ? "bg-neutral-900 border-neutral-800 opacity-50 grayscale" : "bg-black border-neutral-800 hover:border-neutral-700 hover:shadow-lg hover:shadow-white/5"
        )}
      >
        {/* Checkbox */}
        <button 
          onClick={() => onToggle(task.id, !task.completed)}
          className={cn(
            "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-300 border-2 active:scale-95",
            task.completed ? "bg-primary border-primary" : urgencyStyles[task.urgency].border
          )}
        >
          <motion.div
             initial={false}
             animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
             transition={{ duration: 0.2 }}
          >
            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            {!task.completed && (
              <div className={cn("w-2 h-2 rounded-full shrink-0", urgencyStyles[task.urgency].dot)} title={urgencyStyles[task.urgency].text}></div>
            )}
            {category && (
              <div className="sm:hidden w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: category.color }}></div>
            )}
            <h4 className={cn(
              "text-sm font-medium truncate transition-all duration-300",
              task.completed ? "line-through text-white/50" : "text-white"
            )}>
              {task.title}
            </h4>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {!task.completed && (
               <span className={cn(
                 "text-[10px] uppercase font-bold tracking-widest transition-colors",
                 urgencyStyles[task.urgency].classes
               )}>
                 {urgencyStyles[task.urgency].text}
               </span>
            )}
            {task.completed && (
               <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">
                 Completed
               </span>
            )}

            {task.deadline && (
              <span className={cn(
                "text-[10px] uppercase tracking-widest transition-colors",
                isLate && !task.completed ? "text-rose-500" : "text-neutral-500"
              )}>
                {task.completed ? `Due ${format(new Date(task.deadline), 'MMM d')}` : `Due ${format(new Date(task.deadline), 'MMM d, HH:mm')}`}
              </span>
            )}
            
            {task.recurrence && task.recurrence !== 'none' && (
               <span className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                 <Repeat className="w-3 h-3" />
                 {task.recurrence}
               </span>
            )}

            {task.reminders && task.reminders.length > 0 && !task.completed && (
               <span className="text-[10px] text-neutral-500 flex items-center gap-1" title="Reminder set">
                 <Bell className="w-3 h-3" />
               </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 flex items-center gap-1 sm:gap-2 relative pointer-events-auto">
          {onAddSubtask && !task.completed && (
            <button 
               onClick={(e) => { e.stopPropagation(); onAddSubtask(); }}
               title="Add subtask"
               className="text-neutral-500 hover:text-white transition-all p-2 hover:scale-110 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100 sm:absolute sm:-left-32"
            >
               <Plus className="w-4 h-4" />
            </button>
          )}
          <button 
             onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
             className="text-neutral-500 hover:text-rose-500 transition-all p-2 hover:scale-110 active:scale-95 hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 sm:absolute sm:-left-24"
          >
             <Trash2 className="w-4 h-4" />
          </button>

          {category && (
            <div className="hidden sm:block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-neutral-700 text-neutral-400 bg-neutral-800">
              {category.name}
            </div>
          )}
          {project && (
            <div className="hidden sm:block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-neutral-700 text-neutral-400 bg-[#0a1128] border-blue-900/50">
              {project.title}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

