import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category, Project } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { useUI } from '../contexts/UIContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  projects?: Project[];
  initialProjectId?: string;
  onSave: (task: { 
    title: string; 
    description: string; 
    categoryId: string; 
    projectId?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical'; 
    deadline?: string;
    parentId?: string;
    recurrence?: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'none';
    reminders?: number[];
  }) => void;
}

export function TaskModal({ isOpen, onClose, categories, projects = [], initialProjectId, onSave }: TaskModalProps) {
  const { showToast } = useUI();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [deadline, setDeadline] = useState('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'none'>('none');
  const [reminderMinutes, setReminderMinutes] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
      setProjectId(initialProjectId || '');
    }
  }, [isOpen, initialProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (deadline) {
      const selectedDate = new Date(deadline);
      const now = new Date();
      if (selectedDate < now) {
        showToast("Cannot set a task deadline in the past.", "error");
        return;
      }
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      if (selectedDate > maxDate) {
        showToast("Cannot set a task deadline more than 10 years in the future.", "error");
        return;
      }
    }

    onSave({
      title,
      description,
      categoryId,
      projectId: projectId || undefined,
      urgency,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      reminders: reminderMinutes > 0 ? [reminderMinutes] : undefined
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setProjectId(initialProjectId || '');
    setDeadline('');
    setRecurrence('none');
    setReminderMinutes(0);
    onClose();
  };

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
            className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
              <h2 className="text-xl font-serif tracking-tight text-white">New Task</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-4">
                <div>
                  <input 
                    autoFocus
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={500}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-serif text-white placeholder-neutral-700 border-none focus:outline-none focus:ring-0 px-0 transition-opacity"
                    placeholder="Task name or goal"
                    required
                  />
                </div>
                <div>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={5000}
                    className="w-full bg-neutral-900/50 text-sm text-neutral-400 placeholder-neutral-600 rounded-xl px-4 py-3 border border-neutral-800 focus:border-neutral-700 focus:outline-none focus:ring-0 resize-none min-h-[80px] transition-colors"
                    placeholder="Add details, notes, or sub-steps..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Category</label>
                  <select 
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 appearance-none transition-colors"
                  >
                    <option value="">None</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Project</label>
                  <select 
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 appearance-none transition-colors"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Urgency</label>
                  <select 
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 appearance-none transition-colors"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Due Date</label>
                  <input 
                    type="datetime-local" 
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 [color-scheme:dark] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Recurrence</label>
                  <select 
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as any)}
                    className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 appearance-none transition-colors"
                  >
                    <option value="none">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Reminder</label>
                <select 
                  value={reminderMinutes}
                  onChange={e => setReminderMinutes(Number(e.target.value))}
                  className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 appearance-none transition-colors"
                >
                  <option value={0}>None</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>

              <div className="mt-4 pt-6 border-t border-neutral-800/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
