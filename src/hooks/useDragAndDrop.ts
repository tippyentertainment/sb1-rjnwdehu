import { Dispatch, SetStateAction } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Task } from '@/types/task';

interface UseDragAndDropProps {
  setTasks: Dispatch<SetStateAction<any>>;
  tasks: any;
  refetch: () => Promise<any>;
}

export const useDragAndDrop = ({ setTasks, tasks, refetch }: UseDragAndDropProps) => {
  const { toast } = useToast();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log('Drag end:', {
      source: source.droppableId,
      destination: destination.droppableId,
      taskId: draggableId
    });

    // Optimistically update the UI
    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const draggedTask = sourceColumn.find((task: Task) => task.id === draggableId);

    if (!draggedTask) {
      console.error('Task not found:', draggableId);
      return;
    }

    // Preserve all task properties, including assignees
    const updatedTask = {
      ...draggedTask,
      status: destination.droppableId,
      assignees: draggedTask.assignees || [], // Ensure assignees are preserved
    };

    // Create new arrays
    const newSourceColumn = sourceColumn.filter((task: Task) => task.id !== draggableId);
    const newDestColumn = [...destColumn];
    newDestColumn.splice(destination.index, 0, updatedTask);

    // Update local state immediately
    setTasks({
      ...tasks,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestColumn,
    });

    try {
      console.log('Updating task in database:', {
        taskId: draggableId,
        newStatus: destination.droppableId,
        task: updatedTask
      });

      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: destination.droppableId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId);

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }

      // Refetch to ensure consistency with the database
      await refetch();

      toast({
        title: "Task updated",
        description: `Task moved to ${destination.droppableId}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Revert the local state on error
      setTasks({
        ...tasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });

      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleDragEnd };
};