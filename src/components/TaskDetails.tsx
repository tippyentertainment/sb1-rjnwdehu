import React from 'react';
import type { Task } from '@/types/task';
import { Dialog, DialogContent } from './ui/dialog';
import { useToast } from './ui/use-toast';
import TaskDetailsContainer from './TaskDetails/TaskDetailsContainer';
import { useTaskDetailsState } from './TaskDetails/TaskDetailsState';
import { saveTask } from './TaskDetails/TaskSaveHandler';
import MoveTaskSection from './TaskDetails/MoveTaskSection';

export interface TaskDetailsProps {
  task: Task;
  currentColumn: string;
  onUpdate: (task: Task) => void;
  isNewTask?: boolean;
  columnColors: Record<string, string>;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allTasks?: { [key: string]: Task[] };
  selectedColumn?: string;
  onColumnSelect?: (column: string) => void;
  onMove?: () => void;
  onUserClick?: (userId: string) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ 
  task, 
  currentColumn, 
  onUpdate,
  isNewTask = false,
  columnColors,
  onClose,
  open,
  onOpenChange,
  allTasks = {},
  selectedColumn = currentColumn,
  onColumnSelect,
  onMove,
  onUserClick,
}) => {
  console.log('TaskDetails rendered:', { 
    taskId: task.id, 
    currentColumn, 
    isNewTask, 
    open,
    allTasksKeys: Object.keys(allTasks),
    assignees: task.assignees,
    tags: task.tags || []
  });
  
  const { toast } = useToast();
  const {
    title,
    description,
    currentTask,
    selectedUsers,
    pendingChanges,
    isDirty,
    setTitle,
    setDescription,
    handleTaskContentUpdate,
    handleUserSelection,
    handleUserRemoval,
    handleTagsUpdate,
    handleAttachmentsUpdate,
    handleCommentsUpdate,
    handleDatesUpdate
  } = useTaskDetailsState(task, onUpdate, isNewTask);

  console.log('Current task state:', { 
    currentTask, 
    selectedUsers,
    pendingChanges,
    isDirty,
    title,
    description,
    status: currentColumn,
    tags: currentTask.tags || []
  });

  const handleSaveAndClose = async () => {
    console.log('Save and close triggered. isDirty:', isDirty);
    console.log('Current state before save:', {
      title,
      description,
      selectedUsers,
      currentColumn,
      pendingChanges,
      tags: currentTask.tags || []
    });

    if (!title.trim()) {
      console.log('Title validation failed - empty title');
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTask = {
        ...currentTask,
        ...pendingChanges,
        title,
        description,
        assignees: selectedUsers,
        status: currentColumn,
        organization_id: currentTask.organization_id,
        tags: currentTask.tags || []
      };

      console.log('Saving task with data:', updatedTask);

      const savedTask = await saveTask(updatedTask, selectedUsers, task);
      console.log('Successfully saved task:', savedTask);
      
      onUpdate({
        ...savedTask,
        assignees: selectedUsers,
        tags: updatedTask.tags
      });
      
      toast({
        title: "Success",
        description: isNewTask ? "Task created successfully" : "Task updated successfully",
      });

      if (onClose) {
        onClose();
      }
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    console.log('Closing task details');
    if (onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      <TaskDetailsContainer
        task={currentTask}
        onTaskContentUpdate={handleTaskContentUpdate}
        onClose={handleClose}
      />
      <div className="p-4 border-t">
        <MoveTaskSection
          selectedColumn={selectedColumn}
          onColumnSelect={onColumnSelect}
          onMove={onMove}
          columnColors={columnColors}
        />
      </div>
    </div>
  );

  if (typeof open !== 'undefined') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[800px] w-[90vw] h-[90vh] p-0 gap-0 overflow-hidden">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};

export default TaskDetails;