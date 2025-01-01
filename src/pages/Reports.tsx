import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickAccessLists from '@/components/Reports/QuickAccessLists';
import ProjectMetrics from '@/components/Reports/ProjectMetrics';
import UserTasksReport from '@/components/Reports/UserTasksReport';
import { useToast } from "@/components/ui/use-toast";
import { useReportData } from '@/hooks/useReportData';
import type { MetricsData, ReportTask } from '@/types/reports';
import type { Task } from '@/types/task';

interface TabConfig {
  id: 'tasks' | 'userTasks' | 'runs' | 'scopes';
  label: string;
  content: (props: TabContentProps) => JSX.Element;
}

interface TabContentProps {
  tasks: Task[];
  runs: any[];
  scopes: any[];
  onSelectItem: (type: 'task' | 'run' | 'scope', id: string) => Promise<void>;
  onUpdateDates: (type: string, id: string, startDate?: Date, endDate?: Date) => Promise<void>;
}

const Reports = () => {
  const { tasks = [], runs = [], scopes = [], metrics = [], isLoading, error } = useReportData();
  const { toast } = useToast();

  // Error handling effect
  React.useEffect(() => {
    if (error) {
      console.error('Reports page error:', error);
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const calculateMetrics = React.useCallback((): MetricsData => {
    const taskList = Array.isArray(tasks) ? tasks : [];
    const runList = Array.isArray(runs) ? runs : [];
    const scopeList = Array.isArray(scopes) ? scopes : [];

    return {
      tasks: {
        total: taskList.length,
        completed: taskList.filter(t => t?.status === 'Completed').length,
        inProgress: taskList.filter(t => t?.status === 'In Progress').length,
        blocked: taskList.filter(t => t?.status === 'Blocked').length,
      },
      runs: {
        total: runList.length,
        active: runList.filter(r => r?.status === 'active').length,
        completed: runList.filter(r => r?.status === 'completed').length,
        planned: runList.filter(r => r?.status === 'planned').length,
      },
      scopes: {
        total: scopeList.length,
        active: scopeList.filter(s => s?.status !== 'completed').length,
        completed: scopeList.filter(s => s?.status === 'completed').length,
      }
    };
  }, [tasks, runs, scopes]);

  const handleSelectItem = React.useCallback(async (type: 'task' | 'run' | 'scope', id: string) => {
    console.log(`Selected ${type} with id: ${id}`);
  }, []);

  const handleUpdateDates = React.useCallback(async (
    type: string,
    id: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    console.log(`Updating dates for ${type} ${id}:`, { startDate, endDate });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading reports data...</div>
        </div>
      </div>
    );
  }

  // Convert tasks with proper type checking
  const convertedTasks: Task[] = (tasks || []).map((task: ReportTask) => ({
    ...task,
    checklist: (task.checklist || []).map(item => ({
      ...item,
      createdAt: new Date(item.createdAt || Date.now()),
      mentions: Array.isArray(item.mentions) ? item.mentions : []
    })),
    assignees: Array.isArray(task.assignees) ? task.assignees : [],
    tags: Array.isArray(task.tags) ? task.tags : [],
    dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
    comments: Array.isArray(task.comments) ? task.comments : [],
    attachments: Array.isArray(task.attachments) ? task.attachments : []
  }));

  const tabConfig: TabConfig[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      content: (props) => <QuickAccessLists {...props} />,
    },
    {
      id: 'userTasks',
      label: 'Tasks by User',
      content: ({ tasks }) => <UserTasksReport tasks={tasks} />,
    },
    {
      id: 'runs',
      label: 'Runs',
      content: (props) => (
        <QuickAccessLists
          {...props}
          tasks={[]}
          scopes={[]}
        />
      ),
    },
    {
      id: 'scopes',
      label: 'Scopes',
      content: (props) => (
        <QuickAccessLists
          {...props}
          tasks={[]}
          runs={[]}
        />
      ),
    },
  ];

  const commonProps: TabContentProps = {
    tasks: convertedTasks,
    runs,
    scopes,
    onSelectItem: handleSelectItem,
    onUpdateDates: handleUpdateDates,
  };

  return (
    <div className="container mx-auto py-6">
      <ProjectMetrics data={calculateMetrics()} />
      
      <div className="mt-8">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            {tabConfig.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.content(commonProps)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
