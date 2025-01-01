import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import KanbanColumnContent from './Kanban/KanbanColumnContent';
import ColumnHeader from './Kanban/ColumnHeader';
import type { Task } from '@/types/task';

interface KanbanColumnProps {
  id: string;
  columnId: string;
  name: string;
  tasks: Task[];
  color: string;
  columnColors: Record<string, string>;
  icon?: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  columnId,
  name,
  tasks = [],
  color,
  columnColors,
  icon
}) => {
  console.log('Column rendering with ID:', columnId, 'and tasks:', tasks);

  return (
    <div className="kanban-column" data-status={columnId}>
      <ColumnHeader
        color={color}
        name={name}
        count={tasks.length}
        icon={icon}
      />
      <ScrollArea className="h-[calc(100vh-200px)]">
        <Droppable droppableId={columnId}>
          {(provided) => (
            <KanbanColumnContent
              tasks={tasks}
              columnId={columnId}
              provided={provided}
              columnColors={columnColors}
            />
          )}
        </Droppable>
      </ScrollArea>
    </div>
  );
};

export default KanbanColumn;