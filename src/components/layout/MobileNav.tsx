import { cn } from '../../lib/utils';
import { Trash2, FolderPlus } from 'lucide-react';
import { Category, Task, Project } from '../../types';
import { useUI } from '../../contexts/UIContext';

interface MobileNavProps {
  categories: Category[];
  tasks: Task[];
  deleteCategory: (id: string) => void;
}

export function MobileNav({
  categories,
  tasks,
  deleteCategory
}: MobileNavProps) {
  const { appMode, activeView, setActiveView, setShowCategoryModal } = useUI();
  
  if (appMode !== 'tasks') return null;

  return (
    <div className="lg:hidden shrink-0 bg-transparent px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex overflow-x-auto gap-3 hide-scrollbar items-center z-40 sticky top-0 w-full snap-x">
     <button 
       onClick={() => setActiveView('all')}
       className={cn(
         "snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border shrink-0 outline-none",
         activeView === 'all' ? "bg-white text-black border-transparent" : "bg-transparent text-neutral-400 border-neutral-800/50 hover:text-neutral-200"
       )}
     >
       All
     </button>
     <button 
       onClick={() => setActiveView('today')}
       className={cn(
         "snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border shrink-0 outline-none",
         activeView === 'today' ? "bg-white text-black border-transparent" : "bg-transparent text-neutral-400 border-neutral-800/50 hover:text-neutral-200"
       )}
     >
       Today
     </button>
     <button 
       onClick={() => setActiveView('upcoming')}
       className={cn(
         "snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border shrink-0 outline-none",
         activeView === 'upcoming' ? "bg-white text-black border-transparent" : "bg-transparent text-neutral-400 border-neutral-800/50 hover:text-neutral-200"
       )}
     >
       Upcoming
     </button>
     <div className="w-px h-5 bg-neutral-800 shrink-0 mx-1 snap-start"></div>
     {categories.map(c => {
       const catTasks = tasks.filter(t => t.categoryId === c.id);
       const completedCatTasks = catTasks.filter(t => t.completed);
       const progress = catTasks.length ? Math.round((completedCatTasks.length / catTasks.length) * 100) : 0;
       return (
       <div 
         key={c.id}
         role="button"
         tabIndex={0}
         onClick={() => setActiveView(`category:${c.id}`)}
         className={cn(
           "snap-start whitespace-nowrap pl-4 pr-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center border shrink-0 relative overflow-hidden group outline-none",
           activeView === `category:${c.id}` ? "bg-white/10 text-white border-transparent" : "bg-transparent text-neutral-400 border-neutral-800/50 hover:text-neutral-200"
         )}
       >
         <div className="flex items-center gap-2 z-10 relative">
           <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }}></div>
           {c.name}
           {activeView === `category:${c.id}` && (
             <div 
               onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); setActiveView('all'); }}
               className="ml-1 p-0.5 rounded-full hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-colors"
               title="Delete Category"
             >
               <Trash2 className="w-3 h-3" />
             </div>
           )}
         </div>
       </div>
     )})}
     <button 
       onClick={() => setShowCategoryModal(true)}
       className="snap-start whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center border shrink-0 outline-none bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 ml-1"
     >
       <FolderPlus className="w-3.5 h-3.5" />
     </button>
  </div>
  );
}
