import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, CheckSquare, SkipForward } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onComplete: (taskId: string) => void;
}

export function FocusModeModal({ isOpen, onClose, tasks, onComplete }: FocusModeModalProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes pomodoro
  const [isActive, setIsActive] = useState(false);
  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>([]);

  const focusTasks = React.useMemo(() => {
    return tasks.filter(t => !t.completed && !skippedTaskIds.includes(t.id)).sort((a, b) => {
      const urgencyMap = { critical: 4, high: 3, medium: 2, low: 1 };
      const aU = urgencyMap[a.urgency] || 0;
      const bU = urgencyMap[b.urgency] || 0;
      if (aU !== bU) return bU - aU;
      
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;
      if (aDeadline && bDeadline) return aDeadline - bDeadline;
      if (aDeadline) return -1;
      if (bDeadline) return 1;
      
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bCreated - aCreated;
    });
  }, [tasks, skippedTaskIds]);

  useEffect(() => {
    if (focusTasks.length > 0 && currentTaskIndex >= focusTasks.length) {
      setCurrentTaskIndex(Math.max(0, focusTasks.length - 1));
    } else if (focusTasks.length === 0 && currentTaskIndex !== 0) {
      setCurrentTaskIndex(0);
    }
  }, [focusTasks.length, currentTaskIndex]);

  const activeTask = focusTasks[currentTaskIndex];

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notify here ideally
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(25 * 60);
      setIsActive(false);
      setCurrentTaskIndex(0);
      setSkippedTaskIds([]);
    }
  }, [isOpen]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleComplete = () => {
    if (activeTask) {
      onComplete(activeTask.id);
      setTimeLeft(25 * 60);
      setIsActive(false);
    }
  };

  const handleSkip = () => {
    if (activeTask) {
      setSkippedTaskIds(prev => [...prev, activeTask.id]);
      setTimeLeft(25 * 60);
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="flex flex-col items-center justify-center w-full max-w-3xl text-center">
          {activeTask ? (
            <motion.div 
              key={activeTask.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex flex-col gap-4">
                <span className="text-sm font-mono tracking-[0.2em] text-neutral-500 uppercase">Current Focus</span>
                <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight">
                  {activeTask.title}
                </h1>
                {activeTask.description && (
                  <p className="text-xl text-neutral-400 mt-4 max-w-2xl mx-auto">
                    {activeTask.description}
                  </p>
                )}
              </div>

              <div className="text-8xl md:text-[12rem] font-mono font-light text-white tracking-tighter">
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
                </button>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span>Complete</span>
                  </button>
                  <button 
                    onClick={handleSkip}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                    <span>Skip for now</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-2xl text-neutral-500 font-serif">
              You have no pending tasks. Enjoy your time!
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
