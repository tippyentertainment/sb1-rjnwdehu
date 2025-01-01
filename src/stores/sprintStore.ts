import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Sprint, Task } from '../types/sprint';

interface SprintStore {
  sprints: Sprint[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchSprints: () => Promise<void>;
  fetchTasks: (sprintId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
}

export const useSprintStore = create<SprintStore>((set) => ({
  sprints: [],
  tasks: [],
  loading: false,
  error: null,

  fetchSprints: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      set({ sprints: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchTasks: async (sprintId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('sprint_id', sprintId);

      if (error) throw error;
      set({ tasks: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (task) => {
    try {
      const { error } = await supabase.from('tasks').insert([task]);
      if (error) throw error;
      await useSprintStore.getState().fetchTasks(task.sprint_id);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));