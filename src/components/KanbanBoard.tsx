import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import KanbanColumn from './KanbanColumn';
import { DEFAULT_COLUMNS } from './Kanban/kanbanData';
import { Clock, Clipboard, CheckCircle2, AlertCircle, Archive, Eye, Clock3 } from 'lucide-react';
import KanbanHeader from './Kanban/KanbanHeader';
import { useFilteredTasks } from '@/hooks/useFilteredTasks';
import ListView from './Kanban/Views/ListView';
import { RealtimeSubscriptions } from './Kanban/RealtimeSubscriptions';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { useKanbanLoading } from '@/hooks/useKanbanLoading';
import type { Task } from '@/types/task';
import type { TasksByColumn, SetTasksFunction } from '@/types/kanban';

const TASKS_PER_PAGE = 20;

const KanbanBoard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState('all');
  const [view, setView] = useState('board');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    tasks,
    setTasks,
    organizationId,
    isLoading,
    error,
    refetch
  } = useKanbanBoard();

  console.log('Current tasks state:', tasks);

  const loadMoreTasks = async () => {
    if (!organizationId) return;
    
    const nextPage = page + 1;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', organizationId)
      .range((nextPage - 1) * TASKS_PER_PAGE, nextPage * TASKS_PER_PAGE - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading more tasks:', error);
      return;
    }

    if (data.length < TASKS_PER_PAGE) {
      setHasMore(false);
    }

    setTasks((prevTasks: TasksByColumn) => {
      const newTasks = { ...prevTasks };
      data.forEach((task: Task) => {
        const status = task.status || 'To Do';
        newTasks[status] = [...(newTasks[status] || []), task];
      });
      return newTasks;
    });
    setPage(nextPage);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('No valid session found, redirecting to login');
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }
    };

    checkAuth();
  }, [toast]);

  useEffect(() => {
    if (!organizationId) return;

    console.log('Setting up realtime subscription for tasks');
    
    const channel = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `organization_id=eq.${organizationId}`
        },
        async (payload) => {
          console.log('Task change detected:', payload);
          await refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [organizationId, refetch]);

  const { handleDragEnd } = useDragAndDrop({ 
    setTasks,
    tasks,
    refetch 
  });

  const filteredTasks = useFilteredTasks({
    tasks,
    searchTerm,
    sortBy,
    selectedUser
  });

  const loadingState = useKanbanLoading(isLoading, error);
  if (loadingState) return loadingState;

  const columnColors = DEFAULT_COLUMNS.reduce((acc, column) => ({
    ...acc,
    [column.id]: column.color
  }), {});

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'To Do':
        return <Clipboard className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Blocked':
        return <AlertCircle className="h-4 w-4" />;
      case 'Backlog':
        return <Archive className="h-4 w-4" />;
      case 'Needs Review':
        return <Eye className="h-4 w-4" />;
      case 'Pending':
        return <Clock3 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderView = () => {
    const content = view === 'list' ? (
      <ListView
        tasks={Object.values(filteredTasks).flat().map((task: Task) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          assignees: task.assignees?.map(assigneeId => ({
            id: assigneeId,
            avatar_url: `https://avatar.vercel.sh/${assigneeId}.png`,
            full_name: 'User ' + assigneeId.slice(0, 4)
          })) || []
        }))}
        columnColors={columnColors}
        onTaskUpdate={(task) => {
          console.log('Task updated:', task);
          refetch();
        }}
      />
    ) : (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {DEFAULT_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              columnId={column.id}
              name={column.name}
              tasks={filteredTasks[column.id] || []}
              color={column.color}
              columnColors={columnColors}
              icon={getColumnIcon(column.id)}
            />
          ))}
        </div>
      </DragDropContext>
    );

    return (
      <InfiniteScroll
        fetchMore={loadMoreTasks}
        hasMore={hasMore}
        className="flex-1 overflow-x-hidden"
      >
        {content}
      </InfiniteScroll>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <RealtimeSubscriptions 
        organizationId={organizationId} 
        onUpdate={refetch}
      />
      <KanbanHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedUser={selectedUser}
        onUserChange={setSelectedUser}
        view={view}
        onViewChange={setView}
      />
      {renderView()}
    </div>
  );
};

export default KanbanBoard;
