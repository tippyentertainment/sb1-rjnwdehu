import React from 'react';
import { MessageSquare, Paperclip, Tag as TagIcon, CheckSquare, Image as ImageIcon } from 'lucide-react';
import type { Task } from '@/types/task';
import type { User } from '@/types/task';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { TaskStats } from './TaskCard/Metadata/TaskStats';
import { TaskTags } from './TaskCard/Metadata/TaskTags';
import AssigneeAvatars from './TaskCard/AssigneeAvatars';

interface TaskMetadataProps {
  task: Task;
  checklistProgress: number;
  completedItems: number;
  totalItems: number;
  assignedUsers?: User[];
  isLoadingUsers?: boolean;
  progressColor?: string;
  onUserClick?: (userId: string) => void;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({
  task,
  checklistProgress,
  completedItems,
  totalItems,
  assignedUsers = [],
  isLoadingUsers = false,
  progressColor,
  onUserClick,
}) => {
  console.log('TaskMetadata rendering with assigned users:', assignedUsers);
  console.log('Task tags:', task.tags);

  // Extract valid user IDs
  const validUserIds = assignedUsers
    .map(user => typeof user === 'object' && user !== null ? user.id : user)
    .filter((id): id is string => typeof id === 'string');

  const { data: profiles } = useQuery({
    queryKey: ['profiles', validUserIds],
    queryFn: async () => {
      if (!validUserIds.length) return [];
      
      console.log('Fetching profiles for IDs:', validUserIds);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, status, is_online')
        .in('id', validUserIds);
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      
      console.log('Fetched profiles for status:', profiles);
      return profiles || [];
    },
    enabled: validUserIds.length > 0
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <TaskStats
          task={task}
          completedItems={completedItems}
          totalItems={totalItems}
          progressColor={progressColor}
        />
      </div>
      {assignedUsers.length > 0 && (
        <div className="mt-2">
          <AssigneeAvatars 
            assignedUsers={assignedUsers} 
            profiles={profiles || []}
            onUserClick={onUserClick}
          />
        </div>
      )}
      <TaskTags tags={task.tags || []} />
    </div>
  );
};

export default TaskMetadata;