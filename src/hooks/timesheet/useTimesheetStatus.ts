import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const useTimesheetStatus = (selectedDate: Date, userId?: string) => {
  const fetchStatus = async () => {
    console.log('Fetching timesheet status for:', format(selectedDate, 'yyyy-MM-dd'));
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('status, reviewed_at, reviewer_id')
      .eq('user_id', userId)
      .eq('week_ending', format(selectedDate, 'yyyy-MM-dd'))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching timesheet status:', error);
      throw error;
    }

    return data;
  };

  return useQuery({
    queryKey: ['timesheet-status', selectedDate, userId],
    queryFn: fetchStatus,
    enabled: !!userId,
  });
};