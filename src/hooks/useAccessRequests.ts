import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/components/Settings/Organization/OrganizationContext';

export const submitAccessRequest = async (
  profileId: string,
  requestForId: string | null,
  organizationId: string
) => {
  console.log('Submitting access request with:', {
    profileId,
    requestForId,
    organizationId
  });

  if (!organizationId) {
    throw new Error('Organization ID is required');
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }

    if (!user?.id) {
      throw new Error('No authenticated user found');
    }

    const { data, error } = await supabase
      .from('access_requests')
      .insert([
        {
          profile_id: profileId,
          requester_id: user.id,
          request_for_id: requestForId || user.id,
          organization_id: organizationId,
          status: 'pending'
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error submitting access request:', error);
      throw error;
    }

    console.log('Access request submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in submitAccessRequest:', error);
    throw error;
  }
};

export const useAccessRequests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const submitRequest = async (profileId: string, requestForId: string | null = null) => {
    try {
      console.log('Starting access request submission...');
      setIsLoading(true);

      if (!organization?.id) {
        console.error('No organization context available');
        toast({
          title: "Error",
          description: "Organization context is not available. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const result = await submitAccessRequest(profileId, requestForId, organization.id);
      
      toast({
        title: "Success",
        description: "Access request submitted successfully",
      });

      return result;
    } catch (error: any) {
      console.error('Error in submitRequest:', error);
      const errorMessage = error.message || "Failed to submit access request. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitRequest,
    isLoading
  };
};