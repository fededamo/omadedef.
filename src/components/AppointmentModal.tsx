import React, { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Appointment } from '../types';
import { cn } from '../lib/utils';
import { useUI } from '../contexts/UIContext';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  categories: Category[];
  initialData?: Partial<Appointment>;
}

export function AppointmentModal({ isOpen, onClose, onSave, onDelete, categories, initialData }: AppointmentModalProps) {
  const { showToast } = useUI();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [reminderMinutes, setReminderMinutes] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCategoryId(initialData.categoryId || '');
        setReminderMinutes(initialData.reminders?.[0] || 0);
        
        if (initialData.startTime) {
          const s = new Date(initialData.startTime);
          setStartDate(s.toISOString().split('T')[0]);
          setStartTime(s.toTimeString().slice(0, 5));
        } else {
          setStartDate('');
          setStartTime('');
        }
        
        if (initialData.endTime) {
          const e = new Date(initialData.endTime);
          setEndDate(e.toISOString().split('T')[0]);
          setEndTime(e.toTimeString().slice(0, 5));
        } else {
          setEndDate('');
          setEndTime('');
        }
      } else {
        setTitle('');
        setDescription('');
        const now = new Date();
        setStartDate(now.toISOString().split('T')[0]);
        setStartTime(now.toTimeString().slice(0, 5));
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        setEndDate(oneHourLater.toISOString().split('T')[0]);
        setEndTime(oneHourLater.toTimeString().slice(0, 5));
        setCategoryId('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) return;

    const startIso = new Date(`${startDate}T${startTime}`).toISOString();
    const endIso = new Date(`${endDate}T${endTime}`).toISOString();

    if (new Date(startIso) < new Date()) {
      showToast("Cannot set an appointment in the past.", "error");
      return;
    }
    
    if (new Date(endIso) <= new Date(startIso)) {
      showToast("End time must be after start time.", "error");
      return;
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    if (new Date(startIso) > maxDate || new Date(endIso) > maxDate) {
      showToast("Cannot set an appointment more than 10 years in the future.", "error");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      startTime: startIso,
      endTime: endIso,
      categoryId: categoryId || undefined,
      reminders: reminderMinutes > 0 ? [reminderMinutes] : undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-neutral-950 rounded-2xl w-full max-w-lg border border-neutral-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
            <h2 className="text-xl font-serif text-white tracking-tight">{initialData?.id ? 'Edit Appointment' : 'New Appointment'}</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="appt-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Appointment title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={500}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-serif text-white placeholder-neutral-700 border-none focus:outline-none focus:ring-0 px-0 transition-opacity"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Add notes or description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={5000}
                    className="w-full bg-neutral-900/50 text-sm text-neutral-400 placeholder-neutral-600 rounded-xl px-4 py-3 border border-neutral-800 focus:border-neutral-700 focus:outline-none focus:ring-0 resize-none min-h-[100px] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Starts</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                      <CalIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-black text-sm text-neutral-200 rounded-xl pl-10 pr-4 py-3 border border-neutral-800 focus:border-neutral-600 outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="relative w-full sm:w-32 group">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-black text-sm text-neutral-200 rounded-xl pl-10 pr-4 py-3 border border-neutral-800 focus:border-neutral-600 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Ends</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                      <CalIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-black text-sm text-neutral-200 rounded-xl pl-10 pr-4 py-3 border border-neutral-800 focus:border-neutral-600 outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="relative w-full sm:w-32 group">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-black text-sm text-neutral-200 rounded-xl pl-10 pr-4 py-3 border border-neutral-800 focus:border-neutral-600 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Reminder</label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full bg-black text-sm text-neutral-200 rounded-xl px-4 py-3 border border-neutral-800 focus:border-neutral-600 outline-none transition-colors appearance-none"
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
              </div>

              {categories.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryId('')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-sm border",
                        !categoryId ? "bg-primary text-primary-foreground border-transparent" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      )}
                    >
                      None
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shadow-sm border",
                          categoryId === c.id ? "text-neutral-900 border-transparent" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        )}
                        style={categoryId === c.id ? { backgroundColor: c.color } : {}}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shadow-inner" 
                          style={{ backgroundColor: categoryId === c.id ? 'currentColor' : c.color }} 
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-between gap-3 items-center">
            {initialData?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id!);
                  onClose();
                }}
                className="p-2.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Delete Appointment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="appt-form"
                disabled={!title.trim() || !startDate || !startTime || !endDate || !endTime}
                className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
              >
                Save Event
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
