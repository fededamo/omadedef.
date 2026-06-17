import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', 
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#a8a29e', '#78716c', '#ffffff'
];

export function CategoryModal({ isOpen, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(name, color);
    
    // Reset form
    setName('');
    setColor(COLORS[0]);
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
            className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <h2 className="text-xl font-serif text-white">New Category</h2>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500">Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={100}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-600 text-white"
                  placeholder="e.g. Work"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-colors"
              >
                Create Category
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
