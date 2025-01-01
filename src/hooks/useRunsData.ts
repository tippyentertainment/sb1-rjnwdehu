import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Run } from '@/types/sprint';

export const useRunsData = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const { data: runsData, error } = await supabase
        .from('runs')
        .select(`
          *,
          organization_members:organization_members(
            profiles(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRuns = runsData.map(run => ({
        ...run,
        startDate: new Date(run.start_date),
        endDate: new Date(run.end_date),
        organization_members: run.organization_members?.map((member: any) => ({
          profiles: member.profiles
        })) || [],
        tasks: [], // Will be populated when needed
        tags: [], // Will be populated when needed
      }));

      console.log('Fetched runs:', formattedRuns);
      setRuns(formattedRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast({
        title: "Error fetching runs",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRun = async (run: Run) => {
    try {
      const { error } = await supabase
        .from('runs')
        .update({
          name: run.name,
          description: run.description,
          start_date: run.startDate,
          end_date: run.endDate,
          status: run.status,
          goals: run.goals,
          metrics: run.metrics,
          scope_id: run.scopeId
        })
        .eq('id', run.id);

      if (error) throw error;

      toast({
        title: "Run updated",
        description: "The run has been updated successfully"
      });

      await fetchRuns();
    } catch (error) {
      console.error('Error updating run:', error);
      toast({
        title: "Error updating run",
        description: "Failed to update run. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createRun = async (run: Omit<Run, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No authenticated user');

      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single();

      if (orgError) throw orgError;

      const { error } = await supabase
        .from('runs')
        .insert({
          name: run.name,
          description: run.description,
          start_date: run.startDate,
          end_date: run.endDate,
          status: run.status || 'planned',
          goals: run.goals || [],
          metrics: run.metrics || { planned: 0, completed: 0, pace: 0 },
          scope_id: run.scopeId,
          organization_id: orgData.organization_id,
          created_by: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Run created",
        description: "The run has been created successfully"
      });

      await fetchRuns();
    } catch (error) {
      console.error('Error creating run:', error);
      toast({
        title: "Error creating run",
        description: "Failed to create run. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  return {
    runs,
    loading,
    updateRun,
    createRun
  };
};