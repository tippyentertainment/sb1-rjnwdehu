export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'planned';
  team_id: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  sprint_id: string;
  assigned_to: string;
  story_points: number;
}