import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Category } from '../types';
import { getAuth } from 'firebase/auth';

interface SmartInputProps {
  onTasksGenerated: (tasks: any[]) => void;
  categories: Category[];
  addCategory: (name: string, color: string) => Promise<string | null>;
}

export function SmartInput({ onTasksGenerated, categories, addCategory }: SmartInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lastSubmitStr = localStorage.getItem('lastSmartSubmit');
    if (lastSubmitStr) {
      const last = parseInt(lastSubmitStr, 10);
      const diff = Math.floor((Date.now() - last) / 1000);
      if (diff < 60) {
        setCooldownTime(60 - diff);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || cooldownTime > 0) return;

    setLoading(true);
    try {
      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      
      const res = await fetch('/api/smart-tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (res.status === 429) {
        const textData = await res.text();
        let errData: any = {};
        try { errData = JSON.parse(textData); } catch(e) {}
        alert(errData.error || "Please wait 1 minute before analyzing another task.");
        localStorage.setItem('lastSmartSubmit', Date.now().toString());
        setCooldownTime(60);
        return;
      }

      if (!res.ok) {
        throw new Error("Server error: " + res.status);
      }

      const textOutput = await res.text();
      let data;
      try {
        data = JSON.parse(textOutput);
      } catch (e: any) {
        throw new Error("Failed to parse response: " + e.message);
      }
      
      if (Array.isArray(data)) {
        // Map categoryName to categoryId, creating if missing
        const tasksWithCategories = await Promise.all(data.map(async (t) => {
          let catId = '';
          if (t.categoryName) {
             const safeCatName = String(t.categoryName).substring(0, 100);
             const existing = categories.find(c => c.name.toLowerCase() === safeCatName.toLowerCase());
             if (existing) {
               catId = existing.id;
             } else {
                const newId = await addCategory(safeCatName, '#3b82f6'); // default blue
                if(newId) catId = newId;
             }
          }
          return { 
             ...t, 
             title: (t.title || "New Task").substring(0, 500), 
             description: t.description ? String(t.description).substring(0, 5000) : '',
             categoryId: catId 
          };
        }));
        onTasksGenerated(tasksWithCategories);
        
        localStorage.setItem('lastSmartSubmit', Date.now().toString());
        setCooldownTime(60);
      }
      setText('');
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
      }
    } catch (e) {
      console.error(e);
      alert("Failed to analyze task.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end group w-full max-w-full">
      <div className="absolute left-0 bottom-0 mb-[14px] sm:mb-[18px] pl-4 flex items-center pointer-events-none z-10">
        {loading ? (
           <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
        ) : (
           <Sparkles className="h-4 w-4 text-neutral-500 transition-colors" />
        )}
      </div>
      <textarea
        ref={textareaRef}
        rows={1}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || cooldownTime > 0}
        placeholder={cooldownTime > 0 ? `Wait ${cooldownTime}s...` : "Add a task... /urgency /category /deadline"}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-[28px] pl-10 pr-20 sm:pr-24 py-3 sm:py-4 text-xs sm:text-sm text-neutral-200 outline-none focus:border-neutral-600 placeholder:text-neutral-700 placeholder:italic transition-colors resize-none overflow-y-auto max-h-64 min-h-[44px] sm:min-h-[52px]"
      />
      <div className="absolute right-20 sm:right-24 bottom-3 sm:bottom-4 flex items-center pr-2 pointer-events-none z-10">
        <span className={cn(
          "text-[10px] font-medium transition-colors",
          text.length > 450 ? "text-rose-500" : "text-neutral-600"
        )}>
          {text.length}/500
        </span>
      </div>
      <button 
        type="submit" 
        disabled={!text.trim() || loading || cooldownTime > 0}
        className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-[10px] sm:text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
      >
        {cooldownTime > 0 ? `${cooldownTime}s` : "Create"}
      </button>
    </form>
  );
}
