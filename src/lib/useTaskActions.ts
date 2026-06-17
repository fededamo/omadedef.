import { useCallback, useEffect, useRef } from 'react';

export function useTaskActions(
  tasks: any[], 
  addTask: any, 
  addTasksBatch: any,
  updateTask: any, 
  deleteTasksBatch: any, 
  tasksLoading: boolean,
  parentTaskId: string | null
) {
  const hasAutoPurged = useRef(false);

  useEffect(() => {
    if (hasAutoPurged.current || tasksLoading || tasks.length === 0) return;
    const autoPurge = localStorage.getItem('omadedef_autopurge') === 'true';
    if (autoPurge) {
      hasAutoPurged.current = true;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);
      if (oldTaskIds.length > 0) {
        deleteTasksBatch(oldTaskIds);
      }
    }
  }, [tasksLoading, tasks, deleteTasksBatch]);

  const handlePurgeOldTasks = useCallback(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);
    if (oldTaskIds.length > 0) {
      await deleteTasksBatch(oldTaskIds);
    }
  }, [tasks, deleteTasksBatch]);

  const handleTasksGenerated = useCallback(async (generatedTasks: any[]) => {
    const tasksToAdd = generatedTasks.map((taskData) => {
      let deadlineIso = "";
      if (taskData.suggestedDeadlineDaysAt) {
        const d = new Date();
        d.setDate(d.getDate() + taskData.suggestedDeadlineDaysAt);
        deadlineIso = d.toISOString();
      }
      return {
        title: taskData.title,
        description: taskData.description || '',
        categoryId: taskData.categoryId || '',
        urgency: taskData.urgency || 'medium',
        deadline: deadlineIso,
        completed: false
      };
    });

    if (tasksToAdd.length > 0) {
      await addTasksBatch(tasksToAdd);
    }
  }, [addTasksBatch]);

  const handleManualTaskSave = useCallback(async (taskData: any) => {
    await addTask({ 
      ...taskData, 
      completed: false, 
      parentId: parentTaskId || undefined 
    });
  }, [addTask, parentTaskId]);

  const handleToggleTask = useCallback(async (id: string, completed: boolean) => {
    await updateTask(id, { completed, completedAt: completed ? new Date().toISOString() : undefined });
    
    // Recurrence logic locally since server-side proxy is removed
    if (completed) {
      const task = tasks.find(t => t.id === id);
      if (task && task.recurrence && task.recurrence !== 'none' && !task.nextRecurrenceCreated) {
        const nextDeadline = new Date(task.deadline ? task.deadline : new Date().toISOString());
        switch (task.recurrence) {
          case 'daily': nextDeadline.setDate(nextDeadline.getDate() + 1); break;
          case 'weekdays':
            do { nextDeadline.setDate(nextDeadline.getDate() + 1); } 
            while (nextDeadline.getDay() === 0 || nextDeadline.getDay() === 6);
            break;
          case 'weekly': nextDeadline.setDate(nextDeadline.getDate() + 7); break;
          case 'biweekly': nextDeadline.setDate(nextDeadline.getDate() + 14); break;
          case 'monthly': nextDeadline.setMonth(nextDeadline.getMonth() + 1); break;
          case 'yearly': nextDeadline.setFullYear(nextDeadline.getFullYear() + 1); break;
        }

        const newTaskData = {
          title: task.title,
          description: task.description,
          categoryId: task.categoryId,
          projectId: task.projectId,
          urgency: task.urgency,
          deadline: nextDeadline.toISOString(),
          recurrence: task.recurrence,
          completed: false,
        };

        // Update the current task to prevent infinite recurrence creation
        await updateTask(task.id, { nextRecurrenceCreated: true });
        await addTask(newTaskData);
      }
    } else {
      // If unchecked, allow generating recurrence again later if needed
      const task = tasks.find(t => t.id === id);
      if (task && task.nextRecurrenceCreated) {
        await updateTask(id, { nextRecurrenceCreated: false });
      }
    }
  }, [tasks, updateTask, addTask]);

  const handleDeleteTask = useCallback(async (id: string) => {
    const subtasks = tasks.filter(t => t.parentId === id);
    const idsToDelete = [id, ...subtasks.map(t => t.id)];
    await deleteTasksBatch(idsToDelete);
  }, [tasks, deleteTasksBatch]);

  return {
    handlePurgeOldTasks,
    handleTasksGenerated,
    handleManualTaskSave,
    handleToggleTask,
    handleDeleteTask
  };
}
