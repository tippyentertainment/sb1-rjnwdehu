import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timesheet';
import { format } from 'date-fns';

export const useTimesheetData = (selectedDate: Date, userId?: string) => {
  const queryClient = useQueryClient();

  const fetchTimesheet = async () => {
    console.log('Fetching timesheet for week ending:', format(selectedDate, 'yyyy-MM-dd'));
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('week_ending', format(selectedDate, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching timesheet:', error);
      throw error;
    }

    return data || [];
  };

  const { data: timesheetData, isLoading } = useQuery({
    queryKey: ['timesheet', selectedDate, userId],
    queryFn: fetchTimesheet,
    enabled: !!userId,
  });

  const saveTimesheet = async (entries: TimeEntry[]) => {
    console.log('Saving timesheet entries:', entries);
    const { error } = await supabase
      .from('timesheet_entries')
      .upsert(
        entries.map(entry => ({
          user_id: userId,
          week_ending: format(selectedDate, 'yyyy-MM-dd'),
          project: entry.project,
          type: entry.type,
          hours: entry.hours,
          total: entry.total,
          status: 'draft'
        }))
      );

    if (error) {
      console.error('Error saving timesheet:', error);
      throw error;
    }
  };

  const submitTimesheet = async () => {
    console.log('Submitting timesheet for review');
    const { error } = await supabase
      .from('timesheet_entries')
      .update({ status: 'submitted' })
      .eq('user_id', userId)
      .eq('week_ending', format(selectedDate, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  };

  const saveMutation = useMutation({
    mutationFn: saveTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    },
  });

  return {
    timesheetData,
    isLoading,
    saveTimesheet: saveMutation.mutate,
    submitTimesheet: submitMutation.mutate,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
};