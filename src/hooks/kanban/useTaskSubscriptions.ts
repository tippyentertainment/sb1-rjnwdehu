import { supabase } from '@/integrations/supabase/client';

export const setupTaskSubscriptions = (organizationId: string, onTaskChange: () => void) => {
  const tasksChannel = supabase.channel('tasks_realtime')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `organization_id=eq.${organizationId}`
      }, 
      async () => {
        console.log('Task updated, refetching all tasks');
        await onTaskChange();
      }
    )
    .subscribe();

  // Subscribe to related tables
  const relatedTables = ['checklist_items', 'task_assignees', 'task_tags', 'task_comments', 'attachments'];
  
  const subscriptions = relatedTables.map(table => 
    supabase.channel(`${table}_changes`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        async () => {
          console.log(`${table} changed, refetching tasks`);
          await onTaskChange();
        }
      )
      .subscribe()
  );

  return () => {
    tasksChannel.unsubscribe();
    subscriptions.forEach(subscription => subscription.unsubscribe());
  };
};