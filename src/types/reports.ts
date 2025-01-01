import { Task, TaskDependency, Attachment, Comment } from './task';
import { Tag } from './tag';

export interface MetricsData {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
  };
  runs: {
    total: number;
    active: number;
    completed: number;
    planned: number;
  };
  scopes: {
    total: number;
    active: number;
    completed: number;
  };
}

export interface ReportTask extends Omit<Task, 'checklist'> {
  assignees: string[];
  tags: Tag[];
  comments: Comment[];
  checklist: Array<{
    id: string;
    title: string;
    completed: boolean;
    createdAt?: Date | string;
    mentions?: string[];
  }>;
  dependencies: TaskDependency[];
  attachments: Attachment[];
}

export interface ReportRun {
  id: string;
  name: string;
  description?: string;
  status: string;
  organization_members?: Array<{
    profiles?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  metrics?: {
    completed: number;
    planned: number;
  };
}

export interface ReportScope {
  id: string;
  name: string;
  description?: string;
  vision?: string;
  features?: string[];
  runIds?: string[];
  status?: string;
}