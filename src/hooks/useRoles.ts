import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/components/Settings/Organization/OrganizationContext';

interface Role {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

export const useRoles = () => {
  const { organization } = useOrganization();

  const { data: role, isLoading, error } = useQuery({
    queryKey: ['roles', organization?.id],
    queryFn: async () => {
      console.log('Fetching roles for organization:', organization?.id);
      
      if (!organization?.id) {
        console.log('No organization ID available');
        return [];
      }

      const { data: roles, error } = await supabase
        .from('access_profiles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('type', 'role');

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      console.log('Fetched roles:', roles);
      return roles;
    },
    enabled: !!organization?.id,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    role: role || [],
    isLoading,
    error
  };
};