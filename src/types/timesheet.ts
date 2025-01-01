export type TimeEntryType = 
  | 'Standard Time'
  | 'Overtime'
  | 'Double-Time'
  | 'Non-Billable'
  | 'Billable'
  | 'Holiday'
  | 'PTO'
  | 'Sick Day'
  | 'Vacation Day'
  | 'Personal Day';

export interface TimeEntry {
  project: string;
  type: TimeEntryType;
  hours: { [key: string]: string };
  total: number;
}

// Sample projects for the dropdown
export const AVAILABLE_PROJECTS = [
  'Consulting Partners:Internal',
  'Consulting Partners:Pre-Sales Work',
  'Consulting Partners:Training',
  'Consulting Partners:Admin',
  'Client A:Development',
  'Client B:Support',
  'Time Off:Holiday',
  'Time Off:PTO',
  'Time Off:Sick Day',
  'Time Off:Vacation',
  'Time Off:Personal Day',
] as const;