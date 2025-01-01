import { supabase } from '@/integrations/supabase/client';

export const getOrganizationMembers = async (organizationId: string) => {
  console.log('Fetching members for organization:', organizationId);
  
  const { data: members, error } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      profiles (
        id,
        email,
        username,
        avatar_url,
        full_name
      )
    `)
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }

  console.log('Found members:', members);
  return members;
};