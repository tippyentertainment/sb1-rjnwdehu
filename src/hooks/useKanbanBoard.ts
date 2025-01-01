import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Task, Tag } from '@/types/task';
import { DEFAULT_COLUMNS } from '@/components/Kanban/kanbanData';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type { TasksByColumn } from '@/types/kanban';

interface DatabaseTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  deleted: boolean | null;
  sprint_id: string | null;
  scope_id: string | null;
  organization_id: string | null;
  assignees: { user: { id: string; full_name: string; avatar_url: string; } | null; }[];
  tags: { tag: { id: string; name: string; color: string; } | null; }[];
}

export const useKanbanBoard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasksState] = useState<TasksByColumn>(() => 
    DEFAULT_COLUMNS.reduce((acc, column) => ({
      ...acc,
      [column.id]: []
    }), {} as TasksByColumn)
  );
  const organizationId = localStorage.getItem('currentOrganizationId');

  const {
    data: fetchedTasks = {},
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks', organizationId],
    queryFn: async () => {
      console.log('Fetching tasks for organization:', organizationId);
      
      if (!organizationId) {
        console.log('No organization ID found, returning empty columns');
        return DEFAULT_COLUMNS.reduce((acc, column) => ({
          ...acc,
          [column.id]: []
        }), {} as TasksByColumn);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('No authenticated session found, redirecting to login');
        navigate('/login');
        return DEFAULT_COLUMNS.reduce((acc, column) => ({
          ...acc,
          [column.id]: []
        }), {} as TasksByColumn);
      }

      try {
        console.log('Fetching tasks from database...');
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            status,
            created_by,
            created_at,
            updated_at,
            start_date,
            end_date,
            deleted,
            sprint_id,
            scope_id,
            organization_id,
            assignees:task_assignees(
              user:profiles(
                id,
                full_name,
                avatar_url
              )
            ),
            tags:task_tags(
              tag:tags(
                id,
                name,
                color
              )
            )
          `)
          .eq('organization_id', organizationId)
          .eq('deleted', false)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching tasks:', error);
          throw error;
        }

        console.log('Successfully fetched tasks:', tasks?.length);
        const typedTasks = tasks as unknown as DatabaseTask[];

        const groupedTasks = DEFAULT_COLUMNS.reduce((acc, column) => {
          const columnTasks = typedTasks
            ?.filter((task) => task.status === column.id)
            ?.map((task) => ({
              ...task,
              assignees: task.assignees
                ?.map(a => a.user?.id)
                ?.filter((id): id is string => id !== null) || [],
              tags: task.tags
                ?.map(t => t.tag)
                ?.filter((tag): tag is Tag => tag !== null && 'id' in tag && 'name' in tag && 'color' in tag) || [],
              dependencies: [],
              comments: [],
              checklist: [],
              attachments: []
            })) || [];
            
          acc[column.id] = columnTasks;
          return acc;
        }, {} as TasksByColumn);

        console.log('Grouped tasks by column:', groupedTasks);
        return groupedTasks;
      } catch (error) {
        console.error('Error in task fetching:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 300000,   // Keep unused data for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000
  });

  const setTasks = useCallback((newTasks: TasksByColumn | ((prev: TasksByColumn) => TasksByColumn)) => {
    setTasksState(newTasks);
  }, []);

  useEffect(() => {
    if (fetchedTasks && Object.keys(fetchedTasks).length > 0) {
      console.log('Updating tasks state with fetched data');
      setTasksState(fetchedTasks);
    }
  }, [fetchedTasks]);

  return {
    tasks,
    setTasks,
    organizationId,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
};