import React from 'react';
import { useParams } from 'react-router-dom';
import { useSprintStore } from '../stores/sprintStore';
import type { Task } from '../types/sprint';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: Task['status'];
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, tasks, status, onStatusChange }) => (
  <div className="flex flex-col bg-gray-100 p-4 rounded-lg min-w-[300px]">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-3">
      {tasks.filter(task => task.status === status).map((task) => (
        <div
          key={task.id}
          className="bg-white p-3 rounded shadow-sm"
          draggable
          onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        >
          <h4 className="font-medium">{task.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Points: {task.story_points}
            </span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
              className="text-sm border rounded p-1"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TaskBoard: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const { tasks, loading, error, fetchTasks, updateTaskStatus } = useSprintStore();

  React.useEffect(() => {
    if (sprintId) {
      fetchTasks(sprintId);
    }
  }, [sprintId, fetchTasks]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sprint Tasks</h2>
      <div className="flex gap-6 overflow-x-auto pb-4">
        <TaskColumn
          title="Todo"
          tasks={tasks}
          status="todo"
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn
          title="In Progress"
          tasks={tasks}
          status="in_progress"
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn
          title="Done"
          tasks={tasks}
          status="done"
          onStatusChange={updateTaskStatus}
        />
      </div>
    </div>
  );
};