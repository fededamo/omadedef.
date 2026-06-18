import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ListTodo, CalendarDays, Trash2, FolderPlus, Rocket } from 'lucide-react';
import { Category, Task, Project } from '../../types';
import { useUI } from '../../contexts/UIContext';

interface SidebarProps {
  categories: Category[];
  projects: Project[];
  tasks: Task[];
  deleteCategory: (id: string) => void;
}

export function Sidebar({
  categories,
  projects,
  tasks,
  deleteCategory
}: SidebarProps) {
  const { appMode, setAppMode, activeView, setActiveView, setShowCategoryModal } = useUI();
  const [sortByDeadline, setSortByDeadline] = useState(false);

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortByDeadline) return 0; // retain original order or maybe created date
    
    // Find nearest uncompleted task deadline for project a
    const upcomingA = tasks
      .filter(t => t.projectId === a.id && !t.completed && t.deadline)
      .map(t => new Date(t.deadline!).getTime())
      .sort((x, y) => x - y)[0] || Infinity;

    // Find nearest uncompleted task deadline for project b
    const upcomingB = tasks
      .filter(t => t.projectId === b.id && !t.completed && t.deadline)
      .map(t => new Date(t.deadline!).getTime())
      .sort((x, y) => x - y)[0] || Infinity;

    return upcomingA - upcomingB;
  });

  return (
    <aside className="w-64 shrink-0 p-8 flex flex-col gap-10 bg-transparent hidden lg:flex overflow-y-auto">
      
      {/* App Mode Switch */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setAppMode('tasks')}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
            appMode === 'tasks' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white hover:bg-white/5"
          )}
        >
          <ListTodo className="w-4 h-4" />
          Tasks
        </button>
        <button
          onClick={() => setAppMode('projects')}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
            appMode === 'projects' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white hover:bg-white/5"
          )}
        >
          <Rocket className="w-4 h-4" />
          Projects
        </button>
        <button
          onClick={() => setAppMode('calendar')}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
            appMode === 'calendar' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white hover:bg-white/5"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          Calendar
        </button>
      </div>

      {appMode === 'tasks' ? (
        <>
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-4">Perspectives</h2>
        <nav className="flex flex-col gap-1">
           <button 
             onClick={() => setActiveView('all')}
             className={cn(
               "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
               activeView === 'all' ? "bg-white/5 text-white" : "text-neutral-400 hover:text-white"
             )}
           >
             <span>All Tasks</span>
             <span className="text-xs opacity-50">{tasks.filter(t => !t.parentId && !t.completed).length || ''}</span>
           </button>
           <button 
             onClick={() => setActiveView('today')}
             className={cn(
               "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
               activeView === 'today' ? "bg-white/5 text-white" : "text-neutral-400 hover:text-white"
             )}
           >
             <span>Today</span>
           </button>
           <button 
             onClick={() => setActiveView('upcoming')}
             className={cn(
               "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
               activeView === 'upcoming' ? "bg-white/5 text-white" : "text-neutral-400 hover:text-white"
             )}
           >
             <span>Upcoming</span>
           </button>
        </nav>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2">Custom Categories</h2>
        <nav className="flex flex-col gap-1">
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
                 "relative flex flex-col justify-center px-3 py-2.5 rounded-lg text-sm transition-colors overflow-hidden group cursor-pointer",
                 activeView === `category:${c.id}` ? "bg-white/5 text-white" : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
               )}
             >
               <div className="flex items-center justify-between z-10 w-full relative">
                 <span className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></div>
                   <span className="truncate max-w-[100px] text-left">{c.name}</span>
                 </span>
                 <span className="text-xs opacity-50 shrink-0 font-medium tracking-wide group-hover:opacity-0 transition-opacity">
                   {catTasks.length - completedCatTasks.length || ''}
                 </span>
               </div>
               {/* Progress bar background indicator */}
               <div className="absolute bottom-0 left-0 h-[2px] bg-neutral-800/40 w-full transition-all">
                  <div className="h-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, backgroundColor: c.color }} />
               </div>
               <div 
                 onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); activeView === `category:${c.id}` && setActiveView('all'); }}
                 className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 rounded-md text-neutral-500 hover:text-rose-500 transition-all z-20 outline-none cursor-pointer"
                 title="Delete Category"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </div>
             </div>
           )})}
        </nav>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="mt-6 px-3 flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors group"
        >
          <FolderPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          New Category
        </button>
      </section>

      <div className="mt-auto">
        <div className="p-4">
          <p className="text-[11px] leading-relaxed text-neutral-500">Push notifications are currently optimized for <span className="text-blue-400 underline">WhatsApp</span>.</p>
        </div>
      </div>
        </>
      ) : appMode === 'projects' ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center text-neutral-500 space-y-4">
           <Rocket className="w-12 h-12 opacity-20" />
           <p className="text-xs max-w-[160px]">Select a project from the top menu to view its tasks.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center text-neutral-500 space-y-4">
           <CalendarDays className="w-12 h-12 opacity-20" />
           <p className="text-xs">Manage your time and focus deeply.</p>
        </div>
      )}
    </aside>
  );
}
