import { useChecklistState } from './useChecklistState';
import { useChecklistSubscription } from './useChecklistSubscription';
import { useChecklistOperations } from './useChecklistOperations';
import type { ChecklistItem } from '@/types/task';

interface UseChecklistProps {
  checklist: ChecklistItem[];
  onUpdate: (checklist: ChecklistItem[]) => void;
  taskId?: string;
}

export const useChecklist = ({ checklist, onUpdate, taskId }: UseChecklistProps) => {
  const {
    localChecklist,
    progress,
    updateLocalChecklist
  } = useChecklistState({ checklist, onUpdate });

  const {
    handleAddItem,
    handleToggleItem,
    handleDeleteItem
  } = useChecklistOperations({ 
    taskId, 
    updateLocalChecklist,
    localChecklist 
  });

  // Set up realtime subscription
  useChecklistSubscription({ taskId, updateLocalChecklist });

  return {
    localChecklist,
    handleAddItem,
    handleToggleItem,
    handleDeleteItem,
    progress
  };
};