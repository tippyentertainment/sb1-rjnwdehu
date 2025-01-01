export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  organization_name: string | null;
  organization_role: string | null;
  title: string | null;
  bio: string | null;
  status: 'online' | 'offline' | 'busy';
  is_online: boolean;
  organization_id: string | null;
  updated_at: string;  // Required timestamp
  created_at: string;  // Required timestamp
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  created_at: string;  // Required for database compatibility
  metadata: {
    thumbnails: string[];
    mentions: string[];
  };
}

export type TaskComment = Comment;

export interface Tag {
  id: string;
  name: string;
  color: string;
  organization_id?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  mentions?: string[];
}

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  dependencyTaskId: string;
  type: 'blocks' | 'blocked-by';
  createdAt: Date;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
}

export interface ColumnConfig {
  id: string;
  name: string;
  title: string;
  status: string;
  color: string;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  deleted?: boolean;
  sprint_id?: string;
  scope_id?: string;
  organization_id?: string;
  assignees: string[];
  tags: Tag[];
  dependencies: TaskDependency[];
  comments: Comment[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  cover_image?: string;
  completion_percentage?: number;
}

export interface TasksByColumn {
  [key: string]: Task[];
}

export type SetTasksFunction = React.Dispatch<React.SetStateAction<TasksByColumn>>;