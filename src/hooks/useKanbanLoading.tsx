import { Task } from '@/types/task';

export const useKanbanLoading = (isLoading: boolean, error: string | null) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading tasks: {error}
      </div>
    );
  }

  return null;
};