import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from '@/components/Settings/Organization/OrganizationContext';
import { useEffect } from 'react';

const STORAGE_KEY = 'tasking_access_requests_state';

export const useAccessRequestsList = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();

  const { data: requests = [], ...queryResult } = useQuery({
    queryKey: ['access_requests', organization?.id],
    queryFn: async () => {
      console.log('Fetching access requests for organization:', organization?.id);
      
      if (!organization?.id) {
        console.log('No organization ID available');
        return [];
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return [];
        }

        const { data: requests, error } = await supabase
          .from('access_requests')
          .select(`
            *,
            profiles:request_for_id (
              full_name,
              email
            ),
            profile:profile_id (
              name,
              description
            ),
            reviewer:reviewed_by (
              full_name
            )
          `)
          .eq('organization_id', organization.id)
          .or(`requester_id.eq.${user.id},request_for_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching access requests:', error);
          throw error;
        }

        console.log('Successfully fetched access requests:', requests);
        return requests || [];
      } catch (error) {
        console.error('Error in useAccessRequestsList:', error);
        toast({
          title: "Error",
          description: "Failed to load access requests",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!organization?.id,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!organization?.id) return;

    console.log('Setting up realtime subscription for access requests');
    
    const channel = supabase
      .channel('access_requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'access_requests',
          filter: `organization_id=eq.${organization.id}` 
        }, 
        async (payload) => {
          console.log('Realtime update received:', payload);
          queryResult.refetch();
        }
      )
      .subscribe((status) => {
        console.log('Access requests subscription status:', status);
      });

    return () => {
      console.log('Cleaning up access requests subscription');
      channel.unsubscribe();
    };
  }, [organization?.id, queryResult.refetch]);

  return {
    requests,
    ...queryResult
  };
};