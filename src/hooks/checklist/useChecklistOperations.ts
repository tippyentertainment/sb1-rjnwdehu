import { supabase } from '@/integrations/supabase/client';
import type { ChecklistItem } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

interface UseChecklistOperationsProps {
  taskId?: string;
  updateLocalChecklist: (checklist: ChecklistItem[]) => void;
  localChecklist: ChecklistItem[];
}

export const useChecklistOperations = ({ 
  taskId, 
  updateLocalChecklist,
  localChecklist 
}: UseChecklistOperationsProps) => {
  const { toast } = useToast();

  const handleAddItem = async (title: string, mentions: string[]) => {
    try {
      if (!taskId) {
        throw new Error('Task ID is required to add checklist item');
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // Create temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Prepare new item
      const newItem = {
        task_id: taskId,
        title,
        completed: false,
        created_by: userId,
        mentions,
        position: localChecklist.length
      };

      // Optimistically update local state
      const optimisticItem: ChecklistItem = {
        id: tempId,
        title,
        completed: false,
        createdAt: new Date(),
        mentions: mentions || []
      };
      
      updateLocalChecklist([...localChecklist, optimisticItem]);

      console.log('Adding new checklist item:', newItem);

      const { data, error } = await supabase
        .from('checklist_items')
        .insert([newItem])
        .select()
        .single();

      if (error) {
        // Revert optimistic update on error
        updateLocalChecklist(localChecklist);
        throw error;
      }

      // Update local state with actual database item
      const updatedChecklist = localChecklist.map(item => 
        item.id === tempId ? {
          id: data.id,
          title: data.title,
          completed: data.completed,
          createdAt: new Date(data.created_at),
          mentions: data.mentions || []
        } : item
      );
      
      updateLocalChecklist(updatedChecklist);
      console.log('Successfully added checklist item:', data);

    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to add checklist item",
        variant: "destructive",
      });
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      const currentItem = localChecklist.find(item => item.id === itemId);
      if (!currentItem) {
        throw new Error('Checklist item not found');
      }

      // Optimistically update local state
      const updatedChecklist = localChecklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      updateLocalChecklist(updatedChecklist);

      console.log('Toggling checklist item:', itemId);
      
      const { error } = await supabase
        .from('checklist_items')
        .update({ completed: !currentItem.completed })
        .eq('id', itemId);

      if (error) {
        // Revert optimistic update on error
        updateLocalChecklist(localChecklist);
        throw error;
      }

      console.log('Successfully toggled checklist item:', itemId);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to update checklist item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Optimistically update local state
      const updatedChecklist = localChecklist.filter(item => item.id !== itemId);
      updateLocalChecklist(updatedChecklist);

      console.log('Deleting checklist item:', itemId);

      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        // Revert optimistic update on error
        updateLocalChecklist(localChecklist);
        throw error;
      }

      console.log('Successfully deleted checklist item:', itemId);
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to delete checklist item",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddItem,
    handleToggleItem,
    handleDeleteItem
  };
};