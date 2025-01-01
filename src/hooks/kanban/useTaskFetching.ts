import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_COLUMNS } from '@/components/Kanban/kanbanData';

export const fetchTasksWithRelations = async (organizationId: string) => {
  console.log('Fetching tasks with relations for org:', organizationId);

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignees:task_assignees(
          user:profiles(*)
        ),
        tags:task_tags(
          tag:tags(*)
        ),
        checklist:checklist_items(*),
        comments:task_comments(
          *,
          user:profiles(*)
        ),
        attachments(*)
      `)
      .eq('organization_id', organizationId)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    console.log('Fetched tasks:', tasks);

    // Group tasks by status
    const groupedTasks = DEFAULT_COLUMNS.reduce((acc, column) => {
      acc[column.id] = tasks
        ?.filter(task => task.status === column.id)
        ?.map(task => ({
          ...task,
          assignees: task.assignees?.map(a => ({
            ...a.user,
            id: a.user.id
          })) || [],
          tags: task.tags?.map(t => t.tag) || [],
        })) || [];
      return acc;
    }, {});

    console.log('Grouped tasks:', groupedTasks);
    return groupedTasks;

  } catch (error) {
    console.error('Error in fetchTasksWithRelations:', error);
    throw error;
  }
};