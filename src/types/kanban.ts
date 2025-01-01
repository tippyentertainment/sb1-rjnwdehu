import { Task } from './task';

export interface TasksByColumn {
  [key: string]: Task[];
}

export interface KanbanColumnProps {
  id: string;
  columnId: string;
  name: string;
  tasks: Task[];
  color: string;
  columnColors: Record<string, string>;
  icon?: React.ReactNode;
}

export type SetTasksFunction = React.Dispatch<React.SetStateAction<TasksByColumn>>;