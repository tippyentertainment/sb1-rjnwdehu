import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChecklistItem } from '@/types/task';

interface UseChecklistSubscriptionProps {
  taskId?: string;
  updateLocalChecklist: (checklist: ChecklistItem[]) => void;
}

export const useChecklistSubscription = ({ taskId, updateLocalChecklist }: UseChecklistSubscriptionProps) => {
  useEffect(() => {
    if (!taskId) {
      console.log('No taskId provided to useChecklistSubscription');
      return;
    }

    console.log('Setting up checklist subscription for task:', taskId);
    
    const subscription = supabase
      .channel(`checklist_${taskId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'checklist_items',
          filter: `task_id=eq.${taskId}`
        }, 
        async (payload) => {
          console.log('Checklist change detected:', payload);
          const { data, error } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('task_id', taskId)
            .order('position');

          if (error) {
            console.error('Error fetching checklist items:', error);
            return;
          }

          const items: ChecklistItem[] = data.map(item => ({
            id: item.id,
            title: item.title,
            completed: Boolean(item.completed),
            createdAt: new Date(item.created_at),
            mentions: item.mentions || []
          }));

          console.log('Updated checklist items:', items);
          updateLocalChecklist(items);
        }
      )
      .subscribe((status) => {
        console.log(`Checklist subscription status for task ${taskId}:`, status);
      });

    return () => {
      console.log('Cleaning up checklist subscription');
      subscription.unsubscribe();
    };
  }, [taskId, updateLocalChecklist]);
};