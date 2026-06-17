import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar as CalIcon, CalendarDays, CalendarRange } from 'lucide-react';
import { Appointment, Category, Task } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  appointments: Appointment[];
  categories: Category[];
  tasks: Task[];
  onAddAppointment: (date?: Date) => void;
  onEditAppointment: (appt: Appointment) => void;
  onEditTask: (task: Task) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({ appointments, categories, tasks, onAddAppointment, onEditAppointment, onEditTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prev = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    else setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
  };

  const next = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    else setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  };

  const today = () => setCurrentDate(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const isTodayDate = (date: Date) => {
    const d = new Date();
    return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  };

  const getApptsForDate = (date: Date) => {
    const list = appointments.filter(a => {
      const d = new Date(a.startTime);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).map(a => ({ ...a, itemType: 'appointment' as const }));

    const tasksList = tasks.filter(t => {
      if (!t.deadline || t.completed) return false;
      const d = new Date(t.deadline);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).map(t => ({ ...t, itemType: 'task' as const, startTime: t.deadline }));

    const merged = [...list, ...tasksList];
    return merged.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate days to render based on viewMode
  let renderDays: { date: Date, isCurrentMonth: boolean }[] = [];

  if (viewMode === 'month') {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    // Prev month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      renderDays.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      renderDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month padding to fill out the grid of 42
    const currentLength = renderDays.length;
    for (let i = 1; i <= 42 - currentLength; i++) {
      renderDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
  } else if (viewMode === 'week') {
    let currentDayOfWeek = currentDate.getDay();
    currentDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // 0 for Monday
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      renderDays.push({ date: d, isCurrentMonth: d.getMonth() === month });
    }
  } else {
    renderDays = [{ date: currentDate, isCurrentMonth: true }];
  }

  let headerLabel = '';
  if (viewMode === 'month') {
    headerLabel = `${monthNames[month]} ${year}`;
  } else if (viewMode === 'week') {
    const d1 = renderDays[0].date;
    const d2 = renderDays[6].date;
    if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
      headerLabel = `${monthNames[d1.getMonth()]} ${d1.getFullYear()}`;
    } else if (d1.getFullYear() === d2.getFullYear()) {
      headerLabel = `${monthNames[d1.getMonth()]} - ${monthNames[d2.getMonth()]} ${d1.getFullYear()}`;
    } else {
      headerLabel = `${monthNames[d1.getMonth()]} ${d1.getFullYear()} - ${monthNames[d2.getMonth()]} ${d2.getFullYear()}`;
    }
  } else {
    headerLabel = `${monthNames[month]} ${currentDate.getDate()}, ${year}`;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 px-4 sm:px-6 flex-shrink-0 gap-4">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start w-full">
            <h1 className="text-xl sm:text-2xl font-serif tracking-tight">{headerLabel}</h1>
            <button onClick={today} className="text-xs sm:text-sm text-neutral-500 hover:text-white transition-colors font-medium sm:ml-4 bg-neutral-900 sm:bg-transparent px-3 py-1 sm:p-0 rounded-full">
              Today
            </button>
          </div>
          {/* View Mode Switcher for Mobile */}
          <div className="flex sm:hidden bg-neutral-900/50 p-1 rounded-xl shadow-inner border border-neutral-800 w-full mt-2">
            <button onClick={() => setViewMode('day')} className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", viewMode === 'day' ? "bg-primary text-primary-foreground" : "text-neutral-500")}><CalIcon className="w-3.5 h-3.5 mx-auto mb-1" />Day</button>
            <button onClick={() => setViewMode('week')} className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", viewMode === 'week' ? "bg-primary text-primary-foreground" : "text-neutral-500")}><CalendarDays className="w-3.5 h-3.5 mx-auto mb-1" />Week</button>
            <button onClick={() => setViewMode('month')} className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", viewMode === 'month' ? "bg-primary text-primary-foreground" : "text-neutral-500")}><CalendarRange className="w-3.5 h-3.5 mx-auto mb-1" />Month</button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
           {/* View Mode Switcher for Desktop */}
           <div className="hidden sm:flex bg-neutral-900/50 p-1 rounded-full border border-neutral-800">
            <button onClick={() => setViewMode('day')} className={cn("px-4 py-1.5 text-xs font-medium rounded-full transition-all", viewMode === 'day' ? "bg-primary text-primary-foreground" : "text-neutral-500 hover:text-white")}>Day</button>
            <button onClick={() => setViewMode('week')} className={cn("px-4 py-1.5 text-xs font-medium rounded-full transition-all", viewMode === 'week' ? "bg-primary text-primary-foreground" : "text-neutral-500 hover:text-white")}>Week</button>
            <button onClick={() => setViewMode('month')} className={cn("px-4 py-1.5 text-xs font-medium rounded-full transition-all", viewMode === 'month' ? "bg-primary text-primary-foreground" : "text-neutral-500 hover:text-white")}>Month</button>
          </div>

          <div className="flex items-center bg-neutral-900 rounded-full p-1 border border-neutral-800">
            <button onClick={prev} className="p-1.5 sm:p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="w-px h-4 bg-neutral-800 mx-0.5 sm:mx-1" />
            <button onClick={next} className="p-1.5 sm:p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <button 
            onClick={() => onAddAppointment()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 transition-transform shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-6 pb-28 sm:pb-8 hide-scrollbar">
        <div className={cn("h-full flex flex-col min-w-0")}>
          {/* Days Header */}
          {(viewMode === 'month' || viewMode === 'week') && (
            <div className={cn("grid grid-cols-7 gap-px mb-2", viewMode === 'week' && "hidden md:grid")}>
              {dayNames.map(day => (
                <div key={day} className="text-center sm:text-right text-[10px] sm:text-xs font-mono text-neutral-500 uppercase tracking-wider pr-1 sm:pr-4 pb-2">
                  {day}
                </div>
              ))}
            </div>
          )}

          <div className={cn(
             "gap-px flex-1",
             viewMode === 'month' ? "grid grid-cols-7" : "",
             viewMode === 'week' ? "flex flex-col md:grid md:grid-cols-7" : "",
             viewMode === 'day' ? "flex flex-col" : ""
          )}>
            {renderDays.map((dayObj, i) => {
              const currentGlobalDate = dayObj.date;
              const appts = getApptsForDate(currentGlobalDate);
              const isCurrDay = isTodayDate(currentGlobalDate);
              const isOtherMonth = !dayObj.isCurrentMonth && viewMode === 'month';
              
              return (
                <div 
                  key={i} 
                  onClick={() => onAddAppointment(new Date(currentGlobalDate.getFullYear(), currentGlobalDate.getMonth(), currentGlobalDate.getDate(), 12, 0, 0))}
                  className={cn(
                    "flex flex-col rounded-xl transition-colors cursor-pointer group border shrink-0",
                    viewMode === 'month' ? "p-1 sm:p-3 gap-1 sm:gap-2 m-0.5 sm:m-1" : "p-3 sm:p-4 gap-3 sm:gap-4 m-1 sm:m-2",
                    isCurrDay ? "bg-neutral-900/60 border-neutral-700" : isOtherMonth ? "bg-black/50 border-transparent opacity-50" : "bg-[#0A0A0A] border-transparent hover:border-neutral-800",
                    viewMode === 'month' ? "min-h-[80px] sm:min-h-[120px]" : viewMode === 'week' ? "min-h-[100px] sm:min-h-[200px]" : "min-h-[120px]"
                  )}
                >
                  <div className={cn("flex justify-between items-center", (viewMode === 'day' || viewMode === 'week') ? "border-b border-neutral-900 pb-2 sm:pb-3" : "")}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={cn(
                        "text-[10px] sm:text-sm font-medium w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors shrink-0",
                        isCurrDay ? "bg-primary text-primary-foreground font-bold" : "text-neutral-500 group-hover:text-white"
                      )}>
                        {currentGlobalDate.getDate()}
                      </span>
                      {(viewMode === 'day' || (viewMode === 'week')) && (
                         <span className={cn("text-neutral-400 font-mono text-sm tracking-widest uppercase", viewMode === 'week' && "md:hidden")}>
                           {dayNames[currentGlobalDate.getDay() === 0 ? 6 : currentGlobalDate.getDay() - 1]}
                         </span>
                      )}
                    </div>
                    {appts.length > 0 && viewMode !== 'day' && (
                       <span className="text-[9px] sm:text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-full hidden sm:block">
                         {appts.length}
                       </span>
                    )}
                  </div>

                  <div className={cn("flex flex-col gap-1 sm:gap-1.5 overflow-y-auto hide-scrollbar", viewMode === 'month' ? "max-h-[140px]" : "flex-1")} onClick={e => e.stopPropagation()}>
                    <AnimatePresence>
                      {appts.map(appt => {
                        const cat = categories.find(c => c.id === appt.categoryId);
                        const isTask = appt.itemType === 'task';
                        const isMultiHour = !isTask && (new Date((appt as any).endTime).getTime() - new Date(appt.startTime).getTime()) > 3600000;
                        const urgencyColors: any = {
                          low: "border-emerald-500",
                          medium: "border-blue-400",
                          high: "border-orange-400",
                          critical: "border-rose-500"
                        };
                        return (
                          <motion.div
                            layout
                            key={appt.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => isTask ? onEditTask(appt as any) : onEditAppointment(appt as any)}
                            className={cn(
                              "text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1.5 rounded-sm sm:rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 sm:gap-1.5 border border-transparent hover:border-white/10",
                              cat && !isTask ? "bg-opacity-10 text-white" : "bg-neutral-800 text-neutral-300",
                              isMultiHour && "font-semibold",
                              (viewMode === 'day' || viewMode === 'week') ? "text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4" : ""
                            )}
                            style={cat && !isTask 
                              ? { backgroundColor: `${cat.color}20`, borderLeft: `2px solid ${cat.color}` } 
                              : isTask && (appt as any).urgency
                                ? {} // Border logic handed to className or inline below
                                : { borderLeft: '2px solid #525252' }}
                            title={`${formatTime(appt.startTime)} - ${appt.title}`}
                          >
                            <span className={cn("font-medium opacity-70", (viewMode === 'day' || viewMode === 'week') ? "mr-2 sm:mr-4 inline-block min-w-[34px]" : "hidden sm:inline-block sm:min-w-[30px]")}>{formatTime(appt.startTime)}</span>
                            {isTask && (
                              <div className={cn("w-1.5 h-1.5 rounded-full mr-1 shrink-0 bg-transparent border hidden sm:block", 
                                urgencyColors[(appt as any).urgency] || 'border-neutral-500')} 
                              />
                            )}
                            <span className={cn("truncate flex-1 tracking-tight", isTask ? "italic text-neutral-400" : "")}>{appt.title}</span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
