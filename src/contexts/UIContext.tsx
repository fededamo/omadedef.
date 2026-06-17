import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../lib/utils';

type AppMode = 'tasks' | 'calendar' | 'projects';
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Modals
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  showTaskModal: boolean;
  setShowTaskModal: (v: boolean) => void;
  showProjectModal: boolean;
  setShowProjectModal: (v: boolean) => void;
  showAppointmentModal: boolean;
  setShowAppointmentModal: (v: boolean) => void;
  showCategoryModal: boolean;
  setShowCategoryModal: (v: boolean) => void;
  showInsightsModal: boolean;
  setShowInsightsModal: (v: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (v: boolean) => void;
  showFocusModeModal: boolean;
  setShowFocusModeModal: (v: boolean) => void;
  
  // Helpers
  parentTaskId: string | null;
  setParentTaskId: (id: string | null) => void;

  showToast: (message: string, type?: ToastType) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppMode] = useState<AppMode>('tasks');
  const [activeView, setActiveView] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFocusModeModal, setShowFocusModeModal] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const anyModalOpen = 
    showNotifications || showTaskModal || showProjectModal || 
    showAppointmentModal || showCategoryModal || showInsightsModal || 
    showSettingsModal || showFocusModeModal;

  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [anyModalOpen]);

  return (
    <UIContext.Provider value={{
      appMode, setAppMode,
      activeView, setActiveView,
      showNotifications, setShowNotifications,
      showTaskModal, setShowTaskModal,
      showProjectModal, setShowProjectModal,
      showAppointmentModal, setShowAppointmentModal,
      showCategoryModal, setShowCategoryModal,
      showInsightsModal, setShowInsightsModal,
      showSettingsModal, setShowSettingsModal,
      showFocusModeModal, setShowFocusModeModal,
      parentTaskId, setParentTaskId,
      showToast
    }}>
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md border border-white/10 pointer-events-auto",
                toast.type === 'error' ? "bg-rose-500/90 text-white" :
                toast.type === 'success' ? "bg-emerald-500/90 text-white" :
                "bg-neutral-800/90 text-neutral-100"
              )}
            >
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
}
