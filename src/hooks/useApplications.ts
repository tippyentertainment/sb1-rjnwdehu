import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from '@/components/Settings/Organization/OrganizationContext';
import { Database } from '@/integrations/supabase/types';
import _ from 'lodash';

type AccessProfile = Database['public']['Tables']['access_profiles']['Row'];

export const useApplications = () => {
  const [applications, setApplications] = useState<AccessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { organization } = useOrganization();

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications with organization:', organization?.id);
      if (!organization?.id) {
        console.log('No organization ID available');
        setApplications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('Fetching applications for organization:', organization.id);
      
      const { data, error: fetchError } = await supabase
        .from('access_profiles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('type', 'application');

      if (fetchError) {
        console.error('Error fetching applications:', fetchError);
        throw fetchError;
      }

      console.log('Successfully fetched applications:', data);
      
      // Remove any duplicates using lodash
      const uniqueApplications = _.uniqBy(data || [], 'id');
      setApplications(uniqueApplications);
      setError(null);
    } catch (err) {
      console.error('Error in fetchApplications:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useApplications effect triggered with organization:', organization?.id);
    fetchApplications();

    // Set up realtime subscription
    const channel = supabase
      .channel('applications_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'access_profiles',
          filter: organization?.id ? `organization_id=eq.${organization.id} AND type=eq.application` : undefined
        }, 
        (payload) => {
          console.log('Applications change received:', payload);
          fetchApplications();
        }
      )
      .subscribe((status) => {
        console.log('Applications subscription status:', status);
      });

    return () => {
      console.log('Cleaning up applications subscription');
      supabase.removeChannel(channel);
    };
  }, [organization?.id]); // Only depend on organization.id

  return { applications, isLoading, error };
};