import { useState, useMemo } from 'react';

export function useTaskSorting(tasks: any[], activeView: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'alphabetical'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Filter by search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !(t.description && t.description.toLowerCase().includes(q))) {
          return false;
        }
      }

      if (activeView === 'all') return true;
      if (activeView === 'today') {
        if (!t.deadline) return false;
        // check if it's today
        const date = new Date(t.deadline);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      }
      if (activeView === 'upcoming') {
        if (!t.deadline) return false;
        const date = new Date(t.deadline);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date > today;
      }
      if (activeView.startsWith('category:')) {
        return t.categoryId === activeView.replace('category:', '');
      }
      if (activeView.startsWith('project:')) {
        return t.projectId === activeView.replace('project:', '');
      }
      return true;
    });
  }, [tasks, activeView, searchQuery]);

  const sortTasks = (tasksArr: any[]) => {
    return [...tasksArr].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'urgency') {
        const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const wA = urgencyWeight[a.urgency as keyof typeof urgencyWeight] || 0;
        const wB = urgencyWeight[b.urgency as keyof typeof urgencyWeight] || 0;
        if (wA !== wB) return wB - wA;
        // fallback to date
        if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        return 0;
      } else { // 'date'
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return 0;
      }
    });
  };

  const inProgressTasks = useMemo(() => sortTasks(filteredTasks.filter(t => !t.completed && !t.parentId)), [filteredTasks, sortBy]);
  const completedTasks = useMemo(() => sortTasks(filteredTasks.filter(t => t.completed && !t.parentId)), [filteredTasks, sortBy]);

  return {
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    showSortMenu, setShowSortMenu,
    inProgressTasks, completedTasks
  };
}
