import { useState, useEffect } from 'react';
import { useAuth } from './lib/useAuth';
import { useTasks } from './lib/useTasks';
import { useProjects } from './lib/useProjects';
import { useAppointments } from './lib/useAppointments';
import { useUI } from './contexts/UIContext';
import { useTaskActions } from './lib/useTaskActions';
import { useTaskSorting } from './lib/useTaskSorting';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SmartInput } from './components/SmartInput';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { CategoryModal } from './components/CategoryModal';
import { NotificationsPanel } from './components/NotificationsPanel';
import { InsightsModal } from './components/InsightsModal';
import { SettingsModal } from './components/SettingsModal';
import { FocusModeModal } from './components/FocusModeModal';
import { CalendarView } from './components/CalendarView';
import { ProjectsView } from './components/ProjectsView';
import { AppointmentModal } from './components/AppointmentModal';
import { LayoutGrid, Plus, ArrowUpDown, CalendarDays, AlertCircle, ArrowDownAZ, Search, X, ListTodo, Rocket } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { Appointment } from './types';

export default function App() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { tasks, categories, loading: tasksLoading, addTask, addTasksBatch, updateTask, deleteTask, deleteTasksBatch, addCategory, deleteCategory } = useTasks(user?.uid);
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject } = useProjects(user?.uid);
  const { appointments, loadingAppts, addAppointment, updateAppointment, deleteAppointment } = useAppointments(user?.uid);
  
  const {
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
    parentTaskId, setParentTaskId
  } = useUI();

  const { 
    handlePurgeOldTasks,
    handleTasksGenerated,
    handleManualTaskSave,
    handleToggleTask,
    handleDeleteTask
  } = useTaskActions(tasks, addTask, addTasksBatch, updateTask, deleteTasksBatch, tasksLoading, parentTaskId);

  const {
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    showSortMenu, setShowSortMenu,
    inProgressTasks, completedTasks
  } = useTaskSorting(tasks, activeView);

  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> | undefined>();

  useEffect(() => {
    const savedAccent = localStorage.getItem('omadedef_accent_color');
    if (savedAccent) {
      document.documentElement.style.setProperty('--app-accent', savedAccent);
    }
  }, []);

  const handleManualCategorySave = async (name: string, color: string) => {
    await addCategory(name, color);
  };

  if (authLoading) {
    return <div className="min-h-[100dvh] bg-background flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-[100dvh] bg-black text-neutral-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm space-y-16 text-center animate-in fade-in zoom-in duration-1000">
          <div className="space-y-4">
            <h1 className="text-3xl font-serif italic tracking-tight text-white/90">omadedef.</h1>
          </div>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3.5 px-8 font-medium text-xs tracking-wider transition-all flex justify-center items-center gap-3 backdrop-blur-sm"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const renderTaskWithSubtasks = (task: any) => {
    const subtasks = tasks.filter(t => t.parentId === task.id);
    return (
      <div key={task.id} className="flex flex-col gap-2">
        <TaskItem 
          task={task} 
          category={categories.find(c => c.id === task.categoryId)}
          project={projects.find(p => p.id === task.projectId)}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAddSubtask={() => {
            setParentTaskId(task.id);
            setShowTaskModal(true);
          }}
        />
        {subtasks.length > 0 && (
          <div className="pl-6 sm:pl-10 flex flex-col gap-2 border-l border-neutral-900 ml-3 sm:ml-5 -mt-1">
            {subtasks.map(subtask => (
              <TaskItem 
                key={subtask.id} 
                task={subtask} 
                category={categories.find(c => c.id === subtask.categoryId)}
                project={projects.find(p => p.id === subtask.projectId)}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] bg-background text-neutral-200 flex flex-col font-sans overflow-hidden">
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} user={user} />
      
      <Header
        user={user}
        logout={logout}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile App Mode Switch */}
        <div className="lg:hidden shrink-0 bg-transparent p-4 flex z-10 relative">
          <div className="flex w-full bg-transparent gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setAppMode('tasks')}
              className={cn(
                "flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                appMode === 'tasks' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white"
              )}
            >
              <ListTodo className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={() => setAppMode('projects')}
              className={cn(
                "flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                appMode === 'projects' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white"
              )}
            >
              <Rocket className="w-4 h-4" />
              Projects
            </button>
            <button
              onClick={() => setAppMode('calendar')}
              className={cn(
                "flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                appMode === 'calendar' ? "bg-primary text-primary-foreground shadow-sm" : "text-neutral-500 hover:text-white"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>

        <MobileNav 
          categories={categories}
          tasks={tasks}
          deleteCategory={deleteCategory}
        />

        <Sidebar 
          categories={categories}
          projects={projects}
          tasks={tasks}
          deleteCategory={deleteCategory}
        />

        {/* Main Content */}
        <section className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative">
          {appMode === 'tasks' ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-4 sm:mb-8 shrink-0 px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-10">
            <div className="flex-1 w-full max-w-2xl">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-1 sm:mb-2 text-white capitalize break-words pr-4">
                 {activeView === 'all' && 'Overview'}
                 {activeView === 'today' && 'Today'}
                 {activeView === 'upcoming' && 'Upcoming'}
                 {activeView.startsWith('category:') && categories.find(c => c.id === activeView.replace('category:', ''))?.name}
                 {activeView.startsWith('project:') && projects.find(p => p.id === activeView.replace('project:', ''))?.title}
              </h3>
              
              {activeView.startsWith('project:') ? (
                (() => {
                  const projectId = activeView.replace('project:', '');
                  const pTasks = tasks.filter(t => t.projectId === projectId);
                  const completed = pTasks.filter(t => t.completed).length;
                  const total = pTasks.length;
                  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                  return (
                    <div className="mt-3 bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 sm:p-4 max-w-sm">
                      <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
                        <span>Project Progress ({completed}/{total})</span>
                        <span className="font-medium text-white">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-neutral-500 text-sm italic">
                  {inProgressTasks.length} pending • {completedTasks.length} completed
                </p>
              )}
            </div>
            
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative shrink-0 flex-1 sm:flex-none">
                <button 
                  onClick={() => setShowSortMenu(p => !p)}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 w-full sm:w-auto bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-sm transition-colors text-neutral-300 h-full"
                >
                  <ArrowUpDown className="w-4 h-4 text-neutral-500" />
                  <span className="capitalize">{sortBy === 'alphabetical' ? 'A-Z' : sortBy}</span>
                </button>
                
                <AnimatePresence>
                  {showSortMenu && (
                   <motion.div 
                     initial={{ opacity: 0, y: -5, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -5, scale: 0.95 }}
                     transition={{ duration: 0.15 }}
                     className="absolute sm:right-0 left-0 sm:left-auto top-full mt-2 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl py-1 z-40 overflow-hidden"
                   >
                      <button 
                         onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                         className={cn("w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition flex items-center gap-3", sortBy === 'date' ? "text-white bg-white/5" : "text-neutral-400")}
                      >
                         <CalendarDays className="w-3.5 h-3.5" /> Date
                      </button>
                      <button 
                         onClick={() => { setSortBy('urgency'); setShowSortMenu(false); }}
                         className={cn("w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition flex items-center gap-3", sortBy === 'urgency' ? "text-white bg-white/5" : "text-neutral-400")}
                      >
                         <AlertCircle className="w-3.5 h-3.5" /> Urgency
                      </button>
                      <button 
                         onClick={() => { setSortBy('alphabetical'); setShowSortMenu(false); }}
                         className={cn("w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition flex items-center gap-3", sortBy === 'alphabetical' ? "text-white bg-white/5" : "text-neutral-400")}
                      >
                         <ArrowDownAZ className="w-3.5 h-3.5" /> Alphabetical
                      </button>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-10">
             <div className="space-y-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">
               {tasksLoading ? (
                 <div className="text-neutral-500 font-mono text-sm">Syncing with Firestore...</div>
               ) : tasks.length === 0 ? (
                 <div className="text-center py-20 flex flex-col items-center justify-center h-full border border-neutral-900/50 rounded-2xl bg-white/[0.01]">
                   <div className="w-16 h-16 rounded-full bg-neutral-900/50 flex items-center justify-center mb-4 border border-neutral-800/50">
                      <LayoutGrid className="w-6 h-6 text-neutral-600" />
                   </div>
                   <h3 className="text-white font-medium mb-1">No tasks found</h3>
                   <p className="text-neutral-500 text-sm">You're all caught up for now.</p>
                 </div>
               ) : (
                 <>
                   <AnimatePresence mode="popLayout">
                     <div className="flex flex-col gap-2.5">
                       {inProgressTasks.map(renderTaskWithSubtasks)}
                     </div>
                   </AnimatePresence>

                   {completedTasks.length > 0 && (
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="flex flex-col gap-2.5 mt-10 pt-6 border-t border-neutral-900/50 relative"
                     >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#050505] text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Completed</div>
                        <AnimatePresence mode="popLayout">
                          {completedTasks.map(renderTaskWithSubtasks)}
                        </AnimatePresence>
                     </motion.div>
                   )}
                 </>
               )}
             </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8 px-4 sm:px-6 lg:px-10 shrink-0 flex items-center gap-3 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none z-20">
             <div className="flex-1 drop-shadow-2xl pointer-events-auto">
               <SmartInput 
                 categories={categories} 
                 addCategory={addCategory} 
                 onTasksGenerated={handleTasksGenerated} 
               />
             </div>
             <button 
               onClick={() => { setParentTaskId(null); setShowTaskModal(true); }}
               className="w-12 h-12 sm:w-14 sm:h-14 bg-primary hover:opacity-90 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-primary-foreground rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shrink-0 pointer-events-auto"
             >
               <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
             </button>
          </div>
          </>
          ) : appMode === 'projects' ? (
            <ProjectsView 
              projects={projects}
              tasks={tasks}
              categories={categories}
              onProjectClick={(id) => {
                setAppMode('tasks');
                setActiveView(`project:${id}`);
              }}
              onDeleteProject={deleteProject}
              onNewProject={() => setShowProjectModal(true)}
              onNewCategory={() => setShowCategoryModal(true)}
            />
          ) : (
            <div className="flex-1 overflow-hidden">
               <CalendarView 
                 appointments={appointments}
                 categories={categories}
                 tasks={tasks}
                 onAddAppointment={(date) => {
                   setEditingAppointment(date ? { startTime: date.toISOString(), endTime: new Date(date.getTime() + 60*60*1000).toISOString() } : undefined);
                   setShowAppointmentModal(true);
                 }}
                 onEditAppointment={(appt) => {
                   setEditingAppointment(appt);
                   setShowAppointmentModal(true);
                 }}
                 onEditTask={(task) => {
                   setAppMode('tasks');
                   if (task.projectId) {
                     setActiveView(`project:${task.projectId}`);
                   } else if (task.categoryId) {
                     setActiveView(`category:${task.categoryId}`);
                   } else {
                     setActiveView('all');
                   }
                 }}
               />
            </div>
          )}
        </section>
      </main>

      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        categories={categories}
        initialData={editingAppointment}
        onSave={async (appt) => {
          if (editingAppointment?.id) {
            await updateAppointment(editingAppointment.id, appt);
          } else {
            await addAppointment(appt);
          }
        }}
        onDelete={async (id) => {
          await deleteAppointment(id);
        }}
      />
      <TaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
        categories={categories} 
        projects={projects}
        initialProjectId={activeView.startsWith('project:') ? activeView.replace('project:', '') : undefined}
        onSave={handleManualTaskSave} 
      />
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        categories={categories}
        onSave={addProject}
      />
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleManualCategorySave}
      />
      <InsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        tasks={tasks}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        tasks={tasks}
        onPurgeOldTasks={handlePurgeOldTasks}
      />
      <FocusModeModal
        isOpen={showFocusModeModal}
        onClose={() => setShowFocusModeModal(false)}
        tasks={tasks}
        onComplete={(id) => handleToggleTask(id, true)}
      />
    </div>
  );
}
