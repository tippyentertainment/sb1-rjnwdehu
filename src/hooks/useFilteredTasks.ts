import { useMemo } from 'react';
import type { Task } from '../types/task';

interface UseFilteredTasksProps {
  tasks: { [key: string]: Task[] };
  searchTerm: string;
  sortBy: string;
  selectedUser?: string;
}

const getChecklistProgress = (task: Task) => {
  if (!task.checklist || task.checklist.length === 0) return 0;
  return (task.checklist.filter(item => item.completed).length / task.checklist.length) * 100;
};

const getTaskDate = (task: Task) => {
  if (!task.created_at) {
    console.warn('Task missing created_at:', task);
    return new Date();
  }
  return new Date(task.created_at);
};

const formatTaskId = (id: string) => {
  return id.replace(/-/g, '').substring(0, 6).toUpperCase();
};

export const useFilteredTasks = ({
  tasks,
  searchTerm,
  sortBy,
  selectedUser
}: UseFilteredTasksProps) => {
  return useMemo(() => {
    const filtered: { [key: string]: Task[] } = {};

    Object.keys(tasks).forEach((columnId) => {
      let columnTasks = [...(tasks[columnId] || [])];

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchWithoutPrefix = searchLower.replace(/^tsk/, '');

        columnTasks = columnTasks.filter(task => {
          // Basic fields check
          const taskIdMatch = formatTaskId(task.id).toLowerCase().includes(searchWithoutPrefix);
          const titleMatch = task.title?.toLowerCase().includes(searchLower);
          const descMatch = task.description?.toLowerCase().includes(searchLower);
          
          // Only check additional fields if basic fields don't match
          if (taskIdMatch || titleMatch || descMatch) return true;

          // Optimize tag search
          const tagMatch = task.tags?.some(tag => 
            tag.name.toLowerCase().includes(searchLower)
          );
          if (tagMatch) return true;

          // Optimize assignee search
          const assigneeMatch = task.assignees?.includes(searchLower);
          if (assigneeMatch) return true;

          // Only check these if really necessary
          const checklistMatch = task.checklist?.some(item =>
            item.title.toLowerCase().includes(searchLower)
          );
          if (checklistMatch) return true;

          // Limit comment search to recent comments
          const recentComments = task.comments?.slice(-5) || [];
          return recentComments.some(comment =>
            comment.content.toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply user filter
      if (selectedUser && selectedUser !== 'all') {
        columnTasks = columnTasks.filter(task => 
          task.assignees?.includes(selectedUser)
        );
      }

      // Apply sorting
      columnTasks.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return getTaskDate(b).getTime() - getTaskDate(a).getTime();
          case 'oldest':
            return getTaskDate(a).getTime() - getTaskDate(b).getTime();
          case 'a-z':
            return (a.title || '').localeCompare(b.title || '');
          case 'z-a':
            return (b.title || '').localeCompare(a.title || '');
          case 'checklist':
            return getChecklistProgress(b) - getChecklistProgress(a);
          default:
            return 0;
        }
      });

      filtered[columnId] = columnTasks;
    });

    return filtered;
  }, [tasks, searchTerm, sortBy, selectedUser]);
};