import { Task } from './task';

export type CustomField = {
  id: string;
  name: string;
  type: 'tag' | 'text' | 'number';
  options?: string[];
};

export type RunTag = {
  id: string;
  name: string;
  color: string;
  category: string;
};

export type RaciMember = {
  id: string;
  name: string;
  role: 'responsible' | 'accountable' | 'consulted' | 'informed';
};

export type Scope = {
  id: string;
  name: string;
  description: string;
  vision: string;
  features: string[];
  acceptanceCriteria: string[];
  runIds: string[];
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  progress?: number;
  teamMembers?: RaciMember[];
};

export type Run = {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  status: 'planned' | 'active' | 'completed';
  customFields?: Record<string, string>;
  tags: RunTag[];
  scopeId?: string;
  goals: string[];
  metrics: {
    planned: number;
    completed: number;
    pace: number;
  };
  organization_members?: Array<{
    profiles?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  dailyScrums?: {
    date: Date;
    notes: string;
    blockers: string[];
  }[];
  retrospective?: {
    strengths: string[];
    improvements: string[];
    actions: string[];
  };
  review?: {
    completedItems: string[];
    feedback: string[];
    nextSteps: string[];
  };
};

export type { Task } from './task';