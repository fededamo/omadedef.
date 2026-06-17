import { useState, useEffect } from 'react';
import { Bell, Smartphone, Settings2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function NotificationsPanel({ onClose, isOpen, user }: { onClose: () => void, isOpen: boolean, user: any }) {
  const [telegramOn, setTelegramOn] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  
  const [whatsappOn, setWhatsappOn] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  useEffect(() => {
    if (isOpen && user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(d => {
        if (d.exists()) {
          const data = d.data();
          setTelegramOn(!!data.telegramOn);
          setTelegramBotToken(data.telegramBotToken || '');
          setTelegramChatId(data.telegramChatId || '');
          setWhatsappOn(!!data.whatsappOn);
          setWhatsappPhone(data.whatsappPhone || '');
        }
      });
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        telegramOn,
        telegramBotToken,
        telegramChatId,
        whatsappOn,
        whatsappPhone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            style={{ willChange: 'transform' }}
            className="relative w-full max-w-sm bg-zinc-950 border-l border-zinc-900 h-full flex flex-col"
          >
        
        <div className="px-6 py-5 border-b border-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Bell className="w-5 h-5 text-indigo-400" />
             <h2 className="text-lg font-medium text-white">Notifications</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          
          <div className="space-y-4">
             <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Push Integrations</h3>
             
             {/* Telegram */}
             <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-[#2AABEE]/10 flex items-center justify-center text-[#2AABEE]">
                       <Smartphone className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="font-medium text-zinc-100">Telegram Bot</div>
                       <div className="text-xs text-zinc-500">Receive reminders via chat</div>
                     </div>
                  </div>
                  <button 
                     onClick={() => setTelegramOn(!telegramOn)}
                     className={cn(
                       "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                       telegramOn ? "bg-indigo-600" : "bg-zinc-700"
                     )}
                   >
                     <span className={cn(
                       "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                       telegramOn ? "translate-x-6" : "translate-x-1"
                     )} />
                   </button>
                </div>
                {telegramOn && (
                  <div className="space-y-3 pt-2">
                    <input type="text" value={telegramBotToken} onChange={e => setTelegramBotToken(e.target.value)} placeholder="Bot Token" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500" />
                    <input type="text" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="Chat ID" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500" />
                  </div>
                )}
             </div>

             {/* WhatsApp */}
             <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                       <Smartphone className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="font-medium text-zinc-100">WhatsApp</div>
                       <div className="text-xs text-zinc-500">Via Twilio Sandbox</div>
                     </div>
                  </div>
                  <button 
                     onClick={() => setWhatsappOn(!whatsappOn)}
                     className={cn(
                       "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                       whatsappOn ? "bg-indigo-600" : "bg-zinc-700"
                     )}
                   >
                     <span className={cn(
                       "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                       whatsappOn ? "translate-x-6" : "translate-x-1"
                     )} />
                   </button>
                </div>
                {whatsappOn && (
                  <div className="space-y-3 pt-2">
                    <input type="text" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500" />
                  </div>
                )}
             </div>

          </div>

          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-sm text-zinc-400">
             <div className="flex items-start gap-3">
               <Settings2 className="w-5 h-5 shrink-0 text-zinc-500" />
               <p>Real-time synchronization across devices is powered automatically via Firestore. Deadlines will trigger these APIs 1 hour prior to completion.</p>
             </div>
          </div>
          
        </div>
        
        <div className="p-6 border-t border-zinc-900">
           <button onClick={handleSave} className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition-colors">
             Save Preferences
           </button>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
