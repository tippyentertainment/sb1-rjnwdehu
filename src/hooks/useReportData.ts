import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { ReportTask, ReportRun, ReportScope } from '@/types/reports';

export const useReportData = () => {
  const [tasks, setTasks] = useState<ReportTask[]>([]);
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const [scopes, setScopes] = useState<ReportScope[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching report data...');

      // Get user's organization context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user');
      }

      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }

      console.log('Fetching data for organization:', orgData.organization_id);
      
      // Fetch tasks with related data
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignees (
            user_id,
            profiles (
              id,
              full_name,
              avatar_url
            )
          ),
          task_tags (
            tags (
              id,
              name,
              color
            )
          ),
          task_comments (
            id,
            content,
            created_at,
            user_id,
            metadata
          ),
          checklist_items (
            id,
            title,
            completed
          ),
          attachments (
            id,
            file_name,
            file_path
          )
        `)
        .eq('organization_id', orgData.organization_id)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }
      console.log('Tasks fetched:', tasksData?.length);

      // Fetch runs with team members
      const { data: runsData, error: runsError } = await supabase
        .from('runs')
        .select(`
          *,
          organization_id,
          profiles!runs_created_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', orgData.organization_id)
        .order('created_at', { ascending: false });

      if (runsError) {
        console.error('Error fetching runs:', runsError);
        throw new Error(`Failed to fetch runs: ${runsError.message}`);
      }
      console.log('Runs fetched:', runsData?.length);

      // If we need team members for each run, fetch them separately
      const runsWithMembers = await Promise.all(
        (runsData || []).map(async (run) => {
          const { data: members, error: membersError } = await supabase
            .from('organization_members')
            .select(`
              profiles (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('organization_id', run.organization_id);

          if (membersError) {
            console.error('Error fetching members for run:', run.id, membersError);
            return run;
          }

          return {
            ...run,
            organization_members: members?.map(m => m.profiles) || []
          };
        })
      );

      // Fetch scopes with features
      const { data: scopesData, error: scopesError } = await supabase
        .from('scopes')
        .select(`
          *,
          runs (
            id,
            status
          )
        `)
        .eq('organization_id', orgData.organization_id)
        .order('created_at', { ascending: false });

      if (scopesError) {
        console.error('Error fetching scopes:', scopesError);
        throw new Error(`Failed to fetch scopes: ${scopesError.message}`);
      }
      console.log('Scopes fetched:', scopesData?.length);

      // Process tasks data
      const processedTasks = tasksData?.map(task => ({
        ...task,
        assignees: task.task_assignees?.map(ta => ta.user_id) || [],
        tags: task.task_tags?.map(tt => tt.tags) || [],
        comments: task.task_comments || [],
        checklist: task.checklist_items || [],
        attachments: task.attachments || []
      })) || [];

      // Process scopes data
      const processedScopes = scopesData?.map(scope => ({
        ...scope,
        features: scope.vision ? scope.vision.split('\n').filter(Boolean) : [],
        runIds: scope.runs?.filter(run => run.status === 'active').map(run => run.id) || []
      })) || [];

      setTasks(processedTasks);
      setRuns(runsWithMembers || []);
      setScopes(processedScopes);
      setMetrics(metrics || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load report data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  return {
    tasks,
    runs,
    scopes,
    metrics,
    isLoading,
    error
  };
};