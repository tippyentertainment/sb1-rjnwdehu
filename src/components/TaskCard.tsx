import React, { useState } from 'react';
import type { Task } from '../types/task';
import { useToast } from '../hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import TaskCardActions from './TaskCard/TaskCardActions';
import { getProgressColor } from '@/utils/progressColors';
import { useTaskSubscriptions } from './TaskCard/TaskSubscriptions';
import { useTaskAssignees, mapAssignedUsers } from './TaskCard/TaskAssignees';
import { calculateChecklistProgress } from '@/utils/taskCalculations';
import TaskCardWrapper from './TaskCard/TaskCardWrapper';
import { useTaskDataFetcher } from './TaskCard/TaskDataFetcher';
import TaskMetadata from './TaskCard/TaskMetadata';
import { handleTaskUpdate } from './TaskCard/TaskUpdateHandler';
import { useAssigneeSync } from './TaskCard/AssigneeSync';
import { supabase } from '@/integrations/supabase/client';

interface TaskCardProps {
  task: Task;
  provided: any;
  onUpdate?: (task: Task) => void;
  currentColumn: string;
  isNewTask?: boolean;
  columnColors?: Record<string, string>;
  isDragging?: boolean;
  onTaskClick?: (task: Task) => void;
  onUserClick?: (userId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  provided, 
  onUpdate, 
  currentColumn,
  isNewTask = false,
  columnColors,
  isDragging = false
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const { data: users = [], isLoading: isLoadingUsers } = useUsers(task.organization_id);
  
  const {
    currentAssignees,
    setCurrentAssignees,
    tags,
    checklist,
    comments,
    prefetchTaskData
  } = useTaskDataFetcher(currentTask, users);

  const handleAssigneesUpdate = async () => {
    console.log('Assignees subscription update received for task:', task.id);
    try {
      const { data: assignees, error } = await supabase
        .from('task_assignees')
        .select('user_id')
        .eq('task_id', task.id);

      if (error) {
        console.error('Error fetching assignees:', error);
        throw error;
      }

      const assigneeIds = assignees?.map(a => a.user_id) || [];
      console.log('Updated assignees:', assigneeIds);
      
      setCurrentAssignees(assigneeIds);
      setCurrentTask(prevTask => ({
        ...prevTask,
        assignees: assigneeIds
      }));

      if (onUpdate) {
        onUpdate({
          ...currentTask,
          assignees: assigneeIds
        });
      }
    } catch (error) {
      console.error('Error fetching assignees:', error);
      toast({
        title: "Error",
        description: "Failed to update assignees. Please try again.",
        variant: "destructive",
      });
    }
  };

  useTaskSubscriptions({
    taskId: task.id,
    onTaskUpdate: (updatedTask: Task) => {
      console.log('Task subscription update received:', updatedTask);
      setCurrentTask(prevTask => ({
        ...prevTask,
        ...updatedTask,
        description: updatedTask.description || prevTask.description,
        tags: updatedTask.tags || prevTask.tags || [],
        assignees: updatedTask.assignees || currentAssignees
      }));
    },
    onAssigneesUpdate: handleAssigneesUpdate
  });

  useAssigneeSync(task.id, handleAssigneesUpdate);

  const onTaskUpdate = async (updatedTask: Task) => {
    await handleTaskUpdate(
      updatedTask,
      currentTask,
      currentAssignees,
      setCurrentTask,
      setCurrentAssignees,
      onUpdate
    );
  };

  const handleMouseEnter = () => {
    if (!isDialogOpen) {
      prefetchTaskData(task.id);
    }
  };

  const safeTask: Task = {
    ...currentTask,
    tags: tags || [], 
    assignees: currentAssignees,
    dependencies: currentTask?.dependencies || [],
    comments,
    checklist,
    attachments: currentTask?.attachments || [],
  };

  const { progress: checklistProgress, completedItems, totalItems } = calculateChecklistProgress(checklist);
  const progressColor = getProgressColor(checklistProgress);
  const assignedUsers = mapAssignedUsers(users, currentAssignees);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="kanban-card relative group cursor-pointer"
      style={{
        '--progress-color': progressColor,
        backgroundColor: `${progressColor}10`,
        borderLeft: `4px solid ${progressColor}`,
        ...provided.draggableProps.style
      } as React.CSSProperties}
      onClick={() => setIsDialogOpen(true)}
      onMouseEnter={() => {
        if (!isDialogOpen) {
          prefetchTaskData(task.id);
        }
      }}
    >
      <div className="p-4 space-y-4">
        <TaskCardWrapper
          task={safeTask}
          checklistProgress={checklistProgress}
          completedItems={completedItems}
          totalItems={totalItems}
          progressColor={progressColor}
          assignedUsers={assignedUsers}
          isLoadingUsers={isLoadingUsers}
          isDialogOpen={isDialogOpen}
          currentColumn={currentColumn}
          isNewTask={isNewTask}
          columnColors={columnColors}
          isDragging={isDragging}
          onUpdate={onTaskUpdate}
          onDialogClose={() => setIsDialogOpen(false)}
        />

        <TaskMetadata
          task={safeTask}
          checklistProgress={checklistProgress}
          completedItems={completedItems}
          totalItems={totalItems}
          assignedUsers={assignedUsers}
          isLoadingUsers={isLoadingUsers}
          progressColor={progressColor}
        />

        {onUpdate && (
          <TaskCardActions task={safeTask} onUpdate={onTaskUpdate} />
        )}
      </div>
    </div>
  );
};

export default TaskCard;